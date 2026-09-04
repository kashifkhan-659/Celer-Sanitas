import { Router } from 'express';
import { pathToFileURL } from 'node:url';
import { waitUntil } from '@vercel/functions';
import { loadTree } from '../services/tree/loadTree.js';
import { saveSession } from '../services/firestore/saveSession.js';
import { getSession } from '../services/firestore/getSession.js';
import { getPhrasedQuestion, classifyFreeText } from '../controllers/intake.controller.js';
import { ensureSummary } from '../controllers/summary.controller.js';

const router = Router();

// --- AI-assisted intake (Jobs A and B). Both delegate to the controller; no AI call is inlined
// here (handoff §6). The tree and session routes below are unchanged and still AI-free.
router.get('/intake/:category/:nodeId/question', getPhrasedQuestion);
router.post('/intake/:category/:nodeId/classify', classifyFreeText);

// GET /api/trees/:category — returns the symptom-tree JSON for the patient client to render.
// Thin handler (Rules.md §4): validate → call service → respond. loadTree guards the category.
router.get('/trees/:category', (req, res) => {
  try {
    res.json(loadTree(req.params.category));
  } catch (err) {
    const notFound = /invalid category|not found|missing|ENOENT/i.test(err.message);
    res.status(notFound ? 404 : 500).json({ error: notFound ? 'tree not found' : 'internal error' });
  }
});

// POST /api/sessions — persist a completed intake transcript.
// Body: { patientName, patientAge, symptomCategory, answers: [{ nodeId, question, optionId, answer }] }
// Writes go through the Admin SDK server-side; the client never writes to Firestore directly.
router.post('/sessions', async (req, res) => {
  try {
    const { symptomCategory, answers, bodyMapRegion, patientName, patientAge } = req.body ?? {};
    validateSession(req.body ?? {}); // throws on bad input
    const result = await saveSession({ symptomCategory, answers, bodyMapRegion, patientName: patientName.trim(), patientAge });
    res.status(201).json(result); // { id, persisted }

    // Kick off Job C AFTER responding — the patient is finished and must never wait on the
    // doctor's summary. Deliberately not awaited, so the catch is required: an unhandled rejection
    // here would take the process down.
    if (result.persisted) {
      background(ensureSummary(result.id).catch((err) => console.warn(`summary: background pass failed (${err.message})`)));
    }
  } catch (err) {
    const bad = /invalid|unknown|category|answers/i.test(err.message);
    res.status(bad ? 400 : 500).json({ error: bad ? 'invalid session' : 'internal error' });
  }
});

// GET /api/sessions/:id — retrieve a stored transcript (doctor view / summary use it later).
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await getSession(req.params.id);
    if (!session) return res.status(404).json({ error: 'session not found' });
    res.json(session);
  } catch (err) {
    // Distinguish "can't reach the store" (e.g. no service-account key yet) from a real bug, so a
    // missing key reads as 503, not a misleading 500/404. With the key present, misses return 404.
    const unavailable = /service account|not set|ENOENT|UNAVAILABLE|ECONNREFUSED/i.test(err.message);
    res.status(unavailable ? 503 : 500).json({ error: unavailable ? 'store unavailable' : 'internal error' });
  }
});

// Keep post-response work alive. Vercel freezes an invocation the moment the response is sent, so
// a bare unawaited promise would be suspended mid-Job-C and the summary would never appear —
// silently, since nothing errors. waitUntil holds the invocation open until it settles.
//
// Outside Vercel there is no request context and waitUntil throws. That is fine to swallow: a
// long-running local process is not torn down after responding, so the plain promise already runs
// to completion there. Same code path both places, no environment branch in the route itself.
function background(promise) {
  try {
    waitUntil(promise);
  } catch {
    // local dev — the promise is already running on its own
  }
}

// Trust-boundary validation. loadTree confirms the category exists; the answers transcript is
// assembled by the client from that same server-served tree (one source of truth). No real PII is
// collected (Rules.md §1) — this is synthetic Q&A only.
//
// Every message here must contain "invalid" — the catch above maps messages by regex, and one that
// misses would answer a bad request with 500 instead of 400.
export function validateSession({ symptomCategory, answers, patientName, patientAge }) {
  loadTree(symptomCategory); // throws on an invalid/unknown category

  // Name and age are collected once, before the tree starts. They identify the transcript for the
  // doctor and go no further — no job prompt ever receives them.
  if (typeof patientName !== 'string' || !patientName.trim()) throw new Error('invalid patientName');
  // Bounded because this string is written straight to Firestore; a name is not a free-text field.
  if (patientName.trim().length > 100) throw new Error('invalid patientName: too long');
  // 1-120, per spec's "positive integer". ponytail: excludes infants under 1 — widen the floor to 0
  // and carry age in months if paediatric intake ever lands.
  if (!Number.isInteger(patientAge) || patientAge < 1 || patientAge > 120) throw new Error('invalid patientAge');
  if (!Array.isArray(answers) || answers.length === 0) throw new Error('answers must be a non-empty array');
  for (const a of answers) {
    if (!a || typeof a.nodeId !== 'string' || typeof a.optionId !== 'string' || typeof a.answer !== 'string') {
      throw new Error('invalid answers entry');
    }
  }
}

export default router;

// Self-check: `npm run check:session`. Covers the new required fields and, critically, that every
// rejection message still matches the catch's bad-input regex — a message that misses it would turn
// a 400 into a 500, which no amount of reading the validator would reveal.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { strict: assert } = await import('node:assert');
  const BAD = /invalid|unknown|category|answers/i; // must stay identical to the catch above
  const answers = [{ nodeId: 'onset', question: 'When?', optionId: 'sudden', answer: 'Suddenly' }];
  const valid = { symptomCategory: 'chest_pain', answers, patientName: 'Ada Lovelace', patientAge: 36 };

  const rejects = (label, body) => {
    const err = (() => { try { validateSession(body); } catch (e) { return e; } })();
    assert.ok(err, `${label}: expected a rejection`);
    assert.match(err.message, BAD, `${label}: message "${err.message}" would be served as 500, not 400`);
  };

  assert.doesNotThrow(() => validateSession(valid), 'a complete payload passes');
  assert.doesNotThrow(() => validateSession({ ...valid, patientAge: 1 }), 'age 1 is the lower bound');
  assert.doesNotThrow(() => validateSession({ ...valid, patientAge: 120 }), 'age 120 is the upper bound');
  assert.doesNotThrow(() => validateSession({ ...valid, patientName: '  Ada  ' }), 'padded name passes');

  rejects('name missing', { ...valid, patientName: undefined });
  rejects('name empty', { ...valid, patientName: '' });
  rejects('name whitespace only', { ...valid, patientName: '   ' });
  rejects('name not a string', { ...valid, patientName: 42 });
  rejects('name too long', { ...valid, patientName: 'x'.repeat(101) });
  rejects('age missing', { ...valid, patientAge: undefined });
  rejects('age 0', { ...valid, patientAge: 0 });
  rejects('age negative', { ...valid, patientAge: -5 });
  rejects('age 121', { ...valid, patientAge: 121 });
  rejects('age fractional', { ...valid, patientAge: 36.5 });
  rejects('age as a string', { ...valid, patientAge: '36' });
  rejects('answers empty', { ...valid, answers: [] });
  rejects('answers entry malformed', { ...valid, answers: [{ nodeId: 'onset' }] });

  console.log('session validation self-check passed — 4 accepted, 13 rejected, all as 400.');
}

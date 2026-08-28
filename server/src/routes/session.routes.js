import { Router } from 'express';
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
// Body: { symptomCategory, answers: [{ nodeId, question, optionId, answer }] }
// Writes go through the Admin SDK server-side; the client never writes to Firestore directly.
router.post('/sessions', async (req, res) => {
  try {
    const { symptomCategory, answers, bodyMapRegion } = req.body ?? {};
    validateSession(symptomCategory, answers); // throws on bad input
    const result = await saveSession({ symptomCategory, answers, bodyMapRegion });
    res.status(201).json(result); // { id, persisted }

    // Kick off Job C AFTER responding — the patient is finished and must never wait on the
    // doctor's summary. Deliberately not awaited, so the catch is required: an unhandled rejection
    // here would take the process down. If it never runs (crash, restart), the dashboard's first
    // GET /summary generates it instead, so this is an optimisation, not the only path.
    if (result.persisted) {
      ensureSummary(result.id).catch((err) => console.warn(`summary: background pass failed (${err.message})`));
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

// Trust-boundary validation. loadTree confirms the category exists; the answers transcript is
// assembled by the client from that same server-served tree (one source of truth). No real PII is
// collected (Rules.md §1) — this is synthetic Q&A only.
function validateSession(symptomCategory, answers) {
  loadTree(symptomCategory); // throws on an invalid/unknown category
  if (!Array.isArray(answers) || answers.length === 0) throw new Error('answers must be a non-empty array');
  for (const a of answers) {
    if (!a || typeof a.nodeId !== 'string' || typeof a.optionId !== 'string' || typeof a.answer !== 'string') {
      throw new Error('invalid answers entry');
    }
  }
}

export default router;

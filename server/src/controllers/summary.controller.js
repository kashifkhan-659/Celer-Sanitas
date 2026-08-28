import { getSession } from '../services/firestore/getSession.js';
import { saveSummary } from '../services/firestore/saveSession.js';
import { summarizeSession } from '../services/ai/jobC.js';

// Summary controller — triggers Job C and persists whatever survives the safety gate (handoff §5).
//
// The gate itself lives inside jobC.js, not here, so it cannot be skipped by adding another caller.
// From this layer's point of view Job C simply returns a summary or null, and null always means the
// same thing: show the doctor the raw transcript instead (Rules.md §3, fail toward the
// deterministic path). A summary that did not clear the check is never written and never shown.

// In-flight de-duplication. POST /sessions kicks off a summary in the background while the doctor's
// dashboard may GET the same session moments later; without this, both start their own Job C call
// and one session burns two of the ~200 available per day. Callers arriving mid-generation join the
// run already happening instead of starting a second.
// ponytail: single-process Map — two server instances would still double up. Move the guard into
// the Firestore write (a status of 'summarizing' claimed by a transaction) only if this is scaled out.
const inFlight = new Map();

// Generate once, reuse forever. Idempotent: an already-summarised session returns its stored
// summary without spending another Job C call — which matters, because gpt-oss-120b is capped at
// 200K tokens/day and one summary costs ~1,000 of them.
export async function ensureSummary(sessionId, { force = false } = {}) {
  // A forced pass must NEVER join an in-flight unforced one. Joining would silently swallow the
  // force: the caller asking for a retry would receive the other run's result, and if that run was
  // the one short-circuiting on status 'error', the retry would return null without ever having
  // tried again. De-duplication is an optimisation for concurrent readers, not for an explicit
  // human "try this again".
  const running = inFlight.get(sessionId);
  if (running && !force) return running;

  const pass = generateSummary(sessionId, force).finally(() => {
    // Only clear the slot if it is still ours — a forced pass started alongside an unforced one
    // must not delete the other's entry when it finishes first.
    if (inFlight.get(sessionId) === pass) inFlight.delete(sessionId);
  });
  inFlight.set(sessionId, pass);
  return pass;
}

async function generateSummary(sessionId, force) {
  const session = await getSession(sessionId);
  if (!session) return { found: false };

  if (!force && session.summary) return { found: true, session, summary: session.summary };
  // A previous attempt already failed and was recorded; don't retry on every dashboard read.
  // An explicit POST (force) is how a human asks for another go.
  if (!force && session.status === 'error') return { found: true, session, summary: null };

  const summary = await summarizeSession({
    symptomCategory: session.symptomCategory,
    answers: session.answers,
    bodyMapRegion: session.bodyMapRegion,
  });

  try {
    await saveSummary(sessionId, summary);
  } catch (err) {
    // The summary is still returned below — a failed WRITE must not also cost the doctor the read.
    console.warn(`summary: could not persist for ${sessionId} (${err.message})`);
  }
  return { found: true, session, summary };
}

// Shape the response the dashboard renders. On success it gets the summary; on failure it gets the
// full transcript plus an explicit note, so the doctor loses convenience but never information.
function respond(res, { session, summary }) {
  if (summary) return res.json({ id: session.id, status: 'summarized', summary });
  res.json({
    id: session.id,
    // Derived from the outcome, never from `session.status` — that snapshot was read BEFORE
    // saveSummary ran, so it still says 'completed' and would tell the dashboard the summary is
    // merely pending when it has in fact been tried and rejected. Every path that reaches here
    // with no summary is a failure: one just recorded, or one recorded earlier and not retried.
    status: 'error',
    summary: null,
    note: 'summary unavailable — showing full intake.',
    symptomCategory: session.symptomCategory,
    answers: session.answers,
  });
}

function handle(force) {
  return async (req, res) => {
    try {
      const result = await ensureSummary(req.params.id, { force });
      if (!result.found) return res.status(404).json({ error: 'session not found' });
      respond(res, result);
    } catch (err) {
      // Same split as session.routes.js: a missing service-account key is 503, not a phantom 500.
      const unavailable = /service account|not set|ENOENT|UNAVAILABLE|ECONNREFUSED/i.test(err.message);
      res.status(unavailable ? 503 : 500).json({ error: unavailable ? 'store unavailable' : 'internal error' });
    }
  };
}

export const getSummary = handle(false);  // GET  — generates on first read, then serves the stored one
export const rebuildSummary = handle(true); // POST — explicit "try again", the only way past a failure

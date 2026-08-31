import { saveSummary } from '../services/firestore/saveSession.js';
import { claimSummary } from '../services/firestore/claimSummary.js';
import { summarizeSession } from '../services/ai/jobC.js';

// Summary controller — triggers Job C and persists whatever survives the safety gate (handoff §5).
//
// The gate itself lives inside jobC.js, not here, so it cannot be skipped by adding another caller.
// From this layer's point of view Job C simply returns a summary or null, and null always means the
// same thing: show the doctor the raw transcript instead (Rules.md §3, fail toward the
// deterministic path). A summary that did not clear the check is never written and never shown.
//
// De-duplication now lives in Firestore (claimSummary.js), not in a module-scoped Map. Under
// serverless the Map deduped nothing — concurrent invocations do not share memory — and one
// session could quietly cost two of the ~200 daily Job C calls.
//
// One behaviour changed with the move, unavoidably. The in-memory guard let a second caller AWAIT
// the first caller's promise and receive the same result; a promise cannot be shared across
// instances, so the second caller now gets `pending` instead and has to be told the work is still
// running. That is why 'pending' exists as a status: it is a third outcome, not a flavour of error.

// Generate once, reuse forever. Idempotent: an already-summarised session returns its stored
// summary without spending another Job C call — which matters, because gpt-oss-120b is capped at
// 200K tokens/day and one summary costs ~1,000 of them.
export async function ensureSummary(sessionId, { force = false } = {}) {
  // One transaction decides everything: does the session exist, is it already done, already failed,
  // already being worked on — and if none of those, it claims the run atomically. The session
  // snapshot comes back from inside that transaction, so there is no second read here.
  const claim = await claimSummary(sessionId, { force });
  if (!claim.found) return { found: false };

  if (!claim.claimed) {
    return {
      found: true,
      session: claim.session,
      summary: claim.session.summary ?? null,
      pending: Boolean(claim.pending),
    };
  }

  return runSummary(claim.session);
}

// Only ever reached by the caller that won the claim, so exactly one Job C call runs per session.
async function runSummary(session) {
  const summary = await summarizeSession({
    symptomCategory: session.symptomCategory,
    answers: session.answers,
    bodyMapRegion: session.bodyMapRegion,
  });

  try {
    await saveSummary(session.id, summary);
  } catch (err) {
    // The summary is still returned below — a failed WRITE must not also cost the doctor the read.
    // The claim stays set until it goes stale, which is the correct trade: a session whose result
    // could not be written should not be immediately re-run at full token cost.
    console.warn(`summary: could not persist for ${session.id} (${err.message})`);
  }
  return { found: true, session, summary };
}

// Shape the response the dashboard renders. On success it gets the summary; otherwise it gets the
// full transcript plus an explicit note, so the doctor loses convenience but never information.
function respond(res, { session, summary, pending }) {
  if (summary) return res.json({ id: session.id, status: 'summarized', summary });

  // Status is derived from the OUTCOME, never from `session.status` — that snapshot was read before
  // the run finished, so it still says 'completed' and would tell the dashboard a summary is merely
  // pending when it has in fact been tried and rejected.
  //
  // 'pending' is the one case where no attempt has failed: another invocation holds the claim and
  // is still working. Reporting that as 'error' would tell the doctor the summary could not be
  // generated seconds before it lands.
  res.json({
    id: session.id,
    status: pending ? 'pending' : 'error',
    summary: null,
    note: pending
      ? 'summary in progress — showing full intake in the meantime.'
      : 'summary unavailable — showing full intake.',
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

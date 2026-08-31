import { FieldValue } from 'firebase-admin/firestore';
import { getDb, memoryStore } from './saveSession.js';

// The de-duplication lock for Job C, moved out of process memory and into Firestore.
//
// The old guard was a module-scoped Map of in-flight promises. That worked because one long-running
// Express process saw every request. Serverless does not: concurrent invocations land on separate
// instances with separate memory, so the Map would silently dedupe nothing and one session could
// burn two of the ~200 daily Job C calls. Firestore is the only thing every instance shares, so the
// claim lives there — as a status of 'pending' set inside a transaction, which is atomic across
// instances in a way a read-then-write pair is not.
//
// Returns { found, claimed, pending?, session }:
//   claimed: true   → this caller owns the run and must produce a summary
//   pending: true   → someone else owns it right now; report "still working", do NOT start a second
//   neither         → nothing to do (already summarised, or already failed and not forced)

// A claim older than this is treated as abandoned. A serverless invocation killed mid-Job C
// (timeout, crash, redeploy) leaves 'pending' behind with nobody left to clear it, and without a
// staleness window that session could never be summarised again. Must exceed Job C's worst case:
// jobC.js allows a 25s request + up to 15s of backoff + a 25s retry.
const STALE_MS = 90_000;

// Shared by both storage paths so the decision table cannot drift between them.
function verdict(session, force) {
  if (!force && session.summary) return { found: true, claimed: false, session };
  // A previous attempt already failed and was recorded; don't retry on every dashboard read.
  // An explicit POST (force) is how a human asks for another go.
  if (!force && session.status === 'error') return { found: true, claimed: false, session };
  return null; // no short-circuit — caller proceeds to claim
}

export async function claimSummary(sessionId, { force = false } = {}) {
  // The memory fallback is per-instance by definition, so there is no second writer to race with
  // and no transaction to run. Kept in step with the Firestore path so getSession's two storage
  // backends still behave identically from the controller's point of view.
  if (memoryStore.has(sessionId)) {
    const session = { id: sessionId, ...memoryStore.get(sessionId) };
    const early = verdict(session, force);
    if (early) return early;
    memoryStore.set(sessionId, { ...memoryStore.get(sessionId), status: 'pending' });
    return { found: true, claimed: true, session };
  }

  const ref = getDb().collection('sessions').doc(sessionId);
  return getDb().runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) return { found: false };
    const session = { id: snap.id, ...snap.data() };

    const early = verdict(session, force);
    if (early) return early;

    // Someone else is mid-run. A forced pass deliberately ignores this and claims anyway: force is
    // an explicit human "try again", and making it wait behind a run that may be the very one that
    // is stuck would make the retry button useless.
    if (session.status === 'pending' && !force) {
      const claimedAt = session.summaryClaimedAt?.toMillis?.() ?? 0;
      if (Date.now() - claimedAt < STALE_MS) return { found: true, claimed: false, pending: true, session };
    }

    // Deliberately NOT touching updatedAt. Claiming is lock bookkeeping, not a content change, and
    // the dashboard renders updatedAt as the session's timestamp (SummaryPanel.jsx). Leaving it
    // alone also preserves the invariant the concurrency test asserts: updatedAt moves once, when
    // saveSummary writes the real result — not every time a reader touches the session.
    t.update(ref, { status: 'pending', summaryClaimedAt: FieldValue.serverTimestamp() });
    return { found: true, claimed: true, session };
  });
}

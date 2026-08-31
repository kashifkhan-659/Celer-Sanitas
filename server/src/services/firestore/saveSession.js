import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// The Admin SDK owns ALL writes (the client SDK is read-only). Lazy singleton so the server still
// boots before the service-account key exists — saveSession then degrades to the memory fallback
// below rather than crashing. Admin credentials never touch the client (Architecture.md §1).
let _db;
export function getDb() {
  if (_db) return _db;
  // getApps() is the modular-SDK equivalent of the namespaced `admin.apps` guard: without it a
  // warm serverless instance re-entering this function would throw "app already exists".
  if (!getApps().length) {
    // Serverless has no filesystem to hold a key file, so the whole service-account JSON travels
    // in one env var. Base64 because the PEM in `private_key` is multi-line and raw newlines do
    // not survive a single-line environment variable.
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString();
    initializeApp({ credential: cert(JSON.parse(json)) });
  }
  _db = getFirestore();
  return _db;
}

// Rules.md §3 fallback: if the write fails, keep the transcript in memory so the patient is never
// blocked and no data is lost. ponytail: process memory only — lost on restart, fine for a demo;
// swap for a durable queue if this ever needs to survive a redeploy.
export const memoryStore = new Map();

async function writeOnce(doc) {
  const ref = await getDb()
    .collection('sessions')
    .add({ ...doc, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  return ref.id;
}

// Persist a completed intake transcript to the `sessions` collection.
//
// Field names follow handoff §9's own rule: where the schema's placeholder name differs from what
// this write path already uses, the REAL name wins and gets extended rather than duplicated. So
// `symptomCategory` stays (§9 called it `category`) and `answers` stays (§9 called it `transcript`).
// Added here to complete the contract: status, bodyMapRegion, updatedAt, and a per-entry timestamp.
// The dashboard must match these exact names.
//
// Retries the write once, then falls back to memory. Returns { id, persisted }.
export async function saveSession({ symptomCategory, answers, bodyMapRegion }) {
  const doc = {
    symptomCategory,
    // Honest null when the client sends nothing. Substituting the category here would look like a
    // real body-map selection to the dashboard, which may treat this field as finer-grained than
    // the category (a region within the chest, not "chest"). A wrong-but-plausible value is worse
    // than an absent one. BodyMap.jsx fills this in when it starts sending a region.
    bodyMapRegion: bodyMapRegion ?? null,
    status: 'completed', // -> 'summarized' once Job C clears the safety gate, 'error' if it cannot
    // Stamped server-side so the ordering is trustworthy; a client-supplied timestamp is kept.
    answers: answers.map((a) => ({ ...a, timestamp: a.timestamp ?? new Date().toISOString() })),
  };
  try {
    return { id: await writeOnce(doc), persisted: true };
  } catch {
    try {
      return { id: await writeOnce(doc), persisted: true }; // retry once
    } catch (err) {
      const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      // Same field set as the Firestore path, updatedAt included — a memory-held session still has
      // to satisfy the §9 contract, or the dashboard sees a differently-shaped document.
      const now = new Date().toISOString();
      memoryStore.set(id, { ...doc, createdAt: now, updatedAt: now });
      console.warn(`saveSession: Firestore unavailable, kept in memory (${id}): ${err.message}`);
      return { id, persisted: false };
    }
  }
}

// Write Job C's result onto an EXISTING session document (handoff §6: a new function, so the
// proven session-creation path above is untouched). Separate collection is not needed — summary
// and status are new fields on the document the dashboard already reads.
//
// `summary` is null when Job C failed or safetyCheck rejected its output. That is recorded as
// status 'error' with summary null, so the dashboard can tell "not summarised yet" from "tried and
// could not" and show the raw transcript instead of waiting forever.
// ponytail: a failed summary stays failed until someone re-triggers it (POST .../summary); add an
// automatic retry only if failures turn out to be common rather than one-off.
export async function saveSummary(id, summary) {
  // summaryClaimedAt is cleared here because this write is the END of the run claimSummary opened.
  // Both outcomes release it: 'summarized' will never be reclaimed anyway, and 'error' must be
  // reclaimable by an explicit force retry without waiting out the staleness window.
  const patch = summary
    ? { summary: { text: summary.text, flaggedItems: summary.flaggedItems }, status: 'summarized', summaryClaimedAt: null }
    : { summary: null, status: 'error', summaryClaimedAt: null };

  if (memoryStore.has(id)) {
    memoryStore.set(id, { ...memoryStore.get(id), ...patch, updatedAt: new Date().toISOString() });
    return { persisted: false };
  }
  await getDb().collection('sessions').doc(id).update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
  return { persisted: true };
}

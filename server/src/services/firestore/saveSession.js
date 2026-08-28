import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { fileURLToPath } from 'node:url';
import { dirname, isAbsolute, resolve } from 'node:path';

const SERVER_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// The Admin SDK owns ALL writes (the client SDK is read-only). Lazy singleton so the server still
// boots before the service-account key exists — saveSession then degrades to the memory fallback
// below rather than crashing. Admin credentials never touch the client (Architecture.md §1).
let _db;
export function getDb() {
  if (_db) return _db;
  if (!getApps().length) {
    // Credentials come from GOOGLE_APPLICATION_CREDENTIALS (Application Default Credentials).
    // Normalize a relative path to server/ so it resolves whether the server is started from
    // server/ or the repo root (google-auth otherwise resolves it against cwd).
    const cred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (cred && !isAbsolute(cred)) process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(SERVER_ROOT, cred);
    initializeApp({ credential: applicationDefault() });
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
    bodyMapRegion: bodyMapRegion ?? symptomCategory,
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
      memoryStore.set(id, { ...doc, createdAt: new Date().toISOString() });
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
  const patch = summary
    ? { summary: { text: summary.text, flaggedItems: summary.flaggedItems }, status: 'summarized' }
    : { summary: null, status: 'error' };

  if (memoryStore.has(id)) {
    memoryStore.set(id, { ...memoryStore.get(id), ...patch, updatedAt: new Date().toISOString() });
    return { persisted: false };
  }
  await getDb().collection('sessions').doc(id).update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
  return { persisted: true };
}

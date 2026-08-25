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
    .add({ ...doc, createdAt: FieldValue.serverTimestamp() });
  return ref.id;
}

// Persist a completed intake transcript to the `sessions` collection.
// Data model (Architecture.md): { symptomCategory, answers[], createdAt }.
// Retries the write once, then falls back to memory. Returns { id, persisted }.
export async function saveSession({ symptomCategory, answers }) {
  const doc = { symptomCategory, answers };
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

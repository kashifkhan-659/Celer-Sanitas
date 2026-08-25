import { getDb, memoryStore } from './saveSession.js';

// Retrieve a stored session by id. Checks the in-memory fallback first (ids prefixed `mem_`, held
// when Firestore was unavailable at write time), then Firestore. Returns the session (with id) or
// null if not found. Used by the doctor view (Day 6) and, later, the Job C summary pass.
export async function getSession(id) {
  if (memoryStore.has(id)) return { id, ...memoryStore.get(id) };
  const snap = await getDb().collection('sessions').doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

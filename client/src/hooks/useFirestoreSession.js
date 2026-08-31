// Realtime Firestore listeners for the doctor dashboard.
//
// Two hooks live here because they share the same Firestore setup:
//   useFirestoreSessions()   → the full sessions list, ordered newest-first (SessionList)
//   useFirestoreSession(id)  → one session (SummaryPanel, when the doctor selects one)
//
// Both stay live: when the AI writes a summary onto a session, or status flips from
// 'completed' → 'summarized', the hook fires and the component re-renders. No refresh.
//
// Schema this hook reads (agreed with partner, matches server/src/services/firestore/saveSession.js):
//   symptomCategory: string
//   status: 'completed' | 'summarized' | 'error'
//   bodyMapRegion: string | null
//   answers: [{ nodeId, question, optionId, answer, timestamp }]
//   createdAt, updatedAt: Firestore Timestamp
//   summary: { text: string, flaggedItems: string[] } | null

import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

// Firestore returns its own Timestamp objects — React can't render them directly ("Objects are not
// valid as a React child" error). Normalize them to real JS Date at the boundary so downstream
// components stay Firestore-agnostic.
function normalize(id, data) {
  if (!data) return null;
  return {
    id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

// LIST: subscribe to the whole sessions collection, newest first.
export function useFirestoreSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Build the query once per mount. orderBy sorts server-side so the newest session is index 0.
    const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));

    // onSnapshot returns an unsubscribe function. We MUST return it from useEffect so React tears
    // the listener down when this component unmounts. Skip this and every remount adds another
    // live listener; the app slowly leaks connections until Firestore starts refusing them.
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSessions(snapshot.docs.map((d) => normalize(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        // Firestore errors here are usually permission-denied (rules block the read) or offline.
        // Surface to the UI rather than swallowing — a silent empty list looks like "no sessions",
        // which is the wrong story to tell the doctor.
        console.error('useFirestoreSessions:', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe; // React calls this on unmount → listener is closed cleanly.
  }, []); // empty deps = subscribe once when the component mounts, unsubscribe on unmount.

  return { sessions, loading, error };
}

// DETAIL: subscribe to ONE session by id. Pass null/undefined to skip subscribing (e.g. when no
// session is selected yet — SummaryPanel calls it that way).
export function useFirestoreSession(id) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setSession(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(
      doc(db, 'sessions', id),
      (snap) => {
        setSession(snap.exists() ? normalize(snap.id, snap.data()) : null);
        setLoading(false);
      },
      (err) => {
        console.error('useFirestoreSession:', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [id]); // re-subscribe whenever the selected id changes.

  return { session, loading, error };
}
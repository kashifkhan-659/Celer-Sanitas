// Firebase client SDK — READ-ONLY use (Architecture.md). The doctor dashboard will subscribe to
// Firestore for realtime session updates (Day 6). All WRITES go through the Express backend using
// the Admin SDK + a service-account key; the client never writes to Firestore directly.
//
// These web-config values are public identifiers, not secrets — safe to ship in the client bundle.
// (The real secrets are the Claude API key and the Firebase *service account*, both server-side
// only.) Enforce client read-only access with Firestore security rules.
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD87BjG-Y81INSbCUC1Uy2eaRI_5rRpq6o',
  authDomain: 'celer-sanitas.firebaseapp.com',
  projectId: 'celer-sanitas',
  storageBucket: 'celer-sanitas.firebasestorage.app',
  messagingSenderId: '529328600463',
  appId: '1:529328600463:web:66061ae7c1ac5b2aaf07fa',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

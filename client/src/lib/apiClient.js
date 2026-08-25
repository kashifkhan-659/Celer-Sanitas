// Thin fetch wrapper for the Express backend. In dev, VITE_API_BASE_URL is empty and Vite proxies
// /api → the local server (see vite.config.js). In prod (separate Railway deploy), set
// VITE_API_BASE_URL to the backend origin. The client never touches server files or the Claude key.
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function getJSON(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  return res.json();
}

async function postJSON(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`request failed: ${res.status}`);
  return res.json();
}

export const getTree = (category) => getJSON(`/api/trees/${category}`);

// Persist a completed intake transcript. Returns { id, persisted } — the server writes via the
// Admin SDK; the client never writes to Firestore directly.
export const saveSession = (payload) => postJSON('/api/sessions', payload);

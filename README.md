# Celer Sanitas

Celer Sanitas ("swift health") is a pre-consultation intake tool for patients: patients
answer an adaptive question tree before seeing the doctor, and the doctor receives a
structured summary with 2–3 flagged items to verify in person. **This is not a diagnostic
or symptom-checking tool.** It automates repetitive intake work only — final medical
judgment always rests with the doctor.

## Tech stack

- **Client:** React + Vite + Tailwind CSS
- **Server:** Node.js + Express
- **AI:** Groq (OpenAI-compatible chat completions) for intake classification and summary generation
- **Data:** Firebase Admin SDK + Firestore (server-side writes only; the client SDK is read-only)
- **Deploy:** Vercel — client built as a static SPA, server mounted as a single serverless function (`api/index.js`)

See [`docs/`](docs/) for the full planning documentation (PRD, architecture, rules, phases, memory log).

## Local setup

### Prerequisites
- Node.js 18+
- A Groq API key
- A Firebase project with a service-account key (Firestore enabled)

### 1. Clone and install
```bash
git clone <repo-url>
cd celer-sanitas

cd server && npm install
cd ../client && npm install
```

### 2. Configure the server
```bash
cd server
cp .env.example .env
```
Fill in `.env`:
- `GROQ_API_KEY` — from your Groq account
- `FIREBASE_SERVICE_ACCOUNT_B64` — base64-encode your Firebase service-account JSON:
  `base64 -w0 serviceAccountKey.json` (macOS: `base64 -i serviceAccountKey.json`)

### 3. Run in development
Two terminals, from the repo root:
```bash
# terminal 1 — server (http://localhost:3001)
cd server && npm run dev

# terminal 2 — client (http://localhost:5173)
cd client && npm run dev
```
Vite proxies `/api` requests to the local Express server (`client/vite.config.js`), so no
CORS or base-URL configuration is needed in dev. If the client is ever deployed separately
from the server, set `VITE_API_BASE_URL` in the client's environment to the server's origin.

### 4. Production build
```bash
cd client && npm run build
```
Deploys are Vercel-only in the current setup (see `vercel.json` and `api/index.js`); the
root `package.json` exists solely so Vercel resolves the serverless function's imports —
it isn't needed for local development.

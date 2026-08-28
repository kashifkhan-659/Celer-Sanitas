import 'dotenv/config';

// Required server-side config. Validated at import so a missing secret breaks the BOOT, not a
// patient's intake halfway through (Rules.md §3: never block or lose data mid-session).
//
// Nothing here ever logs a value — the failure names the VARIABLE only. The Groq key is
// server-side only and must never reach the client bundle (Architecture.md §1).
const REQUIRED = [
  'GROQ_API_KEY',                   // Groq API — Jobs A/B/C
  'GOOGLE_APPLICATION_CREDENTIALS', // Firebase Admin service-account key path
];

const missing = REQUIRED.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  throw new Error(`Missing required env var(s): ${missing.join(', ')} — set them in server/.env`);
}

export const GROQ_API_KEY = process.env.GROQ_API_KEY.trim();

# Celer Sanitas — Rules

Operating rules for AI behavior, dependencies, failure handling, and code style.
These are enforceable constraints, not suggestions.

---

## 1. AI Behavior Boundaries (non-negotiable)

**The product assists intake. It never diagnoses.** The doctor is the subject of
every diagnosis-related sentence; the tool is the subject only of workflow/time
sentences.

- ✅ "This lets the doctor reach a diagnosis faster because they aren't repeating basic questions."
- ❌ "This tool speeds up diagnosis." / "This tool diagnoses / triages the condition."

**No AI call may, anywhere, ever:**
1. Suggest a cause, condition, or diagnosis.
2. Rank or state likelihoods ("probably…", "most likely…", "this could be…").
3. Recommend treatment, medication, or next clinical steps.
4. Leave the current symptom category's scope.
5. Ask anything that is not intake/history collection.

**Per-job limits** (full detail in `Architecture.md §4`):
- **Job A (Haiku):** rewords one fixed question only — no new info, no meaning change.
- **Job B (Haiku):** classifies free text into a pre-set option only — never invents options or branches.
- **Job C (Sonnet):** summarizes what was said + flags 2–3 verify items — never interprets clinical meaning.
- **Tier 3 adaptive (Haiku):** generates intake questions within category only, and **every** output passes through the safety-check pass before display.

**Tier 3 framing rule:** adaptive mode is "more flexible," never "more accurate" or
"better for the patient." Never imply the AI does more clinical work than it should be credited for.

**In-product disclaimer is mandatory:** the "assist, not diagnose / limitations explicit"
disclaimer must be visible **in the UI**, not only in the pitch. The patient-facing
"answer carefully — this feeds into your care" note is a small, calm inline note near the
input — never a legal-style banner.

**No real patient data.** Demo/synthetic data only. Do not add any real-PII collection path.

---

## 2. Library Allow / Deny List

### Allowed
- **Frontend:** `react`, `react-dom`, `vite`, `tailwindcss`, `react-router-dom`, a minimal animation lib if needed (`framer-motion`) for the question/body-map transitions, `firebase` (client SDK, read-scoped for dashboard listeners).
- **Backend:** `express`, `@anthropic-ai/sdk`, `firebase-admin`, `dotenv`, `cors`, and a light validator (`zod`) for request/AI-output shape checks.
- **Body map:** hand-authored raw SVG — no mapping/diagram library.

### Denied
- Any **symptom-checker / medical-diagnosis / triage-scoring** package or API — the whole point is that we don't do this.
- **SQLite / local-file databases** — Firestore is the decided store (no redeploy persistence risk).
- **Body-map / anatomy mapping libraries** — raw SVG only.
- **ECC agent harness** — explicitly rejected (setup cost, wrong problem, pre-deadline failure surface).
- **xiaopu-ai/web-design** and **awesome-design-md as an installed tool** — redundant with tasteskill; do not stack design skills (conflicting instructions).
- Any package that puts the **Claude API key in frontend code**.
- Heavyweight state/SSR frameworks (Next.js, Redux) — unjustified for a demo SPA.

New dependency? Write one sentence justifying it in `Memory.md` before installing.

---

## 3. Error Handling / Fallback Behavior

**Principle: an AI failure degrades gracefully to the deterministic path — it never blocks the patient or loses data.**

| Failure | Fallback |
|---|---|
| Job A (phrasing) fails/times out | Render the original fixed question string verbatim. |
| Job B (classification) fails or returns `unclassified` | Show the fixed options as buttons; patient picks manually. |
| Job C (summary) fails | Show the raw structured Q&A transcript + "summary unavailable — showing full intake." Doctor loses nothing. |
| Tier 3 adaptive generation fails **or** safety check flags drift | Silently fall back to the guided-mode (Tier 2) JSON tree for that step. |
| Firestore write fails | Retry once; if still failing, keep the transcript in server memory for the session and surface a non-blocking toast. |
| Any Claude call | Wrap in try/catch with a timeout; log the job name + reason; never leak stack traces or the API key to the client. |

**Hard rule:** if the safety check cannot run, treat that as "unsafe" and fall back to guided mode.
Fail *closed* toward the deterministic path, never open toward unchecked AI output.

---

## 4. Code Style Rules

- **Separation of concerns (critical):** tree traversal lives in `services/tree/` as
  **pure functions** — deterministic, no side effects, and it must **not import anything
  from `services/ai/`**. AI lives in `services/ai/`. This separation is what makes the
  "code decides branching, not AI" claim true; do not blur it.
- **One job, one file:** `jobA.js`, `jobB.js`, `jobC.js`, `adaptive.js`, `safetyCheck.js` each do exactly one thing.
- **Prompts are data, not code:** keep prompt text in `server/src/prompts/*.txt`, imported by the job — never inline-concatenated with user input without validation.
- **Validate AI output shape** (zod or equivalent) before use; an out-of-shape response triggers the fallback in §3, not a crash.
- **Model IDs centralized** in `config/models.js` (`HAIKU_MODEL`, `SONNET_MODEL`) — never hardcoded per file.
- **Controllers stay thin:** validate → call service → respond. No business logic or AI calls in routes/controllers.
- **Frontend:** function components + hooks; styling via Tailwind tokens that trace back to `DESIGN.md`; the amber accent is reserved **only** for flagged/attention items — color carries meaning, so don't reuse amber decoratively.
- **`DESIGN.md` is generated, not hand-edited.** Change the design brief and regenerate rather than patching the file.
- **Secrets:** `.env` only, gitignored; no key, token, or Firebase admin credential in the client bundle or in committed code.
- **Lightweight discipline (in lieu of ECC):** one-paragraph plan per feature before building; manually walk every symptom-tree path before demo; teammate review before merge.

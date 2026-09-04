# Celer Sanitas — Memory Log

> Live working memory to prevent context loss between chat/tool sessions.
> Append a new dated entry at the top after each work block. Newest first.
> Keep it terse — this is a state cache, not a diary.

---

## Project State Snapshot (update in place)

- **Current phase:** MVP · Day 2
- **Today's date / build day:** 23 Aug (Day 2)
- **Deployed?** frontend (Vercel): not yet · backend (Railway/Render): not yet
- **Symptom trees done:** 3 / target 4–5  →  chest_pain, headache, abdominal_pain
- **AI jobs live:** Job A ☐ · Job B ☐ · Job C ☐ · Tier 3 adaptive ☐ · safety check ☐
- **Blockers:** none
- **Open decisions to make:** whether the tree /trees route should split into its own route+controller file once more endpoints land

---

## Entries

## [Day 3 · 23 Aug — Trees + body map]
- **Completed:** `headache.json` + `abdominal_pain.json` (9 nodes each, real branch at `character`, pure intake/history). `BodyMap.jsx` — hand-authored inline SVG, illustrated/not clinical (soft rounded figure), head/chest/abdomen regions → categories (headache/chest_pain/abdominal_pain), teal highlight-glow on select, keyboard-accessible + parallel pill list. `PatientIntake` now 2-stage: body map → category → intake; Back from Q1 returns to the map. The `CATEGORY` hardcode is gone.
- **Verified:** all 3 trees valid / reachable / terminating (verify-trees script); client build clean; browser E2E — Head region routed to the headache tree ("When did this headache begin?").
- **Notes:** body-map SVG is inline in `BodyMap.jsx` (regions need React handlers + state-driven styling), so the `assets/bodymap/` folder is unused. Symptom trees now 3/4–5.
- **Next:** optionally a 4th tree to hit the 4–5 target; then Phase 2 (Jobs A/B) or Day 6 doctor dashboard.

## [Day 2 · 23 Aug — Firestore persistence]
- **Completed:** Client `lib/firebase.js` (read-only web config); server Admin SDK persistence — `firestore/saveSession.js` (lazy Admin init + retry-once + in-memory fallback per Rules §3) + `getSession.js`; `POST /api/sessions` + `GET /api/sessions/:id` in `session.routes.js`; patient flow now persists the assembled transcript on leaf (non-blocking, calm toast on degraded save). Session doc = `{ symptomCategory, answers[], createdAt }`. Verified: save→get round-trip via memory fallback, 400 on bad category/empty answers, 503 on store-unavailable (no key yet). Client build clean.
- **RESOLVED — Firestore writes live (confirmed 23 Aug):** service-account key at `server/serviceAccountKey.json`; `.env` uses `GOOGLE_APPLICATION_CREDENTIALS`; Admin init via `applicationDefault()`. Full chest_pain flow wrote a real doc (`persisted:true`, auto-id, server `Timestamp`). Getting there surfaced two project-config steps (both done by user): enable Cloud Firestore API, then create the `(default)` Native-mode database — the memory fallback caught PERMISSION_DENIED then NOT_FOUND without losing data.
- **Browser E2E verified (23 Aug):** drove a full chest_pain intake in Chrome (Vite 5173 → proxy → Express 3001 → Admin SDK). UI matches DESIGN.md (double-bezel card, step-dots, glow/check select, slide transitions, muted-teal caution, completion card). Wrote real doc `c4tsRc6nYr00yhHd9fZf` (0 fallback warnings). GIF saved to user's Downloads.
- **Security rules LIVE (applied via Console 23 Aug):** `firestore.rules` (client read / server-only write) + `firebase.json` at repo root. Verified enforced via unauthenticated client REST calls: read → 200 (allowed), write → 403 PERMISSION_DENIED (denied). CLI deploy with the firebase-adminsdk SA had failed (lacks `serviceusage.services.get` — management perms), so user applied via Console instead. Admin SDK writes still work (bypass rules by design).
- **Decisions made:** (1) Client is read-only; ALL writes go through the server Admin SDK (service account = secret, server-only; the Firebase *web* config is public and fine in the client bundle). (2) Admin init is a lazy singleton in `saveSession.js`; `getSession.js` imports `getDb`/`memoryStore` from it (avoids an unlisted `db.js`). (3) Client assembles the transcript from the already-fetched tree; server validates category+shape (same source of truth). (4) `GET /sessions/:id` returns 503 (not 500/404) when the store is unreachable.
- **New dependency added (+ one-line reason):** server: `firebase-admin` (Admin writes w/ service account), `dotenv` (load `server/.env`). client: `firebase` (read-only SDK for the Day-6 dashboard realtime listener; not bundled until imported).
- **Next:** user adds the service-account key + Firestore security rules (client read / server-only write). Then Day 3 (trees + body map) / Phase 2 (Jobs A/B). Day 7 still owes the `<Disclaimer/>`.

---

## [Day 2 · 23 Aug]
- **Completed:** Pure tree engine (`services/tree/loadTree.js` + `nextNode.js`, self-check passes); `chest_pain.json` (9 nodes, branch at `character`); Express `GET /api/trees/:category` (returns tree JSON, 404s on bad/unknown category); patient flow UI (`PatientIntake` + `QuestionCard`/`StepDots`/`Transition`/`CautionNote` + shared `Button`) per DESIGN.md; client scaffold (Vite+Tailwind). Server endpoint + client build both verified.
- **In progress:** —
- **Decisions made:** (1) Client fetches whole tree via `GET /api/trees/:category` (server-side route) rather than importing server files — matches Vercel/Railway split. Branching is pure code, read client-side over the fetched tree; `nextNode.js` stays the canonical server engine (self-check + Phase-2 Job-B pipeline). (2) `/trees` route lives in `session.routes.js` (Architecture lists no trees-route file); thin handler, no controller layer yet. (3) 3 standard files not in Architecture's tree were added with approval: `client/index.html`, `postcss.config.js`, `src/index.css`. (4) Fonts via Google Fonts `<link>` (no dep). (5) Icons inlined as SVG — no icon library.
- **New dependency added (+ one-line reason):** server: `express`,`cors` (allow-listed — API + dev CORS). client: `react`,`react-dom` (app), `framer-motion` (allow-listed — question/body-map transitions), dev: `vite`,`@vitejs/plugin-react`,`tailwindcss`,`postcss`,`autoprefixer` (build + design tokens).
- **Next:** Day 3 — more trees (`headache`, `abdominal_pain`), SVG body map region→category wiring. Then Phase 2 (Jobs A/B). Day 7 owes the persistent `<Disclaimer/>` (TODO left in `PatientIntake.jsx`).

---

## [Day _, _time_]
- **Completed:** 
- **In progress:** 
- **Decisions made:** 
- **New dependency added (+ one-line reason):** 
- **Next:** 

---

## [Day _, _time_]
- **Completed:** 
- **In progress:** 
- **Decisions made:** 
- **New dependency added (+ one-line reason):** 
- **Next:** 

---

## Decision Log (append-only — don't rewrite past decisions)

| Date | Decision | Why | Reversible? |
|---|---|---|---|
|  |  |  |  |

---

## Known Issues / Tech Debt

- [ ] 

---

## Demo-Day Checklist (fill as you lock each item)

- [ ] Deployed build verified end-to-end (not just local)
- [ ] Every symptom-tree path manually walked
- [ ] Each AI fallback manually triggered + confirmed graceful
- [ ] In-product disclaimer visible
- [ ] Before/after time-comparison evidence screen working
- [ ] Real per-session token cost calculated for pricing slide
- [ ] 30-sec hook + limitations slide rehearsed

# Celer Sanitas — Build Phases

**Window:** 22 Aug → 4 Sept (~14 calendar days). **Do not build up to the deadline** —
buffer + testing land on 2–3 Sept, demo rehearsal on 4 Sept.

**Legend:** 🟩 MVP (must ship) · 🟦 Stretch (planned, drop first if behind) · 🟨 Buffer/Test/Demo

> Position marker: 22 Aug was setup/handoff; **23 Aug (today) is where active build starts.**
> If you slip, protect the MVP block (Days 1–7) and sacrifice the stretch block (Days 8–10) — the demo works on MVP alone.

---

## 🟩 MVP PHASE (Days 1–7 · 22–28 Aug)

### Day 1 — Fri 22 Aug — Setup
- Repo scaffold (`client/` + `server/`), Vite+React+Tailwind up, Express "hello" up.
- Firestore project created; client read + admin write wired with a dummy session doc.
- Install tasteskill `high-end-visual-design`; deploy skeletons to Vercel + Railway/Render early (avoid a deploy surprise on demo day).

### Day 2 — Sat 23 Aug — Trees + traversal engine
- Author `chest_pain.json` + `headache.json` (full node graphs).
- Build **pure** `services/tree/` (`loadTree`, `nextNode`) with unit-tested traversal — no AI yet.
- Static question rendering in `PatientIntake` (one question at a time), driven by the JSON.

### Day 3 — Sun 24 Aug — More trees + body map
- Author `abdominal_pain.json` + at least one more (target **4–5 categories** total).
- Build the raw SVG body map with ID'd regions (`chest_left`, `abdomen_upper`, …); wire region click → category entry.
- Step-dot progress indicator + animated question transitions (slide/fade).

### Day 4 — Mon 25 Aug — Tier 2 AI: Jobs A & B
- `jobA.js` (Haiku) natural phrasing on the fixed question; fallback = original string.
- `jobB.js` (Haiku) free-text → fixed option classification; fallback = manual buttons.
- Enforce and test the "no new info / no new branches" boundaries. Keep tree traversal fully separate from these calls.

### Day 5 — Tue 26 Aug — Job C + transcript persistence
- On leaf node, write full Q&A transcript to Firestore.
- `jobC.js` (Sonnet): transcript → structured summary + 2–3 flagged items; fallback = raw transcript view.
- Validate summary output shape; confirm it never interprets clinical meaning.

### Day 6 — Wed 27 Aug — Doctor dashboard
- `DoctorDashboard` with realtime Firestore listener (auto-updates on patient submit — demo effect).
- `SummaryPanel` + `FlaggedItem` (amber left-border treatment); higher density than patient view; distinct color temperature.

### Day 7 — Thu 28 Aug — Design pass + disclaimer + evidence screen
- Generate & approve `DESIGN.md` via tasteskill (PRD + design brief from §7); apply tokens across both views.
- Implement in-product disclaimer ("assist, not diagnose") + the calm inline "answer carefully" note.
- Build the before/after **time-comparison evidence screen** (this is the literal proof for the "saves doctor time" claim).

**✅ MVP complete: full guided-mode intake → summary → doctor dashboard, styled, with disclaimer + evidence.**

---

## 🟦 STRETCH PHASE (Days 8–10 · 29–31 Aug)

### Day 8 — Fri 29 Aug — Tier 3 adaptive mode (part 1)
- `adaptive.js` (Haiku) constrained branching (intake/history only, in-category).
- "Guided mode ↔ adaptive mode" toggle in the UI.

### Day 9 — Sat 30 Aug — Tier 3 adaptive mode (part 2)
- `safetyCheck.js` second pass; drift → discard → fall back to guided tree.
- Test constraints hard: attempt to make it suggest a cause and confirm it can't. Fail closed.

### Day 10 — Sun 31 Aug — Student practice mode
- `StudentPractice`: student "interviews" the AI as a simulated patient.
- End-of-session feedback: which important questions were asked vs. missed (vs. a typical clinician set).

**If behind: cut Day 10 first, then Days 8–9. The MVP demo stands without any of this.**

---

## 🟨 BUFFER / VALIDATION / DEMO (Days 11–14 · 1–4 Sept)

### Day 11 — Mon 1 Sept — Clinical validation
- Show symptom trees to a real clinician / med-student contact if possible; incorporate feedback.
- Turns "honest about limitations" into a genuine, defensible strength for judging.

### Day 12 — Tue 2 Sept — Buffer / bug-fix
- Walk **every** symptom-tree path manually. Force each AI fallback and confirm graceful degradation.
- Cross-device / projector check; fix visual + timing issues. Calculate real per-session token cost for the pricing slide.

### Day 13 — Wed 3 Sept — Buffer / freeze
- Final bug fixes; **feature freeze by end of day.** No new features after this point.
- Final deploy to Vercel + Railway/Render; verify the deployed build (not just local) works end to end.

### Day 14 — Thu 4 Sept — Demo rehearsal + submission
- Rehearse: 30-second hook → human-in-the-loop diagram walkthrough → live guided-mode demo → evidence screen → limitations slide.
- Map pitch to the five moves (Listen → Focus → Design → Build → Prove); assign speaking roles; submit.

---

## Cut-line summary
1. **Never sacrifice:** guided-mode intake + doctor summary + dashboard + disclaimer + evidence screen (Days 1–7).
2. **Sacrifice if needed, in this order:** student mode → adaptive mode → extra symptom categories (keep ≥3).
3. **Never sacrifice:** the 2–3 buffer/test/rehearsal days (Days 12–14).

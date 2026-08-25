# Celer Sanitas — Product Requirements Document

**Project Name:** Celer Sanitas
**Focus Area:** Healthcare
**Tagline:** "Swift health" — AI handles the repetition, doctors handle the judgement
**Build window:** 22 Aug → 4 Sept (~12–13 days)

---

## 1. Project Overview

### Core Concept
A pre-consultation intake tool for patients. Instead of a doctor manually asking the
same intake questions every patient already knows the answers to, patients answer an
adaptive, follow-up-based question tree before seeing the doctor. The doctor receives a
clean, structured summary instead of raw chat logs, with 2–3 flagged items to verify in
person. The doctor still makes 100% of diagnostic/clinical decisions — this tool never
diagnoses, it only clears repetitive intake work off the doctor's plate.

### Critical Positioning (non-negotiable framing)
- This is **explicitly NOT a diagnostic or symptom-checking tool.**
- Final medical judgement always rests with the doctor.
- Positioned as **intake automation, not decision-making AI.**
- Mirrors the hackathon's healthcare-track guardrail language: *"Assist — do not diagnose."*
- Winning-signal language to echo in the pitch: *"Improves a care decision without pretending to replace care."*

---

## 2. Target Users
- **Primary:** Patients waiting for a doctor consultation.
- **Secondary:** Doctors (view the structured summary + flagged items).
- **Stretch/tertiary:** Medical students (practice mode).

---

## 3. Features

### MVP (must build)
1. **Adaptive question tree** — patient answers an initial question, follow-ups branch based on the response (not a static form). A caution reminds the patient to answer carefully since it feeds into their care.
2. **Visual body map** — patient indicates pain/symptom location by clicking a visual diagram instead of describing it in text (faster, more precise).
3. **Structured doctor summary** — clean synthesis of what was asked/answered, not raw chat logs.
4. **Flagged follow-ups** — system highlights the 2–3 most important things the doctor should verify or re-ask in person, rather than the doctor starting from scratch.

### Now planned (upgraded from stretch, due to extended timeline)
5. **Anatomy/education layer** — the body map doubles as a light teaching aid, illustrating anatomy in the context of reported symptoms.
6. **Tier 3 "adaptive mode" toggle** — fully AI-generated question branching, offered as an alternate mode to the default guided tree.
7. **Student practice mode** — medical students "interview" the AI acting as a simulated patient; at the end they get feedback on which important questions they asked vs. missed, based on what a real clinician would typically ask.

### Non-Goals (explicitly out of scope)
- No diagnosis, no treatment recommendations, no likelihood/cause suggestions — anywhere, ever.
- No storage of real patient data (demo-only/synthetic data).
- No fully general/unconstrained symptom coverage — scoped categories only.

---

## 4. Value Proposition
- Saves doctor time by eliminating repeated basic questioning.
- Lets doctors focus limited consultation time on questions that actually need their expertise.
- Improves patient experience by giving them time to think through symptoms carefully before facing a doctor.
- Doubles as a training tool for medical students, extending value beyond the clinic.

**Correct speed claim (important nuance):** the tool speeds up the *workflow/consultation
process*, NOT "diagnosis" itself. The doctor must always remain the subject of any
diagnosis-related sentence; the tool is only ever the subject of workflow/time-related
sentences.
- ✅ "This lets the doctor reach a diagnosis faster because they're not wasting time on repetitive questions."
- ❌ "This tool speeds up diagnosis."

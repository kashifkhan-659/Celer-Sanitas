# Celer Sanitas — DESIGN.md

> **Generated from the design brief via the `high-end-visual-design` skill.**
> Per `Rules.md §4`: this file is generated, **not hand-edited**. To change the
> design, edit the brief below and regenerate — don't patch tokens in place.
> On scaffold, this file moves to `client/DESIGN.md` and feeds `tailwind.config.js`
> (see §12 — the token export is the source of truth for the Tailwind theme).

**Vibe archetype:** Soft Structuralism (the skill's designated Consumer/Health vibe) — soft off-white canvas, warm neutrals, humanist grotesk type, and unbelievably soft, highly diffused ambient shadows. Deliberately **not** the OLED-black "Ethereal Glass" showreel look: a patient about to see a doctor needs calm and legibility, not a maximalist assault. We keep the premium *craft* (concentric double-bezel nesting, spring motion, custom easing, machined highlights) and dial the *intensity* down to fit "calm, trustworthy, warm."

**Layout archetypes:** two, one per view —
- **Patient** → *Centered Single-Focus*: one card, vertically centered in the viewport, one question at a time, everything else stripped away.
- **Doctor** → *Dense Bento + List*: higher information density, fast to scan, flagged items rail-marked with a colored left border.

---

## 1. Design North Star

**"A calm room, not a waiting room."** The patient surface should feel like an
unhurried conversation with someone who has time for them. The doctor surface
should feel like a well-organized chart handed across a desk — dense, scannable,
already triaged into "read this first."

Five principles, in priority order:

1. **Calm over clever.** Motion and depth exist to reduce anxiety and guide
   attention, never to impress. If an effect draws attention to *itself*, cut it.
2. **Color carries meaning, not decoration.** Teal = the product / progress /
   selection. Amber = "a human should verify this," and nothing else, ever
   (`Rules.md §4`). Warm neutrals carry everything else.
3. **One thing at a time (patient).** Exactly one question, one decision, one
   focal point on screen. Density is the doctor's privilege, not the patient's.
4. **Honest, visible limits.** The "assist, not diagnose" disclaimer is a
   permanent, designed part of the UI (`Rules.md §1`) — calm, never a legal
   banner, never hidden in a footer nobody reads.
5. **Warm, not clinical.** Off-white not hospital-white; illustrated not
   anatomical; rounded not sharp; teal-with-warm-greys not sterile blue.

---

## 2. Color System

Three families do the entire job: **Teal** (primary), **Warm Neutral**
(structure & text), **Amber** (reserved accent). No fourth hue. Keeping the
palette this tight is what makes amber's meaning legible — if amber were one of
six accent colors, "amber = verify this" would stop reading as a signal.

### 2.1 Teal — primary (health-associated, warmed off hospital-blue)

Anchored around a teal-leaning cyan (~185°), desaturated so it reads reassuring
rather than sterile. Used for: progress, selection, primary CTAs, focus rings,
links, the body-map selection glow.

| Token | Hex | Where |
|---|---|---|
| `teal-50`  | `#EFF9F8` | selected-option fill, teal-tinted surfaces, dot trail |
| `teal-100` | `#D6F0EE` | hover fills, body-map hover, soft chips |
| `teal-200` | `#AEE1DD` | body-map selected fill, borders on tinted surfaces |
| `teal-300` | `#7FCECA` | decorative, disabled-primary |
| `teal-400` | `#4FB8B3` | gradients, glow mid-stop |
| `teal-500` | `#2C9C99` | **brand base** — icons, active step dot |
| `teal-600` | `#1F827F` | button hover, interactive hover text |
| `teal-700` | `#196B69` | **primary button fill**, link text, interactive text on white |
| `teal-800` | `#175553` | pressed states, deep accents |
| `teal-900` | `#144846` | on-teal text, deepest accent |

### 2.2 Warm Neutral — structure & text

Greys carry a faint warm-green tint so they harmonize with teal instead of
fighting it with a cold blue-grey. This warmth is what keeps the whole thing
from reading "clinical."

| Token | Hex | Where |
|---|---|---|
| `neutral-0`   | `#FFFFFF` | card inner cores, primary surfaces |
| `neutral-50`  | `#F7F8F7` | **patient app canvas** (soft, faintly warm off-white) |
| `neutral-100` | `#EEF1F0` | **doctor app canvas** (cooler/denser — see §10) |
| `neutral-200` | `#E1E6E4` | hairlines, dividers, double-bezel outer shells |
| `neutral-300` | `#CBD3D0` | upcoming step dots, input borders, disabled |
| `neutral-400` | `#A7B2AE` | body-map line-art strokes, placeholder text |
| `neutral-500` | `#7E8A86` | large/secondary decorative text only (fails AA at body size) |
| `neutral-600` | `#5D6764` | meta text on tinted surfaces (≥16px only) |
| `neutral-700` | `#454E4B` | **secondary body text** (AA-safe on white) |
| `neutral-800` | `#2E3634` | strong labels |
| `neutral-900` | `#1D2321` | **primary text** (warm charcoal, never pure black) |

### 2.3 Amber — reserved accent (flagged / verify-in-person ONLY)

Amber appears in exactly one context: the doctor's **flagged follow-ups** — the
2–3 items to verify in person. It never appears in the patient flow, never
decoratively, never as a general "highlight." (`Rules.md §4`,
`Architecture.md §4 Job C`.)

| Token | Hex | Where |
|---|---|---|
| `amber-50`  | `#FDF3E4` | flagged-item row tint (behind the left border) |
| `amber-100` | `#FBE7C7` | flagged hover tint |
| `amber-400` | `#E8A13C` | flag icon at rest |
| `amber-500` | `#D98324` | **the left-border rail** on `FlaggedItem` |
| `amber-600` | `#B96A17` | flag icon emphasis |
| `amber-700` | `#8F5212` | **amber text** (the word "Flag" / count) — AA-safe on white & amber-50 |

> **Amber discipline rule (enforced in code review):** amber tokens may only be
> imported by `doctor/FlaggedItem`. A lint note in that file states this. If any
> other component needs "attention," it uses teal (positive attention) or a
> neutral treatment — never amber.

### 2.4 Two deliberate non-decisions

- **The patient "answer carefully" caution note is NOT amber.** Per the brief,
  amber is reserved for *doctor flags*, and per `Rules.md §1` the caution note
  must feel "small and calm, never a legal banner." Amber would read as a
  *warning* and spike anxiety — the opposite of calm. The caution note uses a
  **muted teal-tinted** treatment (see `CautionNote`, §9). This keeps amber's
  meaning pure and keeps the patient surface reassuring.
- **No error-red.** The whole architecture degrades AI failures *silently to the
  deterministic path* (`Rules.md §3`) — there is no red "error" surface to
  design. A failed Firestore write shows a **calm neutral toast**, not a red
  alert. `ponytail:` no red palette until a genuine hard-error surface exists;
  add a muted clay-red then, not before.

### 2.5 Semantic aliases (use these in components, not raw scale steps)

```
--surface-canvas        neutral-50   (patient)  / neutral-100 (doctor)
--surface-card          neutral-0
--surface-shell         neutral-200  (double-bezel outer tray)
--surface-tint          teal-50      (selected / progress fills)
--text-primary          neutral-900
--text-secondary        neutral-700
--text-muted            neutral-500  (large only)
--hairline              neutral-200
--interactive           teal-700
--interactive-hover     teal-600
--focus-ring            teal-600
--selection-glow        teal-400 @ low alpha (see §6)
--flag-rail             amber-500    (FlaggedItem only)
--flag-tint             amber-50     (FlaggedItem only)
--flag-text             amber-700    (FlaggedItem only)
```

### 2.6 Contrast (verify before demo — calibration step, §13)

| Pair | Use | Target |
|---|---|---|
| neutral-900 on neutral-0/50 | primary text | ~15:1 ✓ |
| neutral-700 on neutral-0 | secondary text | ≥4.5:1 (AA) |
| white on teal-700 | primary button label | must be ≥4.5:1 — if short, deepen fill to teal-800 |
| teal-700 on white | link / interactive text | ≥4.5:1 |
| amber-700 on amber-50 | flag label on its tint | ≥4.5:1 |
| teal-600 focus ring on neutral-50 | focus visibility | ≥3:1 (non-text) |

---

## 3. Typography

**One family: `Plus Jakarta Sans`** — a warm, slightly rounded humanist grotesk.
Warm enough for "trustworthy/human," geometric enough for the Soft Structuralism
"massive bold grotesk" look. One family = coherence and less to load. (No serif
pairing — that's the Editorial Luxury archetype, wrong vibe here.)

- Import weights **400 / 500 / 600 / 700** only. Fallback stack:
  `"Plus Jakarta Sans", "General Sans", system-ui, sans-serif`.
- **Banned** (`skill §2`): Inter, Roboto, Arial, Open Sans, Helvetica.
- Numeric/tabular data in the doctor view uses `font-variant-numeric: tabular-nums`
  so columns of values align.

### 3.1 Scale (semantic, not raw px — the two views pull from opposite ends)

| Role | Size / Line-height | Weight | Tracking | Notes |
|---|---|---|---|---|
| `display` | 60 / 1.05 | 700 | -0.02em | evidence-screen hero, landing |
| `title`   | 34 / 1.15 | 700 | -0.015em | page titles |
| `question`| 28 / 1.35 | 600 | -0.01em | **patient question** — big, calm, never shouty |
| `subtitle`| 22 / 1.35 | 600 | -0.01em | section headers |
| `body-lg` | 18 / 1.55 | 400 | 0 | **patient body / answer options** (larger for ease) |
| `body`    | 16 / 1.55 | 400 | 0 | default |
| `body-sm` | 14 / 1.5  | 400 | 0 | **doctor dense body** |
| `label`   | 13 / 1.4  | 500 | 0 | UI labels, meta |
| `eyebrow` | 11 / 1.2  | 600 | 0.18em | uppercase pill tags above headings |
| `numeric` | 14–20 / 1.2 | 600 | 0 | doctor values, evidence metrics (tabular-nums) |

**View rule of thumb:** patient text floors at **18px** (`body-lg`) for
readability under stress; doctor text sits at **14px** (`body-sm`) for density.
Nothing anywhere goes below **13px**.

---

## 4. Spacing, Radius & Layout

### 4.1 Spacing — 4px base

`0.5→2px · 1→4 · 2→8 · 3→12 · 4→16 · 5→20 · 6→24 · 8→32 · 10→40 · 12→48 · 16→64 · 20→80 · 24→96 · 32→128`

- **Patient intake surface breathes through *centering + card padding*, not tall
  stacked sections.** The card is vertically centered in `min-h-[100dvh]`; inner
  padding is generous (`p-8` mobile → `p-10/p-12` desktop). The skill's
  "`py-24`+ macro-whitespace" rule applies to the **marketing / evidence /
  landing** surfaces (which *are* scrolled sections), not to the single-focus
  intake card.
- **Doctor surface is deliberately tighter:** section padding `py-6`, card
  padding `p-4/p-5`, list-row padding `py-3` — density is the point.

### 4.2 Radius (concentric — required for the double-bezel, §5)

| Token | px | Use |
|---|---|---|
| `xs` | 8  | chips, small inputs |
| `sm` | 12 | doctor cards, list rows |
| `md` | 16 | inputs, answer options |
| `lg` | 20 | inner cores of medium cards |
| `xl` | 24 | secondary cards |
| `2xl`| 28 | **QuestionCard outer shell** |
| `full` | 9999 | buttons, step dots, eyebrow tags |

**Concentric formula:** inner radius = outer radius − shell padding.
QuestionCard: outer `28` with shell padding `6` → inner core `22`
(`rounded-[calc(1.75rem-0.375rem)]`). Never nest two equal radii — that reads as
a sticker, not machined hardware.

### 4.3 Layout grids

- **Patient:** single centered column, `max-w-[560px]`, one focal card.
- **Doctor:** an **asymmetrical bento** — left rail `SessionList`
  (`col-span-4`, scrollable), right `SummaryPanel` (`col-span-8`). Below `768px`
  both collapse to a single `w-full` column, list on top, summary below.
- Universal mobile override (`skill §3`): below `768px` → `w-full`, `px-4`,
  `min-h-[100dvh]` (never `h-screen`).

---

## 5. Depth — The Double-Bezel (Doppelrand)

No major surface sits flat on the canvas. Cards are built as a **machined tray +
inset plate**:

- **Outer shell:** `bg-surface-shell` (neutral-200) or a faint
  `bg-white/40 backdrop-blur` on tinted areas, `ring-1 ring-neutral-200`,
  padding `p-1.5`, radius `2xl`.
- **Inner core:** `bg-surface-card` (white), its own concentric radius (§4.2),
  and a **machined top highlight**: `inset 0 1px 0 rgba(255,255,255,0.7)` so the
  plate catches light along its top edge. This is the whole trick in light mode —
  the highlight, not a hard border, is what makes it read as physical hardware.

Applied to: `QuestionCard`, `SummaryPanel`, evidence-screen metric cards, the
`Disclaimer` chip. **Not** applied to doctor list rows (density > depth there).

---

## 6. Elevation & Glow

Soft, highly diffused ambient shadows only — **never** `shadow-md`, never a hard
dark drop shadow (`skill §2`). Shadow color is tinted with the canvas
(`rgba(20,40,38,…)`, a warm near-teal-black) so it feels like it belongs to the
scene, not a generic grey blur.

```
shadow-ambient-sm : 0 1px 2px rgba(20,40,38,0.04), 0 2px 8px rgba(20,40,38,0.04)
shadow-ambient-md : 0 4px 24px -8px rgba(20,40,38,0.10), 0 2px 8px -4px rgba(20,40,38,0.06)   /* resting cards */
shadow-ambient-lg : 0 24px 60px -20px rgba(20,40,38,0.16), 0 8px 24px -12px rgba(20,40,38,0.08) /* active QuestionCard */
highlight-inset   : inset 0 1px 0 rgba(255,255,255,0.70)   /* machined plate top edge */
```

**Selection glow** (the brief's "soft highlight-glow" on body-map regions &
selected options) — teal, low-alpha, layered ring + bloom:

```
glow-teal : 0 0 0 3px rgba(79,184,179,0.18), 0 0 22px rgba(44,156,153,0.22)
```

This is the single "special" visual moment in the patient flow. It is teal, calm,
and reserved for *selection* — it is not amber and never signals a warning.

---

## 7. Motion

**Rule:** motion simulates real mass and settle — no `linear`, no
`ease-in-out`, no instant state change (`skill §2, §5`). Everything animates on
**`transform` and `opacity` only** (GPU-safe; never `width/height/top/left`).
Motion here has a *job*: reduce anxiety and show the demo is alive. Subtle beats
flashy every time.

### 7.1 Easing tokens

```
ease-fluid  : cubic-bezier(0.32, 0.72, 0, 1)    /* spatial: question slide, card entrance, dot fill */
ease-settle : cubic-bezier(0.22, 1, 0.36, 1)    /* fades, opacity settles, toasts */
spring-soft : { stiffness: 220, damping: 26, mass: 0.9 }  /* framer-motion: press, hover, dot pop, region pulse */
```

### 7.2 Duration ladder

| Band | ms | Use |
|---|---|---|
| micro | 150 | hover, press, focus |
| standard | 320–420 | option select, step-dot fill, toast in/out |
| transition | 500–600 | **question → question** slide+fade |
| entrance | 700–800 | page/card first reveal, scroll-in |

### 7.3 Named choreographies

- **Question transition** (the signature patient motion). `AnimatePresence`,
  `mode="wait"`. **Forward:** outgoing question `opacity 1→0`,
  `translateX 0→-16`, `blur 0→4px`; incoming `opacity 0→1`,
  `translateX 16→0`, `blur 4px→0`, over **560ms `ease-fluid`**. **Back:** mirror
  the X direction. Travel is intentionally *short* (16px) — a calm settle, not a
  carousel swipe. Height changes between questions are eased via layout spring,
  never a hard jump.
- **Step dots.** Upcoming = `neutral-300` ring. On advance, the current dot fills
  `teal-500` and pops `scale 1→1.15→1` (`spring-soft`); completed dots settle to
  `teal-500 @ 60%`. The connector "progress" fills via **`scaleX` from origin-left**
  (GPU-safe — never animate `width`), 400ms `ease-fluid`.
- **Answer option select.** On tap: fill `white→teal-50`, border `neutral-300→teal-200`,
  `glow-teal` fades in, `active:scale-[0.98]` press. 320ms.
- **Body-map region.** Hover → fill fades to `teal-100`, `scale 1.01`. Select →
  fill `teal-200` + `glow-teal` + a one-shot pulse `scale 1→1.04→1` (`spring-soft`).
- **Primary button (Continue / CTA).** `group`, `active:scale-[0.98]`; the nested
  trailing-icon circle does `group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105` — internal kinetic tension, per `skill §5B`.
- **Scroll entry (landing / evidence).** Elements enter with
  `translate-y-16 blur-md opacity-0 → translate-y-0 blur-0 opacity-100`, 800ms
  `ease-fluid`, via `IntersectionObserver` / framer `whileInView` — **never**
  `scroll` listeners (`skill §5C`).
- **Doctor "live" moment** (the realtime demo effect). When the Firestore
  listener fires, the new `SessionList` row enters `translateY -12 + opacity 0→1`
  over 400ms `ease-settle`, and its flag count reads out via an `aria-live`
  region. Noticeable, calm, not a bounce.

### 7.4 Reduced motion (mandatory)

`@media (prefers-reduced-motion: reduce)`: replace every slide/blur/pulse with a
**≤200ms opacity crossfade**; step dots fill instantly; no region pulse; no
scroll-in transform. Nothing depends on motion to be understood.

---

## 8. Iconography & Illustration

- **Icons:** Phosphor **Light/Regular** only — ultra-light precise lines. Banned:
  thick Lucide, FontAwesome, Material (`skill §2`). Optical stroke ~1.5px.
- **Body map** (`assets/bodymap/`, raw SVG, ID'd regions — `Architecture.md`).
  Style is **illustrated, not clinical** (`PRD.md §3.5`): a soft, rounded,
  friendly human figure in warm line-art — `neutral-400` strokes ~2px, gently
  organic outlines, **no** medical cross-sections, no Gray's-Anatomy realism.
  - Region IDs map 1:1 to tree entry points (`chest_left`, `abdomen_upper`, …).
  - States: rest (line only) → hover (`teal-100` fill) → selected (`teal-200`
    fill + `glow-teal`). The glow *is* the "soft highlight-glow" from the brief.
  - Doubles as the light anatomy/education layer — an optional soft-teal label
    callout on select, in plain language, **never diagnostic** (`Rules.md §1`).
- **Illustration budget:** one figure (front, optionally back). No illustration
  library. `ponytail:` hand-author the SVG; add a back view only if a tree needs
  a posterior region.

---

## 9. Component Specs

Scoped to exactly the components in `Architecture.md §2` — nothing speculative.

### Patient — `components/patient/`

**`QuestionCard`** — the hero surface.
- Double-bezel (§5): shell radius `2xl` pad `p-1.5`; inner core radius `22`,
  `p-8 → md:p-10`, `shadow-ambient-lg`, `highlight-inset`.
- Contents top→bottom: optional `eyebrow` (category name, e.g. "Chest") →
  `question` text (28px/600) → answer zone (options or free-text) → footer row:
  `CautionNote` (left) + primary `Continue` button (right).
- One card visible at a time; `AnimatePresence` question transition (§7.3).
- Max width `560px`, vertically centered in `min-h-[100dvh]`.

**Answer options** (button choice nodes).
- Full-width stacked pills, radius `md`, min-height `56px` (calm, easy tap),
  `body-lg`, left-aligned text, `bg-white ring-1 ring-neutral-300`.
- Select state per §7.3 (teal-50 fill + teal-200 ring + `glow-teal`).
- Single-select shows a teal check (Phosphor) sliding in on the right.

**Free-text input** (nodes that allow typing → routed to Job B).
- Soft inset field, radius `md`, `ring-1 ring-neutral-300`, focus →
  `ring-2 ring-teal-600`. Below it, a quiet helper: "Type in your own words —
  we'll match it to the closest option." On Job-B fallback (`unclassified`), the
  fixed option buttons animate in below (`ease-settle`, 320ms) — degradation is
  visible and calm, never an error (`Rules.md §3`).

**`StepDots`** — soft-dot progress.
- Row of dots (not a bar), states/motion per §7.3. Sits *above* the QuestionCard,
  centered, with an accessible `aria-label="Question X of Y"`. Never shows an
  exact percentage — a calm sense of progress, not a countdown.

**`CautionNote`** — the "answer carefully" inline note.
- **Small, calm, muted teal** — *not* amber (§2.4), *not* a banner (`Rules.md §1`).
- A single line with a small Phosphor info dot in `teal-600`, text in
  `neutral-700` `label` size: "Answer honestly — your doctor uses this to care
  for you." Sits inline near the input/footer, `bg-transparent`. No border, no
  fill, no icon-in-a-colored-box. It reassures; it does not warn.

**`Transition`** — shared wrapper implementing §7.3; respects reduced-motion (§7.4).

### Doctor — `components/doctor/`

Distinct from patient by density, temperature, and rail-marking (§10).

**`SummaryPanel`** — the structured Job-C summary.
- Double-bezel but tighter: inner `p-5`, radius `lg`, `shadow-ambient-md`.
- Sections as labeled blocks (`eyebrow` headers, `body-sm` content): *Presenting*,
  *History*, *What was asked/answered*. Q&A rendered as compact rows with
  `tabular-nums` where numeric.
- **Fallback state** (Job C failed, `Rules.md §3`): renders the raw structured
  Q&A transcript under a calm `neutral` note "Summary unavailable — showing full
  intake." Same layout system, no red, doctor loses nothing.

**`FlaggedItem`** — the 2–3 verify-in-person items. **The only amber in the app.**
- **Left-border rail:** `border-l-4 border-amber-500`, row `bg-amber-50`,
  radius `sm` (right corners only, so the rail reads as a physical tab).
- Label chip "FLAG" in `amber-700`, `eyebrow` size, + a Phosphor flag icon
  (`amber-500`). Item text in `neutral-900` `body-sm`.
- **Redundant encoding (a11y):** the flag meaning is carried by the icon + "FLAG"
  label + position, never by color alone (§11).
- On first render (streamed in), a subtle staggered fade-up (§7.3), so a newly
  flagged item reads as *new* without alarming.

**`SessionList`** — realtime queue (left rail).
- Dense rows: patient token (synthetic id), category, timestamp (`tabular-nums`),
  a small flag-count badge (amber, only if >0). Row radius `sm`, `py-3`,
  hairline dividers, hover `bg-neutral-100`. Selected row: `teal-700` left tick +
  `bg-teal-50`.
- New row on listener fire → the "live" choreography (§7.3) + `aria-live` announce.

### Demo — `components/demo/`

**`TimeComparison`** — before/after evidence screen (the literal proof of the
"saves doctor time" claim; must never say the tool diagnoses — `PRD.md §4`).
- Two double-bezel metric cards side by side (bento; stack on mobile):
  **Before** = heavy/slow, rendered in **muted neutral** (greyer, `shadow-ambient-sm`);
  **After** = calm/efficient, rendered in **teal** accent + `shadow-ambient-md`.
  The color contrast itself tells the story — slow-grey vs alive-teal. (No amber
  here — this isn't a flag.)
- Big `display`/`numeric` figures with `tabular-nums`; scroll-entry animation (§7.3).
- Copy discipline: the *doctor* is the subject of any diagnosis sentence, the
  *tool* only of time/workflow sentences (`PRD.md §4`, `Rules.md §1`).

### Shared — `components/shared/`

**`Disclaimer`** — mandatory, permanent, in-UI (`Rules.md §1`).
- A calm double-bezel **chip**, not a banner: small Phosphor shield-check icon
  in `teal-600`, text `label` size `neutral-700`: "Celer Sanitas assists intake —
  it does not diagnose. Your doctor makes every medical decision."
- Persistent and visible on both patient and doctor surfaces (patient: pinned
  calm chip near the card; doctor: header row). Quiet, legible, never dismissible,
  never legalese.

**`Button`** — primary CTA, "island" architecture (`skill §4B`).
- `rounded-full`, `px-6 py-3`, fill `teal-700`, hover `teal-600`, label white
  `label`/`body` weight 600. `active:scale-[0.98]`, micro transition.
- **Button-in-button trailing icon:** the arrow lives in its own nested circle
  (`w-8 h-8 rounded-full bg-white/15`, flush to the right inner padding) with the
  hover kinetics from §7.3. Secondary variant: `bg-transparent ring-1 ring-neutral-300`,
  text `teal-700`. Focus ring per §11 on both.

**`Layout`** — sets the per-view canvas (§10), mounts the persistent `Disclaimer`,
enforces `min-h-[100dvh]` and the mobile override (§4.3).

### Pages — `pages/`

- **`PatientIntake`** — centered single-focus; `neutral-50` canvas; QuestionCard +
  StepDots + Disclaimer chip; optional soft radial teal wash (very low alpha)
  behind the card for life (fixed, `pointer-events-none`).
- **`DoctorDashboard`** — bento; `neutral-100` canvas; header (title + Disclaimer +
  live-count), `SessionList` rail + `SummaryPanel`.
- **`StudentPractice`** *(stretch)* — reuses patient card system for the interview;
  end-of-session feedback uses `teal` for "asked" and **muted neutral** (not amber,
  not red) for "missed" — missed questions are learning, not alarms.

---

## 10. Patient vs Doctor — at a glance

The two views must read as different rooms. How they diverge:

| | **Patient** | **Doctor** |
|---|---|---|
| Canvas | `neutral-50` (warm off-white) | `neutral-100` (cooler, denser) |
| Layout | centered single-focus, `max-w-560` | asymmetric bento, full width |
| Density | one question, huge whitespace | packed rows, tight padding |
| Type floor | 18px (`body-lg`) | 14px (`body-sm`), tabular-nums |
| Depth | tall double-bezel, `ambient-lg` | shallow cards, `ambient-md/sm` |
| Motion | signature slide+blur transitions | quick fades; the "live" row moment |
| Accent | teal selection/progress + glow | teal selection **+ amber flag rails** |
| Feel | "a calm conversation" | "a triaged chart across a desk" |

Amber exists on the doctor side only. That asymmetry is intentional: it's the
visual proof that the *product* triaged nothing clinical — it merely marked what
a *human* should check.

---

## 11. Accessibility (non-negotiable, `skill §2` + healthcare context)

- **Contrast:** body text ≥4.5:1, large text/UI ≥3:1. Use `neutral-700` (not 500)
  for AA body on white; amber text only at `amber-700`. Verify §2.6 pre-demo.
- **Color is never the only signal.** Flags carry icon + "FLAG" label + rail +
  position. Selection carries a check + glow + fill, not hue alone. Before/after
  carries labels + figures, not just grey-vs-teal.
- **Focus:** every interactive element gets a visible `ring-2 ring-teal-600
  ring-offset-2` focus state; never removed. Keyboard order follows reading order.
- **Body map is not mouse-only:** each region is focusable (`tabindex`),
  Enter/Space selects, each has an `aria-label` in plain language ("Upper-left
  chest"). Provide a parallel text list of regions as a fallback path.
- **Live updates:** doctor new-session / flag-count changes announce via
  `aria-live="polite"`.
- **Touch targets** ≥44px everywhere; patient answer options ≥56px.
- **Motion:** full `prefers-reduced-motion` path (§7.4). No information is
  motion-dependent.
- **Text scaling:** rem-based; layout survives 200% zoom without clipping the card.

---

## 12. Tailwind token export (`theme.extend`)

Source of truth for `client/tailwind.config.js` (`Architecture.md §1`). Copy verbatim.

```js
// tailwind.config.js  →  theme.extend
export const extend = {
  colors: {
    teal: {
      50:'#EFF9F8',100:'#D6F0EE',200:'#AEE1DD',300:'#7FCECA',400:'#4FB8B3',
      500:'#2C9C99',600:'#1F827F',700:'#196B69',800:'#175553',900:'#144846',
    },
    neutral: {
      0:'#FFFFFF',50:'#F7F8F7',100:'#EEF1F0',200:'#E1E6E4',300:'#CBD3D0',
      400:'#A7B2AE',500:'#7E8A86',600:'#5D6764',700:'#454E4B',800:'#2E3634',900:'#1D2321',
    },
    amber: { // FlaggedItem ONLY — do not import elsewhere (Rules.md §4)
      50:'#FDF3E4',100:'#FBE7C7',400:'#E8A13C',500:'#D98324',600:'#B96A17',700:'#8F5212',
    },
  },
  fontFamily: {
    sans: ['"Plus Jakarta Sans"','"General Sans"','system-ui','sans-serif'],
  },
  fontSize: {
    eyebrow:  ['0.6875rem',{lineHeight:'1.2',letterSpacing:'0.18em',fontWeight:'600'}],
    label:    ['0.8125rem',{lineHeight:'1.4',fontWeight:'500'}],
    'body-sm':['0.875rem',{lineHeight:'1.5'}],
    body:     ['1rem',{lineHeight:'1.55'}],
    'body-lg':['1.125rem',{lineHeight:'1.55'}],
    subtitle: ['1.375rem',{lineHeight:'1.35',letterSpacing:'-0.01em',fontWeight:'600'}],
    question: ['1.75rem',{lineHeight:'1.35',letterSpacing:'-0.01em',fontWeight:'600'}],
    title:    ['2.125rem',{lineHeight:'1.15',letterSpacing:'-0.015em',fontWeight:'700'}],
    display:  ['3.75rem',{lineHeight:'1.05',letterSpacing:'-0.02em',fontWeight:'700'}],
  },
  borderRadius: { xs:'8px', sm:'12px', md:'16px', lg:'20px', xl:'24px', '2xl':'28px' },
  boxShadow: {
    'ambient-sm':'0 1px 2px rgba(20,40,38,0.04), 0 2px 8px rgba(20,40,38,0.04)',
    'ambient-md':'0 4px 24px -8px rgba(20,40,38,0.10), 0 2px 8px -4px rgba(20,40,38,0.06)',
    'ambient-lg':'0 24px 60px -20px rgba(20,40,38,0.16), 0 8px 24px -12px rgba(20,40,38,0.08)',
    'highlight-inset':'inset 0 1px 0 rgba(255,255,255,0.70)',
    'glow-teal':'0 0 0 3px rgba(79,184,179,0.18), 0 0 22px rgba(44,156,153,0.22)',
  },
  transitionTimingFunction: {
    fluid:'cubic-bezier(0.32,0.72,0,1)',
    settle:'cubic-bezier(0.22,1,0.36,1)',
  },
  transitionDuration: { 320:'320ms', 420:'420ms', 560:'560ms', 800:'800ms' },
};
// framer-motion spring (JS, not Tailwind):  { type:'spring', stiffness:220, damping:26, mass:0.9 }
```

---

## 13. Deliberately excluded (YAGNI) + pre-demo calibration

**Excluded on purpose — add only when a real need appears:**
- **Dark mode** — the demo shows in light; a patient-facing clinic tool has no
  night context yet. Add a dark *doctor* theme later only if a night-shift use
  case is real. Not before.
- **Error-red palette** — failures degrade to fallback UI + calm neutral toast
  (`Rules.md §3`); there's no red surface to design. Add a muted clay-red only
  when a genuine hard-error state exists.
- **Fourth+ accent hue / gradients-as-brand / illustration library** — the
  three-family system is the whole language; more hues would dilute amber's
  signal.
- **Component/token variants beyond the `Architecture.md §2` list** — spec only
  what ships.

**Calibration (verify against reality before demo day — §12 of `Phases.md`):**
1. Run the §2.6 contrast pairs through a checker on the *deployed* build (screen
   gamma ≠ design-tool gamma). If white-on-`teal-700` is short of 4.5:1, deepen
   the button fill to `teal-800`.
2. Check the palette on the **projector/room** used for the demo — washed-out
   projectors flatten the teal/neutral separation; nudge `neutral-100` cooler if
   the two canvases stop reading as distinct.
3. Confirm `prefers-reduced-motion` actually disables the slide/blur on a real
   device, not just in DevTools emulation.

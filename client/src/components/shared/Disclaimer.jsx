// Persistent "assist, not diagnose" chip (Rules.md §1; DESIGN.md §2.4).
// Muted teal tint — NEVER amber (amber is reserved for doctor flags only, DESIGN.md §2.3).
// Small and calm by design — this is a permanent, honest limit on what the tool does,
// not a legal banner. Sits in the top bar so it's always visible without ever shouting.

// The little info glyph — inline SVG so we don't pull in an icon library for one shape.
const InfoGlyph = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function Disclaimer() {
  return (
    <div
      // role="note" tells screen readers this is supplementary info, not a critical alert.
      role="note"
      className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5
                 text-label text-teal-800 ring-1 ring-teal-100"
    >
      <span className="text-teal-700"><InfoGlyph /></span>
      <span>
        Celer Sanitas assists your doctor — it doesn't diagnose. Clinical decisions rest with them.
      </span>
    </div>
  );
}
// A single flagged item in the doctor's summary panel (DESIGN.md §2.3, §5B).
//
// THE AMBER DISCIPLINE RULE: this is the ONLY component in the entire app allowed to import amber
// tokens. Amber = "a human should verify this," and nothing else, ever. If you find yourself
// wanting amber somewhere else for "attention," use teal (positive attention) or a neutral
// treatment instead. That discipline is what keeps amber's meaning legible when the doctor scans.
//
// Design shape (DESIGN.md §5B): compact row, amber-500 left rail (4px), amber-50 tint behind the
// text, amber-700 icon and label. NO double-bezel — the doctor surface trades depth for density.

// Small flag glyph — inline SVG, no icon library dependency.
const FlagGlyph = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
    <path
      d="M5 3v18M5 4h10l-2 4 2 4H5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// `text` is the prop the parent passes in — one flagged item's short description.
// e.g. <FlaggedItem text="Skipped medication question" />
export default function FlaggedItem({ text }) {
  return (
    <div
      role="listitem"
      // border-l-4 = the 4px amber rail. bg-amber-50 tints the row behind it.
      // rounded-r-md leaves the left edge sharp so the rail reads as an edge, not a chip.
      className="flex items-start gap-2.5 border-l-4 border-amber-500 bg-amber-50
                 px-3 py-2 rounded-r-md"
    >
      <span className="mt-0.5 text-amber-700 shrink-0">
        <FlagGlyph />
      </span>
      <span className="text-body-sm text-amber-700">{text}</span>
    </div>
  );
}
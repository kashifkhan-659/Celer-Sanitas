// Persistent "assist, not diagnose" line (Rules.md §1).
// Sits at the bottom of the page in teal, full width, unmissable at desktop widths.
// NEVER amber: amber is reserved for flagged items only (DESIGN.md §2.3).

export default function Disclaimer() {
  return (
    <p role="note" className="text-[17px] text-teal-800">
      Celer Sanitas assists your doctor, it doesn't diagnose. Clinical decisions rest with them.
    </p>
  );
}
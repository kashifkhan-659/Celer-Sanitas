// A single flagged item in the doctor's summary. Amber dot, amber-adjacent text.
//
// NOTE FOR REVIEW: DESIGN.md §2.3 specifies a 4px amber LEFT-BORDER rail for flagged items.
// This version uses a bullet instead, per the current design frame. Needs the project lead's
// sign-off before merge. If the rail is required, swap the <li> className for:
//   "flex items-start gap-2.5 border-l-4 border-amber-500 bg-amber-50 px-3 py-2 rounded-r-md"
//
// Either way the amber discipline holds: amber appears here and nowhere else in the app.

export default function FlaggedItem({ text }) {
  return (
    <li className="flex gap-2.5 text-[15px] leading-[1.7] text-neutral-500">
      <span
        aria-hidden="true"
        className="mt-[10px] h-[5px] w-[5px] shrink-0 rounded-full bg-amber-500"
      />
      <span>{text}</span>
    </li>
  );
}
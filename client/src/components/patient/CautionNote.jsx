// The "answer carefully" note (DESIGN.md §9; Rules.md §1). Small, calm, muted teal — deliberately
// NOT amber (amber is reserved for doctor flags) and NOT a legal-style banner. It reassures the
// patient that their answers matter; it must never read as a warning.
export default function CautionNote() {
  return (
    <p className="flex items-center gap-2 text-label text-neutral-700">
      <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      Answer honestly — your doctor uses this to care for you.
    </p>
  );
}

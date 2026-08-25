// Island CTA (DESIGN.md §9, §5B, §7.3). Fully-rounded pill; the trailing arrow lives in its own
// nested circle ("button-in-button") that shifts diagonally on hover for internal kinetic tension.
// Inline SVG arrow — no icon dependency for a single glyph.

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  trailingIcon = true,
  type = 'button',
}) {
  const base =
    'group inline-flex items-center gap-3 rounded-full px-6 py-3 font-semibold ' +
    'transition-[transform,background-color,box-shadow] duration-150 ease-settle active:scale-[0.98] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ' +
    'disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100';
  const skin =
    variant === 'primary'
      ? 'bg-teal-700 text-white hover:bg-teal-600'
      : 'bg-transparent text-teal-700 ring-1 ring-neutral-300 hover:bg-teal-50 hover:ring-teal-200';
  const iconSkin = variant === 'primary' ? 'bg-white/15 text-white' : 'bg-teal-50 text-teal-700';

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${skin}`}>
      <span className="text-body">{children}</span>
      {trailingIcon && (
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${iconSkin}
            transition-transform duration-150 ease-fluid
            group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105
            group-disabled:translate-x-0 group-disabled:translate-y-0 group-disabled:scale-100`}
        >
          <Arrow />
        </span>
      )}
    </button>
  );
}

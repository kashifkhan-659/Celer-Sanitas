// App shell for the doctor dashboard.
// Header: logo mark + wordmark on the left, "Doctor Dashboard" on the right, hairline beneath.
// Disclaimer sits at the bottom of the page (Rules.md §1 requires it visible in the UI).

import Disclaimer from './Disclaimer.jsx';

// Inline SVG rather than a file in /public: one less network request, no flash of missing
// logo on first paint. The gradient id is namespaced so it can't collide with other SVGs.
const Mark = ({ size = 30 }) => (
  <svg
    width={size}
    height={size}
    viewBox="100 40 460 440"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M123 359C202.117 219.365 296.604 138.806 492.5 52C429.294 119.39 388.032 167.399 355.921 217.064C348.017 229.555 340.571 242.046 333.643 254.421C323.343 273.21 313.832 292.901 304.5 314.5C409.069 255.091 460.948 215.042 543.5 133.5C472.062 293.478 355.5 432 290 464C251 474 162.157 413.179 123 359Z"
      fill="url(#celerMarkGradient)"
    />
    <defs>
      <linearGradient
        id="celerMarkGradient"
        x1="333.25"
        y1="52"
        x2="333.25"
        y2="465.088"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#164F49" />
        <stop offset="1" stopColor="#2A9D8F" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Layout({ children }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#EFF1F0] text-neutral-900">
      <header className="border-b border-neutral-200/70">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <Mark />
            <span className="text-[19px] font-medium tracking-tight text-neutral-900">
              Celer Sanitas
            </span>
          </div>
          <span className="text-[19px] text-neutral-800">Doctor Dashboard</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-8 pb-8 pt-12">{children}</main>

      <footer className="mx-auto w-full max-w-[1200px] px-8 pb-10">
        <Disclaimer />
      </footer>
    </div>
  );
}
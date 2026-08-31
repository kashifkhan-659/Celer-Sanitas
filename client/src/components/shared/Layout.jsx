// App shell for the doctor dashboard.
// Header: logo mark + wordmark on the left, "Doctor Dashboard" on the right, hairline beneath.
// Disclaimer sits at the bottom of the page (Rules.md §1 requires it visible in the UI).

import Disclaimer from './Disclaimer.jsx';

// Inline SVG so we don't ship an image file for one small mark.
const Mark = () => (
  <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
    <path
      d="M8 52 Q10 20 44 6 Q34 26 30 36 Q46 26 58 14 Q46 40 34 50 Q22 58 8 52 Z"
      fill="#1F7A70"
    />
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
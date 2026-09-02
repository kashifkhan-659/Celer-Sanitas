// App shell for the doctor dashboard.
// Header: logo mark + wordmark on the left, "Doctor Dashboard" on the right, hairline beneath.
// Disclaimer sits at the bottom of the page (Rules.md §1 requires it visible in the UI).

import Disclaimer from './Disclaimer.jsx';
import Mark from './Mark.jsx';

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
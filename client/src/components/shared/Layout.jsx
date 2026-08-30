// App shell for the doctor dashboard (DESIGN.md §4.3, §10).
// Doctor canvas is neutral-100 (denser feel than the patient's neutral-50) — this is the
// one visual signal that this is the doctor's view, not the patient's, before you read anything.
//
// The Disclaimer sits in the top bar rather than a footer, per Rules.md §1: "designed, visible,
// never hidden in a footer nobody reads."

import Disclaimer from './Disclaimer.jsx';

// `children` is React's built-in prop for "whatever was passed between <Layout>...</Layout>".
// So <Layout><Dashboard/></Layout> renders <Dashboard/> where {children} appears below.
export default function Layout({ children }) {
  return (
    <div className="min-h-[100dvh] bg-neutral-100 text-neutral-900">
      {/* Top bar — persistent across the whole doctor view. */}
      <header
        className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-100/85 backdrop-blur"
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
          {/* Brand mark — kept text-only for now; can swap in a logo later. */}
          <div className="flex items-baseline gap-2">
            <span className="text-subtitle font-semibold tracking-tight text-neutral-900">
              Celer Sanitas
            </span>
            <span className="text-label text-neutral-500">Doctor view</span>
          </div>

          {/* Persistent "assist, not diagnose" note. */}
          <Disclaimer />
        </div>
      </header>

      {/* Main content — whatever page renders inside <Layout>. */}
      <main className="mx-auto max-w-[1200px] px-6 py-6">
        {children}
      </main>
    </div>
  );
}
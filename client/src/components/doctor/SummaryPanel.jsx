 // SummaryPanel — right side of the doctor dashboard (DESIGN.md §4.3, §5B).
//
// One session at a time. Three render states based on the session's `status`:
//   'summarized' → show the AI summary text + amber-flagged items (the happy path)
//   'completed'  → summary not yet generated; show the raw transcript with a calm note
//   'error'      → Job C or safety check failed; show the raw transcript with a note
//
// A missing summary is NEVER an error surface (Rules.md §3, DESIGN.md §2.4 "no error-red").
// The tool degrades to showing the doctor the raw answers instead of pretending nothing happened.
//
// Uses the double-bezel shell (DESIGN.md §5) — this is one of the surfaces that gets depth.
// FlaggedItems inside do NOT get double-bezel — density trumps depth for list rows.

import { useFirestoreSession } from '../../hooks/useFirestoreSession.js';
import FlaggedItem from './FlaggedItem.jsx';

// `sessionId` is passed in from DoctorDashboard when the doctor picks a session in the list.
// Null/undefined means "nothing selected yet" — we show a calm empty state instead of crashing.
export default function SummaryPanel({ sessionId }) {
  const { session, loading, error } = useFirestoreSession(sessionId);

  // Empty state — no session selected. Doctor just landed on the dashboard.
  if (!sessionId) {
    return (
      <Shell>
        <EmptyState
          title="Select a session"
          body="Choose a completed intake from the list to see the patient's summary."
        />
      </Shell>
    );
  }

  if (loading) return <Shell><EmptyState title="Loading…" body="Fetching the session." /></Shell>;

  if (error) {
    return (
      <Shell>
        <EmptyState
          title="Couldn't load this session"
          body="Try selecting it again, or pick a different one."
        />
      </Shell>
    );
  }

  if (!session) {
    return <Shell><EmptyState title="Session not found" body="It may have been removed." /></Shell>;
  }

  // Session loaded. Decide which body to show based on status.
  return (
    <Shell>
      <Header session={session} />

      {session.status === 'summarized' && session.summary ? (
        <SummarizedBody summary={session.summary} />
      ) : (
        <FallbackBody session={session} />
      )}
    </Shell>
  );
}

// -- Sub-components below. Kept in the same file since none are reused elsewhere yet. --

// Double-bezel outer shell (DESIGN.md §5). Same recipe as PatientIntake's Shell but doctor-tuned:
// tighter padding (p-6 not p-10), no text-center (doctor content is left-aligned for scanning).
function Shell({ children }) {
  return (
    <div className="w-full rounded-[1.75rem] bg-neutral-200/70 p-1.5 ring-1 ring-neutral-200">
      <div
        className="rounded-[1.375rem] bg-white p-6
                   shadow-[0_24px_60px_-20px_rgba(20,40,38,0.16),0_8px_24px_-12px_rgba(20,40,38,0.08),inset_0_1px_0_rgba(255,255,255,0.70)]"
      >
        {children}
      </div>
    </div>
  );
}

// Top-of-panel meta: which symptom, which body region, when.
function Header({ session }) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-200 pb-4">
      <div>
        <div className="text-eyebrow uppercase text-neutral-500">Patient intake</div>
        <h2 className="mt-1 text-subtitle text-neutral-900">
          {prettyCategory(session.symptomCategory)}
          {session.bodyMapRegion && (
            <span className="text-neutral-500"> · {session.bodyMapRegion}</span>
          )}
        </h2>
      </div>
      <div className="text-label text-neutral-500">
        {formatDate(session.updatedAt ?? session.createdAt)}
      </div>
    </div>
  );
}

// The happy path — Job C ran, safety check passed, we have a summary.
function SummarizedBody({ summary }) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 text-eyebrow uppercase text-neutral-500">Summary</h3>
        <p className="text-body-sm text-neutral-800 whitespace-pre-line">{summary.text}</p>
      </section>

      {summary.flaggedItems?.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-eyebrow uppercase text-neutral-500">
            Flagged to verify
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 normal-case tracking-normal">
              {summary.flaggedItems.length}
            </span>
          </h3>
          {/* role="list" is implicit here — FlaggedItem sets role="listitem". */}
          <div className="space-y-2">
            {summary.flaggedItems.map((text, i) => (
              // `key` uses the index because the array of strings has no stable id. Fine here
              // because the list is short (2-3 items) and rebuilds fully when the session changes.
              <FlaggedItem key={i} text={text} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Fallback — no summary available. Show the raw Q&A so the doctor still has something useful.
function FallbackBody({ session }) {
  const noteText =
    session.status ===
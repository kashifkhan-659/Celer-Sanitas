// SummaryPanel — right column. Title and timestamp on one line, hairline, then sections.
// SUMMARY label in teal, FLAGGED TO VERIFY label in amber.
//
// A missing summary is never an error surface (Rules.md §3). When Job C hasn't run or the
// safety check rejected its output, the panel degrades to the raw answers instead.

import { useFirestoreSession } from '../../hooks/useFirestoreSession.js';
import FlaggedItem from './FlaggedItem.jsx';

export default function SummaryPanel({ sessionId }) {
  const { session, loading, error } = useFirestoreSession(sessionId);

  if (!sessionId) {
    return (
      <Shell centered>
        <EmptyState
          title="Select a session"
          body="Choose a completed intake from the list to see the patient's summary."
        />
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell centered>
        <EmptyState title="Loading…" body="Fetching the session." />
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell centered>
        <EmptyState
          title="Couldn't load this session"
          body="Try selecting it again, or pick a different one."
        />
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell centered>
        <EmptyState title="Session not found" body="It may have been removed." />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[17px] font-semibold text-neutral-900">
          {prettyCategory(session.symptomCategory)}
        </h2>
        <span className="shrink-0 text-[14px] text-neutral-500">
          {formatDate(session.updatedAt ?? session.createdAt)}
        </span>
      </div>

      <hr className="my-6 border-neutral-200/70" />

      {session.status === 'summarized' && session.summary ? (
        <SummarizedBody summary={session.summary} />
      ) : (
        <FallbackBody session={session} />
      )}
    </Shell>
  );
}

// Card shell. `centered` vertically centres the empty states so they sit mid-card
// rather than clinging to the top.
function Shell({ children, centered }) {
  return (
    <div
      className={
        'rounded-2xl bg-white px-8 py-7 shadow-[0_6px_28px_-10px_rgba(20,40,38,0.13),0_2px_8px_-4px_rgba(20,40,38,0.06)] ' +
        (centered ? 'flex min-h-[420px] items-center justify-center' : '')
      }
    >
      {children}
    </div>
  );
}

// Happy path: Job C ran, safety check passed, we have a summary.
function SummarizedBody({ summary }) {
  return (
    <>
      <section>
        <h3 className="text-[15px] font-medium tracking-wide text-teal-700">SUMMARY</h3>
        <p className="mt-4 text-[15px] leading-[1.75] text-neutral-500">{summary.text}</p>
      </section>

      {summary.flaggedItems?.length > 0 && (
        <>
          <hr className="my-6 border-neutral-200/70" />
          <section>
            <h3 className="text-[15px] font-medium tracking-wide text-amber-600">
              FLAGGED TO VERIFY
            </h3>
            <ul role="list" className="mt-4 space-y-1.5">
              {summary.flaggedItems.map((text, i) => (
                // Index key is fine here: the list is 2-3 items and rebuilds whenever the
                // selected session changes, so there's nothing to reorder.
                <FlaggedItem key={i} text={text} />
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}

// No summary available. Show the raw Q&A so the doctor still has something useful.
function FallbackBody({ session }) {
  const noteText =
    session.status === 'error'
      ? "The summary couldn't be generated for this session. The patient's answers are below."
      : "Summary is still being prepared. The patient's answers are below.";

  return (
    <>
      <p className="text-[14px] text-neutral-500">{noteText}</p>
      <hr className="my-6 border-neutral-200/70" />
      <section>
        <h3 className="text-[15px] font-medium tracking-wide text-teal-700">ANSWERS</h3>
        <dl className="mt-4 divide-y divide-neutral-200/70">
          {(session.answers ?? []).map((a) => (
            <div key={a.nodeId} className="grid grid-cols-[1fr,auto] gap-6 py-3">
              <dt className="text-[15px] text-neutral-500">{a.question}</dt>
              <dd className="text-right text-[15px] text-neutral-800">{a.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="max-w-sm text-center">
      <h3 className="text-[17px] text-neutral-800">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">{body}</p>
    </div>
  );
}

function prettyCategory(id) {
  if (!id) return 'Unknown';
  return id.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

function formatDate(d) {
  if (!(d instanceof Date)) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
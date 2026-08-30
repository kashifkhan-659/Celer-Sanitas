// SessionList — left rail of the doctor dashboard (DESIGN.md §4.3, §5B).
//
// Newest-first list of every session in Firestore. Each row: symptom category, status pill,
// timestamp. Clicking a row tells the parent (DoctorDashboard) which id is now selected.
//
// Density > depth on the list side (DESIGN.md §5B): no double-bezel per row, tight padding,
// hairline dividers. The selected row gets a teal-tinted left rail — teal because selection is
// *positive* attention; amber stays reserved for flagged items only.

import { useFirestoreSessions } from '../../hooks/useFirestoreSession.js';

// Props:
//   selectedId       — the currently-selected session id (or null)
//   onSelect(id)     — callback the parent gives us; called with the row's id when clicked
export default function SessionList({ selectedId, onSelect }) {
  const { sessions, loading, error } = useFirestoreSessions();

  return (
    <aside
      // Column shell — its own thin border but no double-bezel (DESIGN.md §5B rationale).
      className="rounded-2xl bg-white ring-1 ring-neutral-200 shadow-[0_4px_24px_-8px_rgba(20,40,38,0.10),0_2px_8px_-4px_rgba(20,40,38,0.06)]"
    >
      <header className="border-b border-neutral-200 px-4 py-3">
        <h2 className="text-eyebrow uppercase text-neutral-500">Sessions</h2>
        <p className="mt-1 text-body-sm text-neutral-700">
          {loading ? 'Loading…' : `${sessions.length} total`}
        </p>
      </header>

      {error ? (
        <EmptyMessage title="Couldn't load sessions" body="Check your connection and try again." />
      ) : !loading && sessions.length === 0 ? (
        <EmptyMessage title="No sessions yet" body="Completed patient intakes will appear here." />
      ) : (
        <ul role="list" className="max-h-[70vh] overflow-y-auto divide-y divide-neutral-200">
          {sessions.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              isSelected={s.id === selectedId}
              onClick={() => onSelect(s.id)}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}

// -- Sub-components --

function SessionRow({ session, isSelected, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        // aria-current tells screen readers which item in the list is the active one.
        aria-current={isSelected ? 'true' : undefined}
        // Selected state = subtle teal-50 tint + a 3px teal left rail. No amber, ever.
        // The rail uses border-l-[3px] for a slightly thinner line than the amber FlaggedItem rail
        // — this is selection, not a flag; visually it should feel lighter.
        className={
          'group flex w-full items-start justify-between gap-3 px-4 py-3 text-left ' +
          'transition-colors focus-visible:outline-none focus-visible:bg-teal-50/60 ' +
          (isSelected
            ? 'bg-teal-50 border-l-[3px] border-teal-500'
            : 'border-l-[3px] border-transparent hover:bg-neutral-50')
        }
      >
        <div className="min-w-0">
          <div className="text-body-sm font-medium text-neutral-900 truncate">
            {prettyCategory(session.symptomCategory)}
            {session.bodyMapRegion && (
              <span className="text-neutral-500 font-normal"> · {session.bodyMapRegion}</span>
            )}
          </div>
          <div className="mt-0.5 text-label text-neutral-500">
            {formatDate(session.createdAt)}
          </div>
        </div>
        <StatusPill status={session.status} />
      </button>
    </li>
  );
}

// A small pill showing the session's status. Neutral treatment for everything except summarized
// (soft teal = "ready to read") and error (soft neutral, NOT red — DESIGN.md §2.4 "no error-red").
function StatusPill({ status }) {
  const map = {
    summarized: { label: 'Ready', className: 'bg-teal-50 text-teal-700 ring-teal-100' },
    completed:  { label: 'Preparing', className: 'bg-neutral-100 text-neutral-600 ring-neutral-200' },
    error:      { label: 'Unavailable', className: 'bg-neutral-100 text-neutral-600 ring-neutral-200' },
  };
  const { label, className } = map[status] ?? { label: status || '—', className: 'bg-neutral-100 text-neutral-600 ring-neutral-200' };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-label ring-1 ${className}`}>
      {label}
    </span>
  );
}

function EmptyMessage({ title, body }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-body-sm font-medium text-neutral-700">{title}</p>
      <p className="mt-1 text-label text-neutral-500">{body}</p>
    </div>
  );
}

// Same tiny helpers as SummaryPanel. Duplicated deliberately — this is 4 lines each and keeping
// them local means SessionList and SummaryPanel don't couple through a shared utils file that only
// has two functions in it. Extract if a third caller shows up.
function prettyCategory(id) {
  if (!id) return 'Unknown';
  return id.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}
function formatDate(d) {
  if (!(d instanceof Date)) return '';
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
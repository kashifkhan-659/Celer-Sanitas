// SessionList — left column. White card, soft shadow, no visible border.
// Each row: category on the left, status as plain text on the right, timestamp beneath.
// Selected row gets a full-width teal-50 tint. Teal only; amber stays reserved for flags.

import { useFirestoreSessions } from '../../hooks/useFirestoreSession.js';

// Props:
//   selectedId    — id of the currently selected session, or null
//   onSelect(id)  — called with a row's id when the doctor clicks it
export default function SessionList({ selectedId, onSelect }) {
  const { sessions, loading, error } = useFirestoreSessions();

  return (
    <aside className="overflow-hidden rounded-2xl bg-white shadow-[0_6px_28px_-10px_rgba(20,40,38,0.13),0_2px_8px_-4px_rgba(20,40,38,0.06)]">
      <div className="flex items-baseline justify-between px-8 pb-6 pt-7">
        <h2 className="text-[15px] font-semibold tracking-wide text-neutral-900">SESSIONS</h2>
        <span className="text-[14px] text-neutral-500">
          {loading ? '—' : `${sessions.length} total`}
        </span>
      </div>

      {error ? (
        <EmptyMessage title="Couldn't load sessions" body="Check your connection and try again." />
      ) : !loading && sessions.length === 0 ? (
        <EmptyMessage title="No sessions yet" body="Completed patient intakes will appear here." />
      ) : (
        <ul role="list" className="max-h-[70vh] overflow-y-auto">
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

function SessionRow({ session, isSelected, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={isSelected ? 'true' : undefined}
        className={
          'flex w-full items-start justify-between gap-4 border-t border-neutral-200/70 px-8 py-5 text-left transition-colors ' +
          (isSelected ? 'bg-teal-50' : 'hover:bg-neutral-50/70')
        }
      >
        <div className="min-w-0">
          <div className="truncate text-[17px] text-neutral-900">
            {prettyCategory(session.symptomCategory)}
          </div>
          <div className="mt-1 text-[14px] text-neutral-500">{formatDate(session.createdAt)}</div>
        </div>
        <span className="shrink-0 pt-0.5 text-[14px] text-neutral-500">
          {statusLabel(session.status)}
        </span>
      </button>
    </li>
  );
}

// Maps the stored status onto what the doctor actually reads.
// Anything unrecognised (including legacy docs with no status) falls through to an em dash.
function statusLabel(status) {
  const map = { summarized: 'Ready', completed: 'Preparing', error: 'Unavailable' };
  return map[status] ?? '—';
}

function EmptyMessage({ title, body }) {
  return (
    <div className="border-t border-neutral-200/70 px-8 py-12 text-center">
      <p className="text-[15px] text-neutral-700">{title}</p>
      <p className="mt-1 text-[13px] text-neutral-500">{body}</p>
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
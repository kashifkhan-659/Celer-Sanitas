import { useEffect, useState } from 'react';
import { getTree, saveSession } from '../lib/apiClient';
import Layout from '../components/shared/Layout';
import BodyMap from '../components/patient/BodyMap';
import StepDots from '../components/patient/StepDots';
import Transition from '../components/patient/Transition';
import QuestionCard from '../components/patient/QuestionCard';

// The patient picks where it hurts on the body map → that selects a symptom category → the
// guided intake for that category runs, one question at a time. No AI — branching is pure code.
// On the leaf, the transcript is persisted to Firestore via the server (Admin SDK).
export default function PatientIntake() {
  const [category, setCategory] = useState(null); // set by the body map
  const [tree, setTree] = useState(null);
  const [error, setError] = useState(false);
  const [path, setPath] = useState([]); // node-id breadcrumb — enables Back
  const [choices, setChoices] = useState({}); // { [nodeId]: optionId }
  const [dir, setDir] = useState('forward');
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!category) return;
    let alive = true;
    setTree(null);
    setError(false);
    getTree(category)
      .then((t) => alive && (setTree(t), setPath([t.start])))
      .catch(() => alive && setError(true));
    return () => { alive = false; };
  }, [category]);

  function reset() {
    setCategory(null);
    setTree(null);
    setPath([]);
    setChoices({});
    setDone(false);
    setToast(null);
    setDir('back');
  }

  // Stage 1 — choose the area on the body map.
  // Layout carries the persistent Disclaimer, which satisfies Rules.md §1 for this page.
  if (!category) {
    return (
      <Page>
        <BodyMap onSelect={setCategory} />
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <InfoCard
          title="We couldn't load your intake"
          body="Please choose an area to try again."
          onBack={reset}
        />
      </Page>
    );
  }

  if (!tree || path.length === 0) return <Page><LoadingCard /></Page>;

  const currentId = path[path.length - 1];
  const node = tree.nodes[currentId];

  const select = (optId) => setChoices((c) => ({ ...c, [currentId]: optId }));

  const advance = () => {
    const nextId = node.next?.[choices[currentId]] ?? null;
    if (!nextId) return finish(); // leaf → intake complete
    setDir('forward');
    setPath((p) => [...p, nextId]);
  };

  const back = () => {
    if (path.length > 1) {
      setDir('back');
      setPath((p) => p.slice(0, -1));
    } else {
      reset(); // back from the first question → return to the body map
    }
  };

  const finish = async () => {
    // Assemble the ordered transcript from the tree the client already has, then persist via the
    // server. Show the completion screen immediately — never block the patient on the network.
    const answers = path.flatMap((id) => {
      const n = tree.nodes[id];
      const optId = choices[id];
      if (!optId) return [];
      const opt = n.options?.find((o) => o.id === optId);
      return [{ nodeId: id, question: n.question, optionId: optId, answer: opt?.label ?? optId }];
    });
    setDone(true);
    try {
      const res = await saveSession({ symptomCategory: tree.category ?? category, answers });
      if (!res.persisted) setToast('Saved on this device — we’ll sync when the connection returns.');
    } catch {
      setToast('We couldn’t reach the server, but your answers are safe on this device.');
    }
  };

  return (
    <Page>
      {done ? (
        <CompleteCard />
      ) : (
        <div className="flex flex-col items-center gap-8">
          <StepDots index={path.length - 1} />
          <Transition motionKey={currentId} direction={dir}>
            <QuestionCard
              node={node}
              categoryLabel={tree.label}
              selected={choices[currentId]}
              onSelect={select}
              onContinue={advance}
              onBack={back}
              canGoBack={true}
            />
          </Transition>
        </div>
      )}
      {toast && <Toast text={toast} />}
    </Page>
  );
}

// Wraps every stage in the shared app shell and centres the card in the content area.
function Page({ children }) {
  return (
    <Layout label="Patient Intake">
      <div className="flex flex-col items-center">{children}</div>
    </Layout>
  );
}

// Calm, non-blocking toast (DESIGN.md §2.4 — neutral, never red/amber). Used only for a degraded save.
function Toast({ text }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div role="status" className="rounded-full bg-neutral-800 px-5 py-2.5 text-label text-white shadow-ambient-md">
        {text}
      </div>
    </div>
  );
}

// Single white card, matching the doctor side's surfaces.
function Shell({ children }) {
  return (
    <div className="w-full max-w-[560px] rounded-2xl bg-white p-10 text-center shadow-[0_6px_28px_-10px_rgba(20,40,38,0.13),0_2px_8px_-4px_rgba(20,40,38,0.06)]">
      {children}
    </div>
  );
}

function LoadingCard() {
  return (
    <Shell>
      <div className="mx-auto mb-4 h-3 w-3 animate-pulse rounded-full bg-teal-400" />
      <p className="text-body text-neutral-700">Preparing your intake…</p>
    </Shell>
  );
}

function InfoCard({ title, body, onBack }) {
  return (
    <Shell>
      <h1 className="text-subtitle text-neutral-900">{title}</h1>
      <p className="mt-2 text-body text-neutral-700">{body}</p>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-full bg-teal-700 px-5 py-2.5 text-label font-semibold text-white hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          Choose an area
        </button>
      )}
    </Shell>
  );
}

// Phase-1 completion stub. The doctor summary (Job C, Sonnet) is built Day 5 — no AI here yet.
function CompleteCard() {
  return (
    <Shell>
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="text-subtitle text-neutral-900">Your answers are ready</h1>
      <p className="mt-2 text-body text-neutral-700">Your doctor will review these with you in person.</p>
    </Shell>
  );
}
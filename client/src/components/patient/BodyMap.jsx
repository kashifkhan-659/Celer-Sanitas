import { useState } from 'react';

// Illustrated (not clinical) body map — hand-authored raw SVG, no mapping library (Rules.md §2).
// Each region maps 1:1 to a symptom-tree category (Architecture.md §3): tapping a region (or its
// labelled pill) selects that category and starts the intake. Soft teal highlight-glow on select
// (DESIGN.md §6, §8); keyboard-accessible with a parallel list of region pills (DESIGN.md §11).
// A stylized, friendly figure (soft rounded blocks) — deliberately not an anatomical render.

const REGIONS = [
  { id: 'head', category: 'headache', label: 'Head', aria: 'Head' },
  { id: 'chest', category: 'chest_pain', label: 'Chest', aria: 'Chest' },
  { id: 'abdomen', category: 'abdominal_pain', label: 'Abdomen', aria: 'Abdomen or belly' },
];

export default function BodyMap({ onSelect }) {
  const [active, setActive] = useState(null); // region id currently showing the selected glow

  const choose = (region) => {
    if (active) return; // ignore extra taps while the glow plays
    setActive(region.id);
    // let the soft highlight-glow land before advancing into the questions
    setTimeout(() => onSelect(region.category), 420);
  };

  const onKey = (region) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(region);
    }
  };

  const regionClass = (id) =>
    'cursor-pointer stroke-neutral-400 outline-none transition-[fill] duration-320 ease-settle ' +
    'focus-visible:stroke-teal-600 focus-visible:[stroke-width:3] ' +
    (active === id ? 'fill-teal-200' : 'fill-neutral-100 hover:fill-teal-100');

  const glow = (id) => (active === id ? { filter: 'drop-shadow(0 0 8px rgba(44,156,153,0.55))' } : undefined);

  const [head, chest, abdomen] = REGIONS;

  return (
    // Double-bezel shell to match the question cards (DESIGN.md §5).
    <div className="w-full max-w-[560px] rounded-[1.75rem] bg-neutral-200/70 p-1.5 ring-1 ring-neutral-200">
      <div className="rounded-[1.375rem] bg-white p-8 md:p-10 shadow-[0_24px_60px_-20px_rgba(20,40,38,0.16),0_8px_24px_-12px_rgba(20,40,38,0.08),inset_0_1px_0_rgba(255,255,255,0.70)]">
        <p className="mb-4 inline-block rounded-full bg-teal-50 px-3 py-1 text-eyebrow uppercase text-teal-700">Intake</p>
        <h1 className="text-question text-neutral-900">Where does it bother you most?</h1>
        <p className="mt-2 text-body text-neutral-700">Tap the area on the figure, or choose below.</p>

        <div className="mt-6 flex justify-center">
          <svg viewBox="0 0 240 470" role="group" aria-label="Body map" className="h-[340px] w-auto" strokeWidth="2" strokeLinejoin="round">
            {/* decorative frame — neck, arms, legs (not interactive) */}
            <g className="fill-neutral-100 stroke-neutral-300" style={{ pointerEvents: 'none' }}>
              <rect x="111" y="74" width="18" height="22" rx="7" />
              <rect x="38" y="100" width="22" height="152" rx="11" />
              <rect x="180" y="100" width="22" height="152" rx="11" />
              <rect x="80" y="298" width="26" height="158" rx="13" />
              <rect x="134" y="298" width="26" height="158" rx="13" />
            </g>

            {/* interactive regions → each maps to a symptom category */}
            <circle cx="120" cy="48" r="30" tabIndex={0} role="button" aria-label={head.aria}
              className={regionClass('head')} style={glow('head')}
              onClick={() => choose(head)} onKeyDown={onKey(head)} />
            <rect x="62" y="92" width="116" height="106" rx="28" tabIndex={0} role="button" aria-label={chest.aria}
              className={regionClass('chest')} style={glow('chest')}
              onClick={() => choose(chest)} onKeyDown={onKey(chest)} />
            <rect x="74" y="196" width="92" height="106" rx="26" tabIndex={0} role="button" aria-label={abdomen.aria}
              className={regionClass('abdomen')} style={glow('abdomen')}
              onClick={() => choose(abdomen)} onKeyDown={onKey(abdomen)} />
          </svg>
        </div>

        {/* parallel list of region pills — discoverability + keyboard/AT fallback (DESIGN.md §11) */}
        <div role="group" aria-label="Choose an area" className="mt-6 flex flex-wrap justify-center gap-2">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => choose(r)}
              className={`rounded-full px-4 py-2 text-label ring-1 transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2
                ${active === r.id ? 'bg-teal-50 text-teal-700 ring-teal-200' : 'bg-white text-neutral-700 ring-neutral-300 hover:bg-neutral-50'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

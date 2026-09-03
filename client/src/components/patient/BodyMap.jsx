import { useState } from 'react';

// Illustrated (not clinical) body map. Rendered figure with three invisible hotspots over it,
// one per symptom-tree category (Architecture.md §3). Tapping a region (or its labelled pill)
// selects that category and starts the intake.
//
// The four figure states are separate images in /public. All four render stacked and crossfade
// between each other, so they're preloaded and the swap never flashes. Hotspot positions are
// percentages measured against the source images (1992x1112), so they hold at any display size.

const REGIONS = [
  // top/height are % of the figure box, measured from the teal bands in the source renders.
  { id: 'head', category: 'headache', label: 'Head', aria: 'Head', top: 4, height: 31 },
  { id: 'chest', category: 'chest_pain', label: 'Chest', aria: 'Chest', top: 35, height: 19 },
  { id: 'abdomen', category: 'abdominal_pain', label: 'Abdomen', aria: 'Abdomen or belly', top: 54, height: 22 },
];

// The figure occupies roughly x 41-58% of each image. Widened slightly for comfortable tapping.
const HOTSPOT_LEFT = 39;
const HOTSPOT_WIDTH = 22;

const FIGURES = {
  neutral: '/figure-neutral.png',
  head: '/figure-head.png',
  chest: '/figure-chest.png',
  abdomen: '/figure-abdomen.png',
};

export default function BodyMap({ onSelect }) {
  const [active, setActive] = useState(null); // region locked in after a tap
  const [preview, setPreview] = useState(null); // region under the cursor / keyboard focus

  // Which figure image is showing. A locked-in selection wins over a hover preview.
  const shown = active ?? preview ?? 'neutral';

  const choose = (region) => {
    if (active) return; // ignore extra taps while the highlight plays
    setActive(region.id);
    // let the highlight land before advancing into the questions
    setTimeout(() => onSelect(region.category), 420);
  };

  const onKey = (region) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(region);
    }
  };

  return (
    <div className="w-full max-w-[560px] rounded-2xl bg-white p-10 shadow-[0_6px_28px_-10px_rgba(20,40,38,0.13),0_2px_8px_-4px_rgba(20,40,38,0.06)]">
      <p className="text-[15px] font-semibold tracking-wide text-teal-800">INTAKE</p>
      <h1 className="mt-5 text-question text-neutral-900">Where does it bother you most?</h1>
      <p className="mt-2 text-body text-neutral-500">Tap the area on the figure, or choose below.</p>

      <div className="mt-6 flex justify-center">
        {/*
          Fixed aspect ratio matching the source images (1992/1112), so the percentage
          hotspots below stay lined up with the figure at every screen size.
        */}
        <div className="relative w-full max-w-[420px]" style={{ aspectRatio: '1992 / 1112' }}>
          {Object.entries(FIGURES).map(([key, src]) => (
            <img
              key={key}
              src={src}
              alt={key === 'neutral' ? 'Figure of a person' : ''}
              aria-hidden={key !== 'neutral'}
              draggable={false}
              fetchpriority={key === 'neutral' ? 'high' : 'low'}
              loading={key === 'neutral' ? 'eager' : 'lazy'}
              className={
                'absolute inset-0 h-full w-full select-none object-contain transition-opacity duration-300 ' +
                (shown === key ? 'opacity-100' : 'opacity-0')
              }
            />
          ))}

          {/* Invisible tap targets laid over the rendered figure. */}
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-label={r.aria}
              onClick={() => choose(r)}
              onKeyDown={onKey(r)}
              onMouseEnter={() => setPreview(r.id)}
              onMouseLeave={() => setPreview(null)}
              onFocus={() => setPreview(r.id)}
              onBlur={() => setPreview(null)}
              className="absolute rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              style={{
                left: `${HOTSPOT_LEFT}%`,
                width: `${HOTSPOT_WIDTH}%`,
                top: `${r.top}%`,
                height: `${r.height}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* parallel list of region pills — discoverability + keyboard/AT fallback (DESIGN.md §11) */}
      <div role="group" aria-label="Choose an area" className="mt-6 flex flex-wrap justify-center gap-4">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => choose(r)}
            onMouseEnter={() => setPreview(r.id)}
            onMouseLeave={() => setPreview(null)}
            onFocus={() => setPreview(r.id)}
            onBlur={() => setPreview(null)}
            className={`rounded-full px-6 py-2.5 text-label ring-1 transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2
              ${active === r.id
                ? 'bg-teal-50 text-teal-700 ring-teal-300'
                : 'bg-white text-teal-800 ring-teal-700/40 hover:bg-teal-50/50'}`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
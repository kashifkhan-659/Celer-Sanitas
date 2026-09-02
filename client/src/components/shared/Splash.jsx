// Splash screen shown once on load, then fades into the app.
//
// Kept short on purpose: patients reach this while unwell, so it holds for 1.5s and any
// click, tap, or keypress skips it immediately. Anyone with prefers-reduced-motion set
// goes straight through without seeing it.

import { useEffect, useState } from 'react';
import Mark from './Mark.jsx';

const HOLD_MS = 2500;
const FADE_MS = 700;

export default function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      onDone();
      return;
    }

    let fadeTimer;
    const start = () => {
      setLeaving(true);
      fadeTimer = setTimeout(onDone, FADE_MS);
    };

    const holdTimer = setTimeout(start, HOLD_MS);

    // Let people skip it. Any interaction dismisses.
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [onDone]);

  return (
    <div
      className={
        'fixed inset-0 z-50 flex flex-col bg-[#EFF1F0] transition-opacity duration-[400ms] ' +
        (leaving ? 'opacity-0' : 'opacity-100')
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8">
        <Mark size={190} />
        <div className="text-center">
          <div className="text-[52px] font-bold leading-none tracking-[0.02em] text-[#164F49]">
            CELER
          </div>
          <div className="mt-2 text-[34px] font-bold leading-none tracking-[0.06em] text-[#2A9D8F]">
            SANITAS
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 px-8 pb-8 text-[15px] text-neutral-800">
        <span className="inline-flex items-center gap-[2px]">
          For The Lo
          <Mark size={17} className="translate-y-[1px]" />
          e Of Humanity
        </span>
        <span>
          Developed by: <span className="font-semibold text-[#164F49]">Core 2 do</span>
        </span>
      </div>
    </div>
  );
}
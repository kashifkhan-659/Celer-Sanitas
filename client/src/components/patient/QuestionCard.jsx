import CautionNote from './CautionNote';
import Button from '../shared/Button';

// The hero patient surface (DESIGN.md §9). Double-bezel (§5): a machined "tray" (outer shell)
// holding an inset "plate" (inner core) with a top highlight, so it reads as physical hardware.
// One question, one card, generous breathing room. Amber never appears here.

const Check = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function QuestionCard({
  node,
  categoryLabel,
  selected,
  onSelect,
  onContinue,
  onBack,
  canGoBack,
}) {
  const options = node.options ?? [];

  return (
    // Outer shell (tray): concentric 28px radius, hairline ring, small padding.
    <div className="w-full max-w-[560px] rounded-[1.75rem] bg-neutral-200/70 p-1.5 ring-1 ring-neutral-200">
      {/* Inner core (plate): 22px radius (28 − 6 shell padding), soft ambient lift + machined top highlight. */}
      <div className="rounded-[1.375rem] bg-white p-8 md:p-10 shadow-[0_24px_60px_-20px_rgba(20,40,38,0.16),0_8px_24px_-12px_rgba(20,40,38,0.08),inset_0_1px_0_rgba(255,255,255,0.70)]">
        {categoryLabel && (
          <p className="mb-4 inline-block rounded-full bg-teal-50 px-3 py-1 text-eyebrow uppercase text-teal-700">
            {categoryLabel}
          </p>
        )}

        <h1 className="text-question text-neutral-900">{node.question}</h1>

        <div className="mt-7 flex flex-col gap-3" role="listbox" aria-label="Answer choices">
          {options.map((opt) => {
            const isSel = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isSel}
                onClick={() => onSelect(opt.id)}
                className={`flex min-h-[56px] items-center justify-between rounded-md px-5 text-left text-body-lg
                  transition-[transform,background-color,box-shadow] duration-320 ease-settle active:scale-[0.98]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2
                  ${isSel
                    ? 'bg-teal-50 text-neutral-900 ring-1 ring-teal-200 shadow-glow-teal'
                    : 'bg-white text-neutral-800 ring-1 ring-neutral-300 hover:bg-neutral-50'}`}
              >
                <span>{opt.label}</span>
                <span
                  className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-teal-700
                    transition-opacity duration-150 ${isSel ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Check />
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <CautionNote />
            {canGoBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-fit rounded text-label text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                ← Back
              </button>
            )}
          </div>
          <Button onClick={onContinue} disabled={!selected}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

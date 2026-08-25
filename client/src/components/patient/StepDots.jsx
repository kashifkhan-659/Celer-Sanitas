import { motion, useReducedMotion } from 'framer-motion';

// Soft step-dot progress (DESIGN.md §7.3, §9). Adaptive trees have no fixed length, so this is a
// calm *sense* of progress — never an exact count or percentage. Completed dots grow as you go;
// the active dot gently pops; a couple of muted dots hint "more to come".
// ponytail: soft indicator by design — a true length would be a false promise on a branching tree.
const UPCOMING_HINT = 2;

export default function StepDots({ index }) {
  const reduce = useReducedMotion();
  const done = Math.max(0, index); // number of answered questions before the current one

  const dots = [];
  for (let i = 0; i <= done; i++) dots.push({ key: `d${i}`, state: i === done ? 'active' : 'done' });
  for (let i = 0; i < UPCOMING_HINT; i++) dots.push({ key: `u${i}`, state: 'todo' });

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">Question {index + 1}</span>
      {dots.map((d) => {
        if (d.state === 'active') {
          return (
            <motion.span
              key={d.key}
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-teal-500"
              initial={false}
              animate={reduce ? {} : { scale: [1, 1.15, 1] }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            />
          );
        }
        if (d.state === 'done') {
          return <span key={d.key} aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-500/60" />;
        }
        return <span key={d.key} aria-hidden="true" className="h-2 w-2 rounded-full ring-1 ring-neutral-300" />;
      })}
    </div>
  );
}

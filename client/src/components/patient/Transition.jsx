import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Signature patient motion (DESIGN.md §7.3): one question at a time, calm slide + blur settle.
// Forward → new question enters from the right; Back → mirrored. Travel is intentionally short
// (16px) so it reads as a settle, not a carousel swipe. Reduced motion → ≤200ms opacity crossfade.

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir === 'back' ? -16 : 16, filter: 'blur(4px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: (dir) => ({ opacity: 0, x: dir === 'back' ? 16 : -16, filter: 'blur(4px)' }),
};

export default function Transition({ motionKey, direction = 'forward', children }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={motionKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={motionKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.56, ease: [0.32, 0.72, 0, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

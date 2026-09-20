import { useEffect, useRef, useState } from 'react';

/**
 * Becomes true the first time the element is `threshold` visible, then stays true.
 * Used to start one-time entrance animations.
 */
export function useInViewOnce<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/**
 * Counts from 0 to 1 over `duration` ms once `start` is true, easing out
 * (fast at first, slow at the end). Jumps straight to 1 for reduced motion.
 */
export function useCountUp(start: boolean, duration = 1600) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = requestAnimationFrame(() => setT(1));
      return () => cancelAnimationFrame(id);
    }
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const x = Math.min(1, (now - t0) / duration);
      setT(1 - Math.pow(1 - x, 3));   // ease-out cubic
      if (x < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, duration]);
  return t;
}

import { useEffect, useRef } from 'react';
import { CityScene } from '../scene/CityScene';

/**
 * A full-screen canvas fixed behind the page. It owns one CityScene and
 * runs its own animation loop (requestAnimationFrame), reading the scroll
 * position every frame. No React state changes per frame, so React never
 * re-renders while you scroll.
 */
export function CityBackdrop({ onReady }: { onReady?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new CityScene(canvas, { reducedMotion });

    const onResize = () => scene.resize(window.innerWidth, window.innerHeight);
    onResize();
    window.addEventListener('resize', onResize);

    // How far down the page are we, from 0 (top) to 1 (bottom)?
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    };

    // `shown` chases the real scroll value a little each frame. This smooths out
    // the jumpy steps a mouse wheel makes, so the sun glides instead of stepping.
    let shown = readScroll();
    let last = performance.now();
    let frame = 0;
    let announced = false;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = readScroll();
      shown += (target - shown) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 6));
      scene.update(shown, now / 1000);
      // Tell the page the city has drawn its first frame (the intro waits for this).
      if (!announced) { announced = true; onReady?.(); }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    // Cleanup when the component unmounts (and on hot reload during development).
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      scene.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className="city-backdrop" aria-hidden="true" />;
}

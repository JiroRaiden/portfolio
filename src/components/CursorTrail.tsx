import { useEffect, useRef } from 'react';

const LIFE = 450;       // ms each pixel lives
const SPACING = 9;      // px the mouse must move before a new pixel is dropped
const MAX = 22;         // pixels alive at once
const COLOURS = ['#3ee6d8', '#ff4fa0'];

type Dot = { x: number; y: number; t: number; c: string };

/**
 * The pixel trail behind the mouse: cyan and pink squares that shrink and fade.
 *
 * One full-screen <canvas> that ignores the mouse (pointer-events: none).
 * It only animates while there are pixels alive; when the mouse stops, the
 * loop stops too, so it costs nothing while you're reading.
 * Skipped on touch screens (no mouse) and for reduced motion.
 */
export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!fine || reduced || !canvas || !ctx) return;

    let dots: Dot[] = [];
    let count = 0;
    let frame = 0;

    // Match the canvas to the screen, at the screen's real pixel density.
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const now = performance.now();
      dots = dots.filter((d) => now - d.t < LIFE);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const d of dots) {
        const age = (now - d.t) / LIFE;
        // Size steps 6 → 4 → 2 (even numbers keep it pixel-crisp), opacity 0.8 → 0.
        const s = Math.max(2, Math.round((6 * (1 - age)) / 2) * 2);
        ctx.globalAlpha = 0.8 * (1 - age);
        ctx.fillStyle = d.c;
        // Snap to a 2px grid so the squares look like pixels, not smooth dots.
        ctx.fillRect(Math.round((d.x - s / 2) / 2) * 2, Math.round((d.y - s / 2) / 2) * 2, s, s);
      }
      frame = dots.length ? requestAnimationFrame(draw) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const last = dots[dots.length - 1];
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < SPACING) return;
      dots.push({ x: e.clientX, y: e.clientY, t: performance.now(), c: COLOURS[count++ % 2] });
      if (dots.length > MAX) dots.shift();
      if (!frame) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />;
}

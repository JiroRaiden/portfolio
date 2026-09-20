import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { projects } from '../content';
import { ProjectArt } from '../components/ProjectArt';
import { ProjectDialog } from '../components/ProjectDialog';
import { AllProjects } from '../components/AllProjects';
import { scrollToChapter } from '../components/scroll';

const MAX_CARDS = 7;      // more projects than this? The rest live behind "View more projects".
const DRIFT = 30;         // idle drift speed, px per second
const RESUME_AFTER = 1800; // ms to wait after you drag/scroll before the drift eases back in
const DRAG_START = 6;     // px the pointer must move before a press counts as a drag, not a click

/**
 * Chapter 02: an endless row of project cards.
 *
 * - The row drifts slowly left on its own (the idle animation).
 * - Sideways trackpad swipes, Shift + wheel, mouse drags and finger swipes move it by hand.
 *   A normal vertical wheel is left alone, so the page scrolls straight past.
 * - The cards are drawn twice, back to back. When the first copy has slid fully out of
 *   view we jump back by exactly one copy's width. The second copy is then exactly where
 *   the first one was, so the jump is invisible and the row never runs out.
 */
export function Works() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const [hovered, setHovered] = useState<string | null>(null);   // "copy-index", e.g. "0-2"
  const [focusInside, setFocusInside] = useState(false);
  const [open, setOpen] = useState<number | null>(null);          // index into projects
  const [showAll, setShowAll] = useState(false);
  const [loops, setLoops] = useState(true);                        // false when every card fits on screen

  const shown = projects.slice(0, MAX_CARDS);
  const hasMore = projects.length > MAX_CARDS;

  // Everything the animation loop needs, kept in a ref so it never causes a re-render.
  const motion = useRef({
    x: 0,               // how far the row is shifted left (px, negative)
    velocity: 0,        // leftover speed after a drag, px per second
    wheel: 0,           // sideways wheel distance still to apply
    speed: 0,           // current drift speed (eases towards its target)
    lastTouched: -1e9,  // when the visitor last moved the row by hand
    paused: false,      // hover, focus or an open popup
    dragging: false,
    dragged: false,     // the last press turned into a drag: swallow its click
  });
  // The animation loop reads `loops` without restarting.
  const loopsRef = useRef(loops);
  useEffect(() => { loopsRef.current = loops; }, [loops]);

  const paused = hovered !== null || focusInside || open !== null || showAll;
  useEffect(() => { motion.current.paused = paused; }, [paused]);

  useEffect(() => {
    const viewport = viewportRef.current!;
    const track = trackRef.current!;
    const set = setRef.current!;
    const m = motion.current;
    let setWidth = 0;

    // One copy's width, including the gap after it. Loop only if the cards overflow the screen.
    const measure = () => {
      setWidth = set.offsetWidth;
      setLoops(setWidth > viewport.clientWidth * 0.8);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(set);
    ro.observe(viewport);

    const touched = () => { m.lastTouched = performance.now(); };

    // Sideways wheel/trackpad (or Shift + wheel). Vertical scrolling is left to the page.
    const onWheel = (e: WheelEvent) => {
      const dx = e.shiftKey && e.deltaX === 0 ? e.deltaY : e.deltaX;
      if (Math.abs(dx) <= Math.abs(e.deltaY) && !e.shiftKey) return;
      e.preventDefault();
      m.wheel += dx;
      touched();
    };

    // Drag with a mouse, or swipe with a finger.
    let startX = 0, startRowX = 0, lastX = 0, lastT = 0, pointerId = -1;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startRowX = m.x;
      lastT = performance.now();
      m.dragged = false;
      m.velocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      if (!m.dragging && Math.abs(e.clientX - startX) > DRAG_START) {
        m.dragging = m.dragged = true;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add('is-dragging');
      }
      if (!m.dragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      m.velocity = 0.8 * ((e.clientX - lastX) / dt) + 0.2 * m.velocity;   // smoothed, for the fling
      lastX = e.clientX;
      lastT = now;
      m.x = startRowX + (e.clientX - startX);
      touched();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      pointerId = -1;
      if (m.dragging) {
        m.dragging = false;
        viewport.classList.remove('is-dragging');
        if (performance.now() - lastT > 80) m.velocity = 0;   // paused before letting go: no fling
        touched();
      }
    };
    // A drag ends with a click on whatever card is under the pointer. Swallow that click.
    const onClickCapture = (e: MouseEvent) => {
      if (m.dragged) { e.preventDefault(); e.stopPropagation(); m.dragged = false; }
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    viewport.addEventListener('pointerdown', onDown);
    viewport.addEventListener('pointermove', onMove);
    viewport.addEventListener('pointerup', onUp);
    viewport.addEventListener('pointercancel', onUp);
    viewport.addEventListener('click', onClickCapture, true);

    // The animation loop only runs while Works is on screen.
    let frame = 0;
    let last = performance.now();
    const cards = () => set.querySelectorAll<HTMLElement>('.wcard:not(.wcard--more)');
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Drift: full speed when idle, easing to a stop on hover/focus and just after you touch it.
      const idle = !m.paused && !m.dragging && now - m.lastTouched > RESUME_AFTER;
      const target = !reduced && idle ? DRIFT : 0;
      m.speed += (target - m.speed) * (1 - Math.exp(-dt * 2.5));

      if (!m.dragging) {
        m.x -= m.speed * dt;
        m.x += m.velocity * dt;                         // fling after a drag...
        m.velocity *= Math.exp(-dt * 4);                // ...slowing down like friction
        const step = m.wheel * (1 - Math.exp(-dt * 14)); // wheel steps become a glide
        m.x -= step;
        m.wheel -= step;
      }

      if (setWidth > 0 && loopsRef.current) {
        // Keep x within one copy's width; the second copy makes the wrap invisible.
        m.x = ((m.x % setWidth) - setWidth) % setWidth;
      } else {
        m.x = Math.min(0, Math.max(m.x, viewport.clientWidth - track.scrollWidth));
      }
      track.style.transform = `translate3d(${m.x}px, 0, 0)`;

      // Progress: how far through one lap, and which card is at the left edge.
      if (setWidth > 0) {
        const lap = -m.x / setWidth;
        if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.02, lap)})`;
        if (countRef.current) {
          let idx = 0;
          cards().forEach((c, i) => { if (c.offsetLeft + c.offsetWidth / 2 < -m.x) idx = i + 1; });
          const n = shown.length;
          countRef.current.textContent = `${String((idx % n) + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
        }
      }
      frame = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(frame);
      if (e.isIntersecting) { last = performance.now(); frame = requestAnimationFrame(loop); }
    });
    io.observe(viewport);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      viewport.removeEventListener('wheel', onWheel);
      viewport.removeEventListener('pointerdown', onDown);
      viewport.removeEventListener('pointermove', onMove);
      viewport.removeEventListener('pointerup', onUp);
      viewport.removeEventListener('pointercancel', onUp);
      viewport.removeEventListener('click', onClickCapture, true);
    };
  }, [reduced, shown.length]);

  // Other chapters (e.g. Arsenal's "Proven in" buttons) can ask to open a project:
  // window.dispatchEvent(new CustomEvent('open-project', { detail: projectIndex }))
  useEffect(() => {
    const onOpen = (e: Event) => {
      const i = (e as CustomEvent<number>).detail;
      if (!projects[i]) return;
      scrollToChapter('works');
      setOpen(i);
    };
    window.addEventListener('open-project', onOpen);
    return () => window.removeEventListener('open-project', onOpen);
  }, []);

  // Keyboard: tabbing to a card slides the row so that card sits at the left edge.
  const bringIntoView = (el: HTMLElement) => {
    motion.current.x = -el.offsetLeft;
    motion.current.wheel = 0;
    motion.current.velocity = 0;
  };

  // One copy of the row. The second copy is only there for the seamless loop:
  // hidden from screen readers and the keyboard (`inert`).
  const renderSet = (copy: number) => (
    <div
      ref={copy === 0 ? setRef : undefined}
      className="wset"
      aria-hidden={copy === 1 || undefined}
      inert={copy === 1 || undefined}
    >
      {shown.map((p, i) => {
        const key = `${copy}-${i}`;
        return (
          <button
            key={p.num}
            type="button"
            className={`wcard${hovered === key ? ' is-hover' : ''}`}
            style={{ '--accent': p.accent } as CSSProperties}
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(key); }}
            onPointerLeave={() => setHovered((h) => (h === key ? null : h))}
            onFocus={(e) => { setHovered(key); bringIntoView(e.currentTarget); }}
            onBlur={() => setHovered((h) => (h === key ? null : h))}
            onClick={() => setOpen(i)}
            aria-haspopup="dialog"
          >
            <span className="wcard__art"><ProjectArt num={p.num} /></span>
            <span className="wcard__body">
              <span className="wcard__top">
                <span className="wcard__num">{p.num}</span>
                <span className="wcard__kind">{p.kind}</span>
              </span>
              <span className="wcard__title">{p.title}</span>
              <span className="wcard__tagline">{p.tagline}</span>
              <span className="wcard__stack">{p.stack.slice(0, 3).join(' · ')}</span>
            </span>
          </button>
        );
      })}

      {hasMore && (
        <button
          type="button"
          className="wcard wcard--more"
          onClick={() => setShowAll(true)}
          onFocus={(e) => bringIntoView(e.currentTarget)}
          aria-haspopup="dialog"
        >
          <span className="wcard-more__count">+{projects.length - MAX_CARDS}</span>
          <span className="wcard-more__label">VIEW MORE PROJECTS</span>
          <span className="wcard-more__arrow" aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );

  return (
    <section id="works" className="chapter chapter--works" aria-labelledby="works-title">
      <div className="chapter-head">
        <div>
          <span className="kicker">CHAPTER 02</span>
          <h2 id="works-title" className="chapter-title">WORKS</h2>
        </div>
        <p className="works__hints">
          <span className="hint-mouse"><b className="t-cream">DRAG</b> OR <b className="t-cream">SHIFT + SCROLL</b></span>
          <span className="hint-mouse"><b className="t-pink">HOVER</b> TO FOCUS</span>
          <span className="hint-mouse"><b className="t-cyan">CLICK</b> TO OPEN</span>
          <span className="hint-touch"><b className="t-cream">SWIPE</b> TO BROWSE</span>
          <span className="hint-touch"><b className="t-cyan">TAP</b> TO OPEN</span>
        </p>
      </div>

      <div
        ref={viewportRef}
        className={`works-viewport${hovered !== null ? ' has-hover' : ''}`}
        onFocus={() => setFocusInside(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusInside(false); }}
      >
        <div ref={trackRef} className="wtrack">
          {renderSet(0)}
          {loops && renderSet(1)}
        </div>
      </div>

      <div className="works-progress" aria-hidden="true">
        <span ref={countRef} className="works-progress__count">01 / {String(shown.length).padStart(2, '0')}</span>
        <span className="works-progress__track"><span ref={barRef} className="works-progress__fill" /></span>
      </div>

      {showAll && (
        <AllProjects items={projects} onOpen={(i) => setOpen(i)} onClose={() => setShowAll(false)} />
      )}
      {open !== null && <ProjectDialog project={projects[open]} onClose={() => setOpen(null)} />}
    </section>
  );
}

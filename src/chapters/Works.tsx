import { useEffect, useRef, useState } from 'react';
import { projects } from '../content';
import { ProjectArt } from '../components/ProjectArt';
import { ProjectDialog } from '../components/ProjectDialog';
import { AllProjects } from '../components/AllProjects';
import { scrollToChapter } from '../components/scroll';

const MAX_CARDS = 7;   // more projects than this? The rest live behind "View more projects".
const GLIDE = 10;      // how quickly the row catches up with your scroll (higher = snappier)

/**
 * Chapter 02: a pinned, horizontally scrolling row of project cards.
 *
 * How the pin works:
 *  - The <section> is made taller than the screen by exactly the row's extra width.
 *  - Inside it, `.works-pin` is `position: sticky; top: 0`, so it stays on screen
 *    while you scroll through that extra height.
 *  - Scrolling down by N pixels inside the section moves the row left by N pixels.
 *  - After the last card, the section ends and the page scrolls normally again.
 */
export function Works() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  const [hovered, setHovered] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);          // index into projects
  const [showAll, setShowAll] = useState(false);

  const shown = projects.slice(0, MAX_CARDS);
  const hasMore = projects.length > MAX_CARDS;
  const geometry = useRef({ distance: 0, x: 0 });

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current!;
    const viewport = viewportRef.current!;
    const track = trackRef.current!;
    const g = geometry.current;

    // How far the row has to travel, and therefore how tall the section must be.
    const measure = () => {
      g.distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      section.style.height = `${window.innerHeight + g.distance}px`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(viewport);
    window.addEventListener('resize', measure);

    // 0 when the section's top reaches the top of the screen, 1 when the last card is in view.
    const progress = () => {
      if (g.distance === 0) return 0;
      const top = section.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, -top / g.distance));
    };

    let last = performance.now();
    let frame = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = progress();
      const target = -p * g.distance;
      // Ease towards the target so wheel "steps" turn into a smooth glide.
      g.x += (target - g.x) * (1 - Math.exp(-dt * GLIDE));
      if (Math.abs(target - g.x) < 0.1) g.x = target;
      track.style.transform = `translate3d(${g.x}px, 0, 0)`;

      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.02, p)})`;
      if (countRef.current) {
        // Count the cards you've seen: those whose middle has come into view.
        const rightEdge = -g.x + viewport.clientWidth;
        const cards = track.querySelectorAll<HTMLElement>('.wcard:not(.wcard--more)');
        let seen = 0;
        cards.forEach((c) => { if (c.offsetLeft + c.offsetWidth / 2 < rightEdge) seen++; });
        countRef.current.textContent = `${String(Math.max(1, seen)).padStart(2, '0')} / ${String(shown.length).padStart(2, '0')}`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      section.style.height = '';
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

  // Keyboard: tabbing to a card scrolls the page so that card is in the middle.
  const bringIntoView = (el: HTMLElement) => {
    const g = geometry.current;
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (reduced || !section || !viewport || g.distance === 0) return;
    const wanted = el.offsetLeft - (viewport.clientWidth - el.offsetWidth) / 2;
    const p = Math.min(1, Math.max(0, wanted / g.distance));
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: sectionTop + p * g.distance });
  };

  return (
    <section
      id="works"
      ref={sectionRef}
      className={`chapter chapter--works${reduced ? ' is-static' : ''}`}
      aria-labelledby="works-title"
    >
      <div className="works-pin">
        <div className="chapter-head">
          <div>
            <span className="kicker">CHAPTER 02</span>
            <h2 id="works-title" className="chapter-title">WORKS</h2>
          </div>
          <p className="works__hints">
            <span className="hint-mouse"><b className="t-cream">SCROLL</b> TO BROWSE</span>
            <span className="hint-mouse"><b className="t-pink">HOVER</b> TO FOCUS</span>
            <span className="hint-mouse"><b className="t-cyan">CLICK</b> TO OPEN</span>
            <span className="hint-touch"><b className="t-cream">SWIPE UP</b> TO BROWSE</span>
            <span className="hint-touch"><b className="t-cyan">TAP</b> TO OPEN</span>
          </p>
        </div>

        <div ref={viewportRef} className={`works-viewport${hovered !== null ? ' has-hover' : ''}`}>
          <div ref={trackRef} className="wtrack">
            {shown.map((p, i) => (
              <button
                key={p.num}
                type="button"
                className={`wcard${hovered === i ? ' is-hover' : ''}`}
                style={{ '--accent': p.accent } as React.CSSProperties}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(i); }}
                onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
                onFocus={(e) => { setHovered(i); bringIntoView(e.currentTarget); }}
                onBlur={() => setHovered((h) => (h === i ? null : h))}
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
            ))}

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
        </div>

        {!reduced && (
          <div className="works-progress" aria-hidden="true">
            <span ref={countRef} className="works-progress__count">01 / {String(shown.length).padStart(2, '0')}</span>
            <span className="works-progress__track"><span ref={barRef} className="works-progress__fill" /></span>
          </div>
        )}
      </div>

      {showAll && (
        <AllProjects items={projects} onOpen={(i) => setOpen(i)} onClose={() => setShowAll(false)} />
      )}
      {open !== null && <ProjectDialog project={projects[open]} onClose={() => setOpen(null)} />}
    </section>
  );
}

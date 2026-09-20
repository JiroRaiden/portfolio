import { useEffect, useState } from 'react';
import { chapters, type ChapterId } from '../content';
import { scrollToChapter } from './scroll';

/**
 * The chapter list on the left. It highlights the chapter that covers the
 * middle of the screen.
 *
 * How: on scroll (at most once per frame), measure the five sections and pick
 * the one whose top is above the middle line and whose bottom is below it.
 * This stays correct inside the pinned Works section, which is taller than the
 * screen (an IntersectionObserver on a thin middle line missed it there).
 */
export function ChapterNav() {
  const [active, setActive] = useState<ChapterId>('origin');

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      for (const c of chapters) {
        const el = document.getElementById(c.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= middle && r.bottom > middle) {
          setActive(c.id);   // React skips the re-render if it's already the active one
          return;
        }
      }
    };
    // Throttle to one measurement per frame, however fast scroll events arrive.
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <nav className="chapter-nav" aria-label="Chapters">
      {chapters.map((c) => (
        <a
          key={c.id}
          href={`#${c.id}`}
          className={c.id === active ? 'is-active' : undefined}
          aria-current={c.id === active ? 'true' : undefined}
          onClick={(e) => { e.preventDefault(); scrollToChapter(c.id); }}
        >
          <span className="chapter-nav__line" />
          {c.num} · {c.label}
        </a>
      ))}
    </nav>
  );
}

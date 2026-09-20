import { useState } from 'react';
import { profile, projects } from '../content';
import { scrollToChapter } from '../components/scroll';

export function Origin() {
  const featured = projects.filter((p) => p.featured);
  const [focus, setFocus] = useState(0); // which card is highlighted

  return (
    <section id="origin" className="chapter chapter--origin" aria-labelledby="origin-title">
      <div className="origin__hero">
        <span className="kicker">PORTFOLIO</span>
        <h1 id="origin-title" className="origin__name">
          <span>{profile.name.first}</span>
          <span className="origin__last">{profile.name.last}</span>
        </h1>
        <span className="origin__tagline">{profile.tagline}</span>
        <p className="origin__blurb">{profile.blurb}</p>
        <div className="origin__actions">
          <a className="btn-primary" href="#works" onClick={(e) => { e.preventDefault(); scrollToChapter('works'); }}>
            BEGIN THE JOURNEY
          </a>
          <span className="origin__school">{profile.school}</span>
        </div>
      </div>

      <aside className="featured" aria-label="Featured works">
        <div className="featured__head">
          <span>FEATURED WORKS</span>
          <a href="#works" onClick={(e) => { e.preventDefault(); scrollToChapter('works'); }}>
            ALL {projects.length} →
          </a>
        </div>
        {featured.map((p, i) => (
          <a
            key={p.num}
            href="#works"
            className={`work-card${i === focus ? ' is-focus' : ''}`}
            style={{ '--accent': p.accent } as React.CSSProperties}
            onMouseEnter={() => setFocus(i)}
            onFocus={() => setFocus(i)}
            onClick={(e) => { e.preventDefault(); scrollToChapter('works'); }}
          >
            <span className="work-card__num">{p.num}</span>
            <span className="work-card__body">
              <span className="work-card__top">
                <span className="work-card__title">{p.title}</span>
                <span className="work-card__tag">{p.tag}</span>
              </span>
              <span className="work-card__summary">{p.summary}</span>
              <span className="work-card__chips">
                {p.stack.slice(0, 3).map((s, k) => (
                  <span key={s} className={k === 0 ? 'chip chip--accent' : 'chip'}>{s}</span>
                ))}
              </span>
            </span>
          </a>
        ))}
      </aside>

      <span className="scroll-cue" aria-hidden="true"><span />SCROLL TO WATCH THE SUN SET</span>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { skills, skillCategories, badges, projects, type SkillCategory } from '../content';
import { icons } from '../assets/icons';

const COLUMNS = 5;
type Filter = 'ALL' | SkillCategory;

/**
 * Chapter 03: skills as an inventory.
 * - Slots fly in from four directions the first time the chapter scrolls into view.
 * - Category tabs light up one group and dim the rest.
 * - Hover / focus / click a slot to see what it was used for and which projects prove it.
 * - "Proven in" buttons jump to that project in Works (via an 'open-project' event).
 */
export function Arsenal() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [selected, setSelected] = useState(0);

  // Play the fly-in once, when a quarter of the grid is on screen.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEntered(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pickFilter = (f: Filter) => {
    setFilter(f);
    const first = skills.findIndex((s) => f === 'ALL' || s.category === f);
    if (first >= 0) setSelected(first);
  };

  const skill = skills[selected];
  const colour = skillCategories[skill.category];
  const proven = skill.provenIn
    .map((num) => projects.findIndex((p) => p.num === num))
    .filter((i) => i >= 0);

  return (
    <section id="arsenal" className="chapter chapter--arsenal" aria-labelledby="arsenal-title">
      <div className="chapter-head">
        <div>
          <span className="kicker">CHAPTER 03</span>
          <h2 id="arsenal-title" className="chapter-title">ARSENAL</h2>
        </div>
        <p className="chapter-intro">Every item here was earned in a real build. Pick one to see where it was used.</p>
      </div>

      <div className="arsenal-tabs" role="group" aria-label="Filter skills by category">
        {(['ALL', ...Object.keys(skillCategories)] as Filter[]).map((f) => {
          const c = f === 'ALL' ? 'var(--text)' : skillCategories[f];
          return (
            <button
              key={f}
              type="button"
              className={`arsenal-tab${filter === f ? ' is-on' : ''}`}
              style={{ '--c': c } as React.CSSProperties}
              aria-pressed={filter === f}
              onClick={() => pickFilter(f)}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="arsenal-body">
        <div ref={gridRef} className={`arsenal-grid${entered ? ' is-entered' : ''}`}>
          {skills.map((s, i) => {
            const col = i % COLUMNS;
            const row = Math.floor(i / COLUMNS);
            const rows = Math.ceil(skills.length / COLUMNS);
            // Where this slot flies in from: top row from above, bottom row from below,
            // left columns from the left, right columns from the right, middle column up/down.
            let from = [0, 0];
            if (row === 0) from = [0, -140];
            else if (row === rows - 1) from = [0, 140];
            else if (col < 2) from = [-180, 0];
            else if (col > 2) from = [180, 0];
            else from = [0, row % 2 ? -140 : 140];
            // Ripple outwards from the centre of the grid.
            const ring = Math.abs(col - (COLUMNS - 1) / 2) + Math.abs(row - (rows - 1) / 2);
            const inFilter = filter === 'ALL' || s.category === filter;
            return (
              <button
                key={s.name}
                type="button"
                className={`slot${i === selected ? ' is-selected' : ''}${inFilter ? '' : ' is-dim'}`}
                style={{
                  '--c': skillCategories[s.category],
                  '--fx': `${from[0]}px`,
                  '--fy': `${from[1]}px`,
                  '--delay': `${Math.round(ring * 90)}ms`,
                } as React.CSSProperties}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setSelected(i); }}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
                aria-label={s.name}
              >
                <span className="slot__icon" aria-hidden="true">
                  {s.icon ? <img src={icons[s.icon]} alt="" /> : <span className="slot__short">{s.short}</span>}
                  {s.icon2 && <img className="slot__icon2" src={icons[s.icon2]} alt="" />}
                </span>
                <span className="slot__name">{s.name}</span>
              </button>
            );
          })}
        </div>

        <article className="skill-card" style={{ '--c': colour } as React.CSSProperties} aria-live="polite">
          <div className="skill-card__head">
            <div className="skill-card__icon" aria-hidden="true">
              {skill.icon ? <img src={icons[skill.icon]} alt="" /> : <span className="slot__short">{skill.short}</span>}
              {skill.icon2 && <img className="slot__icon2" src={icons[skill.icon2]} alt="" />}
            </div>
            <div>
              <span className="skill-card__cat">{skill.category}</span>
              <h3 className="skill-card__name">{skill.name}</h3>
              <span className="skill-card__count">USED IN {proven.length} {proven.length === 1 ? 'PROJECT' : 'PROJECTS'}</span>
            </div>
          </div>
          <div>
            <span className="skill-card__label">USED FOR</span>
            <p className="skill-card__text">{skill.usedFor}</p>
          </div>
          <div>
            <span className="skill-card__label">PROVEN IN</span>
            <div className="skill-card__proof">
              {proven.map((i) => (
                <button
                  key={projects[i].num}
                  type="button"
                  className="proof"
                  style={{ '--pc': projects[i].accent } as React.CSSProperties}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-project', { detail: i }))}
                >
                  <span className="proof__dot" />
                  {projects[i].title}
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </div>
          <span className="skill-card__foot">ITEM {String(selected + 1).padStart(2, '0')} / {skills.length}</span>
        </article>
      </div>

      <div className="badges">
        <span className="badges__label">BADGE</span>
        {badges.map((b) => (
          <div key={b.title} className="badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="9" r="6" /><path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
            </svg>
            <span className="badge__title">{b.title}</span>
            <span className="badge__meta">{b.issuer} · {b.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

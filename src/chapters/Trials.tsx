import type { CSSProperties } from 'react';
import { leetcode, trials, projects, profile } from '../content';
import { icons } from '../assets/icons';
import { useInViewOnce, useCountUp } from '../components/useInViewOnce';

const LEVELS = [
  { key: 'easy', label: 'EASY', colour: 'var(--cyan)' },
  { key: 'medium', label: 'MEDIUM', colour: 'var(--cream)' },
  { key: 'hard', label: 'HARD', colour: 'var(--pink)' },
] as const;

/**
 * Chapter 04: the LeetCode record and a timeline of trials.
 * - Numbers, ring and bars count up the first time the record scrolls into view.
 * - Log entries slide in one after another; build buttons open that project in Works.
 */
export function Trials() {
  const [recordRef, recordSeen] = useInViewOnce<HTMLDivElement>(0.35);
  const [logRef, logSeen] = useInViewOnce<HTMLOListElement>(0.2);
  const t = useCountUp(recordSeen);

  const { solved } = leetcode;
  const total = solved.easy + solved.medium + solved.hard;
  const most = Math.max(solved.easy, solved.medium, solved.hard);
  const n = (value: number) => Math.round(value * t);

  return (
    <section id="trials" className="chapter chapter--trials" aria-labelledby="trials-title">
      <div className="chapter-head">
        <div>
          <span className="kicker">CHAPTER 04</span>
          <h2 id="trials-title" className="chapter-title">TRIALS</h2>
        </div>
        <p className="chapter-intro">Problems solved against the clock, and the road so far.</p>
      </div>

      <div className="trials-body">
        {/* ---------- LeetCode record ---------- */}
        <div ref={recordRef} className="record">
          <div className="record__head">
            <span className="record__label">COMBAT RECORD</span>
            <a className="record__link" href={profile.links.leetcode} target="_blank" rel="noopener">
              <img src={icons.leetcode} alt="" width="16" height="16" />
              LEETCODE <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="record__solved">
            <div className="record__dial">
              <SolvedRing t={t} total={total} />
              <div className="record__big" aria-hidden="true">
                <span className="record__num">{n(total)}</span>
                <span className="record__unit">SOLVED</span>
              </div>
            </div>
            <ul className="record__bars">
              {LEVELS.map((l) => (
                <li key={l.key} style={{ '--c': l.colour } as CSSProperties}>
                  <span className="record__bar-label">{l.label}</span>
                  <span className="record__bar-count">{n(solved[l.key])}</span>
                  <span className="record__bar" aria-hidden="true">
                    <span style={{ transform: `scaleX(${(solved[l.key] / most) * t})` }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="record__contest">
            <div>
              <span className="record__label">CONTEST RATING</span>
              <span className="record__rating">{n(leetcode.rating)}</span>
            </div>
            <dl className="record__stats">
              <div><dt>GLOBAL</dt><dd>TOP {leetcode.topPercent}%</dd></div>
              <div><dt>CONTESTS</dt><dd>{n(leetcode.contests)}</dd></div>
            </dl>
          </div>

          <span className="record__foot">AS OF {leetcode.asOf}</span>

          {/* The animated numbers are hidden from screen readers; they get this instead. */}
          <p className="sr-only">
            {total} LeetCode problems solved: {solved.easy} easy, {solved.medium} medium, {solved.hard} hard.
            Contest rating {leetcode.rating}, top {leetcode.topPercent}% globally, {leetcode.contests} contests.
          </p>
        </div>

        {/* ---------- Trial log ---------- */}
        <div className="log">
          <span className="record__label">TRIAL LOG</span>
          <ol ref={logRef} className={`log__list${logSeen ? ' is-entered' : ''}`}>
            {trials.map((trial, i) => (
              <li key={trial.when} className={`trial trial--${trial.state}`} style={{ '--delay': `${i * 140}ms` } as CSSProperties}>
                <span className="trial__marker" aria-hidden="true" />
                <div className="trial__card">
                  <div className="trial__top">
                    <span className="trial__when">{trial.when}</span>
                    {trial.state === 'locked' && <LockIcon />}
                    {trial.state === 'now' && <span className="trial__tag">IN PROGRESS</span>}
                  </div>
                  <h3 className="trial__title">{trial.title}</h3>
                  <p className="trial__detail">{trial.detail}</p>
                  {trial.projects && (
                    <div className="trial__builds">
                      {trial.projects
                        .map((num) => projects.findIndex((p) => p.num === num))
                        .filter((idx) => idx >= 0)
                        .map((idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="proof"
                            style={{ '--pc': projects[idx].accent } as CSSProperties}
                            onClick={() => window.dispatchEvent(new CustomEvent('open-project', { detail: idx }))}
                          >
                            <span className="proof__dot" />
                            {projects[idx].title}
                            <span aria-hidden="true">→</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Ring split into easy / medium / hard; each arc grows with t (0 → 1). */
function SolvedRing({ t, total }: { t: number; total: number }) {
  const r = 52;
  const C = 2 * Math.PI * r;
  const gap = 4 * t;   // small gaps between arcs, which appear as the ring fills
  // Each arc's length, and where it starts (the total of the arcs before it).
  const lens = LEVELS.map((l) => (leetcode.solved[l.key] / total) * C * t);
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <svg className="record__ring" viewBox="0 0 132 132" aria-hidden="true">
      <circle cx="66" cy="66" r={r} className="record__track" />
      {LEVELS.map((l, i) => (
        <circle
          key={l.key}
          cx="66" cy="66" r={r}
          stroke={l.colour}
          strokeDasharray={`${Math.max(0, lens[i] - gap)} ${C}`}
          strokeDashoffset={-starts[i]}
        />
      ))}
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="trial__lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" aria-label="Locked" role="img">
      <rect x="4" y="11" width="16" height="10" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

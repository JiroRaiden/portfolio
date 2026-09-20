import { useEffect, useRef, useState } from 'react';
import { welcomes } from '../content';

type Phase = 'words' | 'welcome' | 'glitch' | 'zoom' | 'done';

const WORD_MS = 175;        // each language flashes for this long
const START_MS = 250;       // pause before the first word
const HOLD_MS = 650;        // English WELCOME holds this long
const GLITCH_MS = 340;
const ZOOM_MS = 900;
const MAX_WAIT_MS = 4000;   // never keep someone waiting longer than this for loading

/**
 * The first thing a visitor sees, and also the loading screen.
 * - Shows "Welcome" in several languages, then WELCOME glitches and zooms at you.
 * - The loading bar follows real loading (fonts + the city's first frame);
 *   WELCOME holds until loading is done.
 * - Plays once per browser tab (sessionStorage). Add ?intro to the URL to force it.
 * - Click or press any key to skip. Reduced-motion users get a simple fade.
 *
 * `onReveal` fires when the landing page should start zooming into view.
 * `onDone` fires when the intro is completely gone.
 */
export function Intro({ ready, onReveal, onDone }: { ready: boolean; onReveal: () => void; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('words');
  const [timelineDone, setTimelineDone] = useState(false);
  const glitchRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finished = useRef(false);

  // 1. Flash the words one after another.
  useEffect(() => {
    const timers: number[] = [];
    const last = welcomes.length - 1;
    for (let k = 1; k <= last; k++) {
      timers.push(window.setTimeout(() => {
        setIndex(k);
        if (k === last) setPhase('welcome');
      }, START_MS + k * WORD_MS));
    }
    timers.push(window.setTimeout(() => setTimelineDone(true), START_MS + last * WORD_MS + HOLD_MS));
    return () => timers.forEach(clearTimeout);
  }, []);

  // 2. When the words are done AND the page has loaded (or we've waited long enough), leave.
  useEffect(() => {
    if (!timelineDone || phase !== 'welcome') return;
    const go = () => (reduced.current ? finish(true) : setPhase('glitch'));
    if (ready) { go(); return; }
    const t = window.setTimeout(go, MAX_WAIT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineDone, ready, phase]);

  // 3. Glitch: jitter CSS variables directly on the element (no React re-render per frame).
  useEffect(() => {
    if (phase !== 'glitch') return;
    const el = glitchRef.current;
    const r = (a: number, b: number) => a + Math.random() * (b - a);
    const jitter = window.setInterval(() => {
      if (!el) return;
      const a = r(0, 70), b = r(0, 70);
      el.style.setProperty('--gx', `${r(-6, 6)}px`);
      el.style.setProperty('--gs', `${r(-4, 4)}deg`);
      el.style.setProperty('--cx', `${r(-18, -6)}px`);
      el.style.setProperty('--px', `${r(6, 18)}px`);
      el.style.setProperty('--c1', `${a}%`);
      el.style.setProperty('--c2', `${Math.max(0, 100 - a - r(12, 40))}%`);
      el.style.setProperty('--p1', `${b}%`);
      el.style.setProperty('--p2', `${Math.max(0, 100 - b - r(12, 40))}%`);
    }, 45);
    const next = window.setTimeout(() => {
      clearInterval(jitter);
      finish(false);
    }, GLITCH_MS);
    return () => { clearInterval(jitter); clearTimeout(next); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // 4. Zoom out (or fade for reduced motion), then unmount.
  function finish(fadeOnly: boolean) {
    if (finished.current) return;
    finished.current = true;
    setPhase('zoom');
    onReveal();
    window.setTimeout(() => { setPhase('done'); onDone(); }, fadeOnly ? 600 : ZOOM_MS);
  }

  // Skip on any click or key press.
  useEffect(() => {
    const skip = () => finish(true);
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  const [word, language] = welcomes[index];
  const isEnglish = index === welcomes.length - 1;
  const wordsProgress = (index + 1) / welcomes.length;
  // The bar can't reach 100% until the page has really loaded.
  const progress = Math.round((ready ? wordsProgress : Math.min(wordsProgress, 0.9)) * 100);

  return (
    <div
      className={`intro intro--${phase}${reduced.current ? ' intro--reduced' : ''}`}
      onClick={() => finish(true)}
      role="button"
      aria-label="Skip intro"
      tabIndex={-1}
    >
      <div className="intro__stack">
        <div ref={glitchRef} className={`intro__glitch${phase === 'glitch' ? ' is-glitching' : ''}`}>
          <span className={`intro__word${isEnglish ? ' intro__word--en' : ''}`} lang={isEnglish ? 'en' : undefined}>{word}</span>
          <span className={`intro__word intro__word--cyan${isEnglish ? ' intro__word--en' : ''}`} aria-hidden="true">{word}</span>
          <span className={`intro__word intro__word--pink${isEnglish ? ' intro__word--en' : ''}`} aria-hidden="true">{word}</span>
        </div>
        <span className="intro__lang">{language}</span>
      </div>

      <div className="intro__bar" aria-hidden="true">
        <span>JIRORAIDEN</span>
        <span className="intro__track"><span className="intro__fill" style={{ width: `${progress}%` }} /></span>
        <span className="intro__pct">LOADING {progress}%</span>
      </div>
      <span className="intro__skip">CLICK TO SKIP</span>
    </div>
  );
}

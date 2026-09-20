import { useEffect, useState } from 'react';
import { CityBackdrop } from './components/CityBackdrop';
import { Header } from './components/Header';
import { ChapterNav } from './components/ChapterNav';
import { Intro } from './components/Intro';
import { shouldPlayIntro, markIntroSeen } from './components/introStorage';
import { Origin } from './chapters/Origin';
import { Works } from './chapters/Works';
import { Arsenal } from './chapters/Arsenal';
import { Trials } from './chapters/Trials';
import { Contact } from './chapters/Contact';
import { CursorTrail } from './components/CursorTrail';

// "stage" = the city + the page. It starts zoomed-in and invisible while the
// intro plays, then zooms out into place when the intro says so.
type Stage = 'hidden' | 'revealing' | 'shown';

export default function App() {
  const [playIntro] = useState(shouldPlayIntro);
  const [stage, setStage] = useState<Stage>(playIntro ? 'hidden' : 'shown');
  const [sceneReady, setSceneReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Lock scrolling while the intro plays, and start at the top.
  useEffect(() => {
    if (stage === 'shown') return;
    window.scrollTo(0, 0);
    document.documentElement.classList.add('is-locked');
    return () => document.documentElement.classList.remove('is-locked');
  }, [stage]);

  return (
    <>
      {playIntro && (
        <Intro
          ready={sceneReady && fontsReady}
          onReveal={() => { setStage('revealing'); markIntroSeen(); }}
          onDone={() => setStage('shown')}
        />
      )}
      <div className={`stage stage--${stage}`}>
        <CityBackdrop onReady={() => setSceneReady(true)} />
        <Header />
        <ChapterNav />
        <main>
          <Origin />
          <Works />
          <Arsenal />
          <Trials />
          <Contact />
        </main>
      </div>
      <CursorTrail />
    </>
  );
}

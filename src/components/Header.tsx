import { useEffect, useState } from 'react';
import { profile, isPlaceholder } from '../content';
import { scrollToChapter } from './scroll';

export function Header() {
  const resumeReady = !isPlaceholder(profile.links.resume);
  // Once the page has scrolled, the header gets a dark glass backing so text
  // scrolling underneath it can't collide with the links.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <a className="brand" href="#origin" onClick={(e) => { e.preventDefault(); scrollToChapter('origin'); }}>
        <span className="brand__mark">JR</span>
        <span className="brand__name">{profile.handle}</span>
      </a>
      <nav className="site-nav" aria-label="Main">
        {resumeReady && <a href={profile.links.resume} target="_blank" rel="noopener">RÉSUMÉ</a>}
        <a href={profile.links.github} target="_blank" rel="noopener">GITHUB</a>
        <a className="btn-outline" href="#works" onClick={(e) => { e.preventDefault(); scrollToChapter('works'); }}>
          ENTER THE CITY
        </a>
      </nav>
    </header>
  );
}

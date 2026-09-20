// Should the intro play? Once per tab, unless the URL has ?intro.
export function shouldPlayIntro() {
  if (new URLSearchParams(window.location.search).has('intro')) return true;
  try { return sessionStorage.getItem('intro-seen') !== '1'; } catch { return true; }
}

export function markIntroSeen() {
  try { sessionStorage.setItem('intro-seen', '1'); } catch { /* private mode: ignore */ }
}

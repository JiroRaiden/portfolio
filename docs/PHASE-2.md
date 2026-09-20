# Phase 2 — Intro, header, chapter menu and Chapter 01 (Origin)

## What you'll see

1. **Intro** (first visit only): "Welcome" in Bengali, Hindi, Japanese, Korean, Chinese, French, German, Spanish, then **WELCOME**. It glitches in pink and cyan, rushes towards you, and the city zooms out into place behind it. Click or press any key to skip. Add `?intro` to the URL to see it again (e.g. `http://localhost:5173/?intro`).
2. **Header**: JR logo, GitHub, and ENTER THE CITY (jumps to Works). A RÉSUMÉ link appears automatically once you add its link in `content.ts`.
3. **Chapter menu** on the left: highlights the chapter you're in; click to jump. Hidden on narrow screens.
4. **Origin**: your name, tagline, blurb, BEGIN THE JOURNEY, and the Featured Works panel.

## New files

```
src/content.ts             ALL the words, links and project data. Edit this, not the components.
src/components/Intro.tsx   the Welcome intro / loading screen
src/components/introStorage.ts  "has this tab seen the intro?" (sessionStorage)
src/components/Header.tsx  top bar
src/components/ChapterNav.tsx  the left chapter menu
src/components/scroll.ts   smooth scroll to a chapter
src/chapters/Origin.tsx    Chapter 01
```

## The ideas worth understanding

**1. Content separate from layout.**
`content.ts` holds every piece of text. Components only decide how it looks. Updating your LeetCode numbers or adding a project never means touching layout code. Placeholders look like `[YOUR EMAIL]`; `isPlaceholder()` lets components hide links that aren't filled in yet (that's why RÉSUMÉ isn't showing).

**2. The intro is a real loader, not a fake timer.**
The loading bar is capped at 90% until two things are true: the fonts have loaded (`document.fonts.ready`) and the city has drawn its first frame (`CityBackdrop` calls `onReady`). WELCOME holds until then, up to 4 seconds. On a fast connection it feels exactly like the design; on a slow one it covers the loading instead of showing a half-built page.

**3. A small state machine.**
The intro moves through `words → welcome → glitch → zoom → done`. Each phase is a string in state; timers and effects move it forward. Writing it as named phases makes the timing easy to follow and change (the durations are constants at the top of `Intro.tsx`).

**4. The glitch skips React.**
During the glitch, a timer sets CSS variables (`--cx`, `--c1`, ...) directly on one element about 20 times a second. The CSS uses those variables for `clip-path` (which horizontal slice of the word shows) and `transform` (how far it shifts). No React re-render per frame, the same idea as phase 1.

**5. Zooming the whole page out.**
Everything behind the intro sits in one `.stage` wrapper that starts at `scale(1.14)` and invisible, then transitions to `scale(1)`. Once finished it switches to `transform: none`, because any transform on a parent breaks `position: fixed` on its children (the canvas, header and menu would start scrolling with the page).

**6. Once per visit.**
`sessionStorage` remembers the intro was seen for this browser tab. It's wrapped in `try/catch` because some private-browsing modes throw when you touch storage.

**7. Knowing which chapter you're in.**
On scroll (throttled to once per frame with `requestAnimationFrame`), the menu measures the five sections and highlights the one that covers the middle of the screen. The first version used an `IntersectionObserver` watching a thin line across the middle, but that only reports when a section *starts or stops* crossing the line, and it missed the pinned Works section (taller than the screen), so the menu jumped from ORIGIN straight to ARSENAL. Measuring five rectangles per frame is cheap and always right.

**8. Readability over a moving background.**
The day sky is bright, so the Origin section has a soft dark gradient behind the text (`.chapter--origin::before`) and the text has a subtle shadow. The gradient letters of MANDI skip the shadow, because `background-clip: text` makes the letters see-through and a shadow would show through them.

**9. Accessibility.**
- Reduced motion: the intro fades instead of glitching/zooming, and scrolling is instant.
- The chapter menu marks the active item with `aria-current`.
- Language names in the intro are real text; the coloured glitch copies are `aria-hidden` so screen readers don't read WELCOME three times.
- Visible focus outlines (`:focus-visible`) for keyboard users.

## Things to fill in later (in `content.ts`)

`links.resume`, `links.linkedin`, `links.email`, and the SeatLock / TriageDesk repo links.

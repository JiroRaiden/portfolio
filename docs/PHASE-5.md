# Phase 5 — Chapter 04 (Trials)

## What you'll see

- **Combat record** (left): your LeetCode numbers.
  - A ring split into Easy (cyan), Medium (cream) and Hard (pink), with the total solved in the middle.
  - A bar for each difficulty.
  - Your contest rating in the gradient style of your name, with TOP 19% and the number of contests beside it.
  - The first time the panel scrolls into view, every number counts up from 0 and the ring and bars fill in with them.
- **Trial log** (right): a timeline, newest first.
  - **NEXT**: locked (dashed, hatched, padlock).
  - **NOW**: glows pink with a pulsing marker.
  - **2026**: your four builds. Each one is a button that opens that project in Works.
  - **2025**: the CDAC course.
  - Entries slide in one after another.
- **Fix:** on phones the page used to be slightly wider than the screen until Arsenal's icons had flown in, because they start off to the side. That pushed the header's ENTER THE CITY button off the edge. Fixed with `overflow-x: clip`.

## Files

```
src/chapters/Trials.tsx            the chapter
src/components/useInViewOnce.ts    two small hooks: "has this scrolled into view yet" and the count-up timer
src/content.ts                     leetcode + trials (all the numbers and words)
```

## The ideas worth understanding

**1. Count-up = one number from 0 to 1.**
`useCountUp` runs a `requestAnimationFrame` loop for 1.6 s and produces `t`, going from 0 to 1. Every animated thing reads that one value: each number shows `round(value × t)`, each bar is `scaleX(share × t)`, and each ring arc is `length × t`. One timer keeps them all in sync.

**2. Easing.**
`t = 1 − (1 − x)³` (ease-out cubic): it moves fast at the start and slows into the final value, which reads as "settling" instead of stopping dead.

**3. No jitter while counting.**
`font-variant-numeric: tabular-nums` gives every digit the same width, so `99 → 100` doesn't make the layout shuffle.

**4. The ring is three dashed circles.**
An SVG circle's outline can be drawn as a dash: `stroke-dasharray: <length> <circumference>` draws one arc of that length. `stroke-dashoffset` moves where it starts. Each arc starts where the previous one ended, and the whole SVG is rotated −90° so the ring starts at 12 o'clock.

**5. Screen readers.**
A number that changes 60 times a second is noise to a screen reader. The animated numbers are `aria-hidden`, and a visually hidden sentence (`.sr-only`) reads out the final stats once.

**6. One-time triggers, shared.**
`useInViewOnce` is the IntersectionObserver pattern from Arsenal pulled into a hook. It becomes true once and then stops watching.

**7. `overflow: clip` vs `overflow: hidden`.**
Both cut off what sticks out. `hidden` also turns the element into a scroll box, which would break `position: sticky` inside it. `clip` just clips.

**8. Reduced motion.**
Numbers appear at their final values, entries don't slide, and the NOW marker doesn't pulse.

## To update

Edit `leetcode` in `content.ts` and change `asOf`. The site doesn't fetch live: the free LeetCode APIs are unofficial and often slow or down, and the panel should never be empty.

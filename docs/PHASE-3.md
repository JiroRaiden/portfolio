# Phase 3 — Chapter 02 (Works)

## What you'll see

- When Works reaches the top of the screen it **pins in place**. Scrolling down now moves the project cards **sideways** instead of moving the page, until you've seen the last card. Then the page unpins and scrolling carries on normally. Scrolling up plays it in reverse. Works the same with a mouse wheel, trackpad, or swiping on a phone.
- A counter (`03 / 04`) and a bar show how far through the list you are.
- **Hover a card**: it grows, lifts, turns full colour and glows in its project's colour; the others stay black-and-white.
- **Click a card**: a dialog opens with the problem, what you built, the hard part, the stack and a link.
- **More than 7 projects?** Only the first 7 go in the row. A **+N VIEW MORE PROJECTS** card appears at the end; it opens a popup that blurs the page and shows every project in a grid. Click any of them to open its details on top.
- **Keyboard**: Tab to a card and the page scrolls so it's in the middle; Enter opens it; Escape closes the top popup.

## Files

```
src/chapters/Works.tsx           the chapter: pinning, sideways movement, cards
src/components/ProjectArt.tsx    the SVG illustration on each card
src/components/ProjectDialog.tsx one project's details
src/components/AllProjects.tsx   "view more projects": every project over a blurred page
src/components/useModal.ts       shared popup behaviour (focus, Escape, Tab, scroll lock)
```

To change the cap, edit `MAX_CARDS` at the top of `Works.tsx`.

## The ideas worth understanding

**1. Pinning with `position: sticky`.**
The section is made taller than the screen by exactly the distance the row needs to travel (`row width − screen width`). Inside it, `.works-pin` has `position: sticky; top: 0`, so the browser keeps it on screen while you scroll through that extra height. No scroll hijacking: the page scrolls normally the whole time; we just *read* how far into the section you are.

**2. Vertical scroll → horizontal movement.**
`progress = −(section top) / distance`, clamped between 0 and 1. The row's target position is `−progress × distance`, so 1px of scrolling down = 1px of movement left. A `ResizeObserver` re-measures when the screen or the cards change size, and updates the section's height.

**3. Smoothing.**
Mouse wheels scroll in jumps. Each frame the row moves a fraction of the way to its target (`1 − exp(−dt × 10)`), turning jumps into a glide. Using `dt` keeps it the same speed on 60 Hz and 144 Hz screens. The movement is written straight to `transform`, so React doesn't re-render while you scroll.

**4. Fading the edges with a mask.**
The row spans the whole screen width, but a CSS `mask-image` gradient makes it transparent near the left (before the chapter menu) and at the right edge. Cards dissolve instead of being cut off by a hard line.

**5. Growing on hover without clipping.**
The hovered card gets `scale(1.1)` and `z-index: 2` so it sits above its neighbours. The row has padding above and below so a grown card has room.

**6. Stacked popups: `useModal`.**
Both popups share one hook that moves focus in, keeps Tab inside, locks the page, and puts focus back on close. It keeps a small stack of open popups, so when details are open on top of "all projects", Escape only closes the top one. Popups use a React **portal** into `<body>` so they cover the header and chapter menu.

**7. Blurred background.**
`backdrop-filter: blur(12px)` blurs whatever is behind the element (the whole page, here) without touching the page itself.

**8. Touch screens.**
`@media (hover: none)`: cards stay in colour (there's no hover) and the hints say SWIPE UP / TAP.

**9. Reduced motion.**
No pinning: the cards become a normal row you scroll sideways, snapping card by card.

## To fill in (in `content.ts`)
SeatLock and TriageDesk repo links. Until then their dialogs say "LINK COMING SOON" instead of showing a broken button.

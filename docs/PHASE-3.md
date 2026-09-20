# Phase 3 — Chapter 02 (Works)

## What you'll see

- A row of project cards that **drifts slowly to the left on its own** and never runs out: after the last card, the first comes round again.
- The page is **not locked**: scrolling up and down goes straight past Works like any other chapter.
- **Move the row by hand:**
  - drag it with the mouse, or swipe it on a phone (let go mid-drag and it keeps sliding, then slows down)
  - trackpad sideways swipe, or **Shift + mouse wheel**
- **Hover a card:** the drift eases to a stop, and the card grows, lifts, turns full colour and glows. The others stay black-and-white. After you drag or scroll, the drift waits a moment before easing back in.
- **Click a card:** a popup with the problem, what you built, the hard part, the stack and a link. A drag never counts as a click.
- **More than 7 projects?** Only the first 7 go in the row. A **+N VIEW MORE PROJECTS** card opens a popup that blurs the page and shows every project.
- **Keyboard:** Tab to a card and the row slides it into view. Enter opens it; Escape closes the top popup.
- The counter (`03 / 06`) shows which card is at the left edge, and the bar shows how far round the loop you are.

## Files

```
src/chapters/Works.tsx           the chapter: drift, dragging, looping, cards
src/components/ProjectArt.tsx    the SVG illustration on each card
src/components/ProjectDialog.tsx one project's details
src/components/AllProjects.tsx   "view more projects": every project over a blurred page
src/components/useModal.ts       shared popup behaviour (focus, Escape, Tab, scroll lock)
```

Settings at the top of `Works.tsx`: `MAX_CARDS`, `DRIFT` (idle speed), `RESUME_AFTER` (pause after you touch it), `DRAG_START`.

## The ideas worth understanding

**1. An endless row from two copies.**
The cards are drawn twice, side by side. The row moves left; once it has moved exactly one copy's width, the second copy sits exactly where the first one started. So we jump back by that width (`x % setWidth`) and nobody can see the jump. The second copy is `inert` and `aria-hidden`, so the keyboard and screen readers only meet each card once.

**2. One number drives everything.**
`x` is how far the row is shifted. Every frame, the drift, the fling after a drag and any sideways wheel all add to `x`, and the row gets `transform: translate3d(x, 0, 0)`. All of it lives in a ref, so React doesn't re-render 60 times a second.

**3. Easing instead of switching.**
The drift speed never jumps between 0 and full. Each frame it moves a fraction of the way to its target (`1 − exp(−dt × k)`). Hovering sets the target to 0, so the row glides to a stop instead of freezing. Wheel steps are eased the same way, so a clicky mouse wheel still glides.

**4. Only sideways input is taken.**
The wheel handler only calls `preventDefault()` when the gesture is mostly sideways (or Shift is held). A normal vertical wheel falls through to the page. On phones, `touch-action: pan-y` tells the browser that vertical swipes are for scrolling the page and sideways ones are ours.

**5. Drag vs click.**
A press only becomes a drag once the pointer moves 6px. If it did become a drag, the click that follows on release is swallowed in the capture phase, before the card sees it.

**6. The fling.**
While dragging we track how fast the pointer is moving. On release that speed carries on and fades (`velocity × exp(−dt × 4)`), like friction. If you stopped before letting go, there's no fling.

**7. It sleeps when off screen.**
An IntersectionObserver starts the animation loop when Works is visible and stops it when it isn't.

**8. Reduced motion.**
No drift. You can still drag, swipe and scroll the row by hand.

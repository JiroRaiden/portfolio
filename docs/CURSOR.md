# Cursor + trail

## What you'll see

- The mouse pointer is a **15px pixel diamond**: cream normally, **pink** over anything clickable. It has a dark outline so it shows on both the bright day sky and the night city, and a dark centre pixel marking exactly where you click.
- Moving the mouse leaves a short **trail of cyan and pink pixels** that shrink (6 → 4 → 2px) and fade out in under half a second.
- Touch screens keep their normal behaviour (there's no pointer to draw). With reduced motion turned on you still get the diamond, but no trail.

## Files

```
src/index.css                        "Cursor" section (both pointer images live here)
src/components/CursorTrail.tsx       the trail
```

## The ideas worth understanding

**1. A custom cursor is one CSS line.**
`cursor: url(data:image/png;base64,...) 7 7, auto`. The `7 7` is the hotspot, the pixel that actually clicks (the diamond's centre). `auto` is the fallback if the image can't load. The browser draws it natively, so it never lags behind the mouse. A JavaScript-drawn cursor always trails a frame behind.

Why PNG written into the CSS (a *data URI*) instead of an SVG file? Browsers on Windows are strict about SVG cursors and quietly fall back to the normal arrow if they don't like the file. PNG is the format every browser accepts for cursors. Putting the bytes straight into the stylesheet means there's no separate file to load, go missing, or get altered.

**2. One variable for every clickable thing.**
Every `cursor: pointer` in the stylesheet became `cursor: var(--cursor-hover)`. Inside `@media (pointer: fine)` (a real mouse) that variable is the pink diamond; everywhere else it's the ordinary `pointer`. One switch covers the whole site.

**3. The trail is a canvas, not DOM elements.**
Twenty-odd little squares drawn on one full-screen `<canvas>` is much cheaper than moving twenty `<div>`s. `pointer-events: none` lets every click pass straight through it to the page.

**4. It only runs while it's needed.**
A new pixel is dropped only after the mouse has moved 9px. The animation loop starts when a pixel appears and stops when the last one fades, so a still mouse costs nothing.

**5. Keeping it pixel-crisp.**
Sizes are even numbers and positions snap to a 2px grid, so the squares stay sharp. The canvas is sized by `devicePixelRatio`, so it's sharp on high-DPI screens too.

## To tweak

At the top of `CursorTrail.tsx`: `LIFE` (how long a pixel lives), `SPACING` (gap between pixels), `MAX` (trail length), `COLOURS`.

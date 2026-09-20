# Phase 1 — The living city

What this phase builds: the moving background for the whole site. A striped sun that sets as you scroll, a two-layer halftone skyline with parallax, a road with a van that drives as you scroll, windows that light up at dusk, twinkling stars and shooting stars. The five chapters are empty placeholders for now.

## Run it

```bash
npm install      # once, downloads the libraries listed in package.json
npm run dev      # starts the dev server; open the URL it prints (usually http://localhost:5173)
npm run build    # makes the production version in dist/
```

## How the pieces fit

```
index.html                 the page shell + Google Fonts
src/main.tsx               starts React
src/App.tsx                the page: <CityBackdrop /> + five chapter sections
src/index.css              colours as CSS variables, layout, fonts
src/components/
  CityBackdrop.tsx         React bridge: mounts the scene, reads scroll, runs the animation loop
src/scene/
  palette.ts               every colour + the 1440 x 900 design frame
  geometry.ts              seeded random, skyline generator, window picker, rectangle merging
  shaders.ts               GPU programs: sky gradient, halftone dots, sun, road, headlight beam, streak
  CityScene.ts             builds the scene once, then update(progress, time) every frame
  Van.ts                   the van: curved shapes, rolling wheels, lights that switch on at night
```

## The ideas worth understanding (these come up in interviews)

**1. Two layers: a fixed canvas behind a normal page.**
The `<canvas>` is `position: fixed` and fills the screen. The chapters scroll over it like a normal website. Only the canvas is WebGL; text stays as real HTML, so it is selectable, accessible and indexed by search engines.

**2. Scroll → one number → everything.**
`progress = scrollY / (pageHeight - windowHeight)` gives 0 at the top and 1 at the bottom. Every effect is a function of that one number: sun height, sun colour, glow, star opacity, window lights, layer offsets. That makes the scene predictable and easy to tune.

**3. No React state per frame.**
Updating React state on every scroll would re-render components constantly and stutter. Instead `CityBackdrop` starts a `requestAnimationFrame` loop that *reads* the scroll position and calls `scene.update()` directly. React renders once; the GPU does the rest.

**4. Smoothing with exponential easing.**
`shown += (target - shown) * (1 - Math.exp(-dt * 6))` moves the displayed value a fraction of the way to the real scroll value each frame. Using `dt` (time since last frame) keeps the feel the same on 60 Hz and 144 Hz screens.

**5. Orthographic camera in design units.**
The camera is flat (no perspective) and the world is always 900 units tall, so positions from the 1440 x 900 design can be copied straight in. The width follows the screen's shape, and the sun sits at 72% of the width, so it works on wide and narrow screens.

**6. Shaders for the look.**
The dots, stripes and sun are not images; they are computed per pixel on the GPU. `gl_FragCoord` (the pixel's position on screen) makes the patterns stay a fixed size instead of stretching.

**7. Fewer draw calls = faster.**
All buildings in a layer are merged into one geometry (`rectsToGeometry`). Windows use an `InstancedMesh`: one small rectangle drawn hundreds of times with different positions and colours in a single GPU call.

**8. Parallax.**
The back layer moves 450 units over the full scroll and the front layer 1000. Things that move less feel further away.

**9. Seeded randomness.**
`seededRandom(7)` always produces the same sequence, so the skyline is random-looking but identical on every visit.

**10. Day → night with colour keyframes.**
`palette.ts` has a `sky` table: lists of `[progress, colour]` pairs for the sky top, the horizon, the sun and the buildings. `sampleKeys()` finds the two keyframes around the current progress and blends between them with a smoothstep, so there are no sudden jumps. Day (0) is blue sky with a pale horizon; golden hour (0.3) warms the horizon; sunset (0.55) goes pink and purple; night (0.85+) is charcoal. To change the mood, edit the table, not the code.

**11. The road and the van (switched off for now).**
Both are hidden with `SHOW_ROAD = false` in `palette.ts`; set it to `true` to bring them back. When off, the buildings sit on the bottom edge of the screen.
The road is one shader: asphalt, a paved kerb along the top and a dashed centre line, with colours from the same time-of-day table.
The van lives in `Van.ts`. It is built from `THREE.Shape` outlines (a rounded body with a sloped windscreen, windows, stripe, bumper, wheel arches), not plain rectangles; `ShapeGeometry` turns each outline into triangles the GPU can fill.
It is driven by scroll: `x = width * (0.04 + 0.82 * progress)`, so it sits on the left at the top of the page and reaches the right at the bottom, and reverses when you scroll up.
The wheels roll without slipping: a wheel that travels distance `d` turns `d / radius` radians, so `rotation = -x / radius` (negative because clockwise moves right). The body bobs a fraction of a unit on a sine wave so it feels like it has an engine.
At night the headlight beam (a soft cone shader), a brighter tail light and warm cab windows fade in with the building lights.

## Bugs we hit (and why)

- **Black sky on one computer only.** The new `CityScene.ts` sent `uTop`/`uBottom` to a sky shader, but an older `shaders.ts` that expected different names was still on disk. A shader uniform that is never set reads as zero, which is black. Lesson: when files depend on each other, update them together and check they match.

- **No daylight.** The first version used the night charcoal for the whole sky and only added a glow at sunset, so the top of the page already looked like night. The fix was the keyframe table above.

- **Colours came out too dark.** Three.js converts colours for realistic 3D lighting ("linear" colour space). For a flat 2D illustration we want the exact hex values, so `ColorManagement` is turned off and the renderer outputs linear values unchanged.
- **The sun drew on top of the city.** Three.js draws solid objects first and see-through objects last, whatever `renderOrder` says. Marking every material as transparent puts them all in one pass, so `renderOrder` controls the layering.

## Accessibility and performance

- `prefers-reduced-motion`: shooting stars are turned off and scroll smoothing is disabled.
- Pixel ratio is capped at 2, so 4K phones don't render four times more pixels than they need.
- The canvas is `aria-hidden`: it is decoration, screen readers skip it.

## Next phase

Phase 2: the intro (Welcome in 9 languages) that doubles as the loader, then Chapter 01 (Origin) on top of the city.

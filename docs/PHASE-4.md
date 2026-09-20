# Phase 4 — Chapter 03 (Arsenal)

## What you'll see

- Your skills laid out as an **inventory grid**: 20 slots, each showing the tool's real logo.
- The first time the chapter scrolls into view, the slots **fly in from four directions**: the top row drops in from above, the bottom row rises from below, the side columns slide in from the left and right. They ripple outward from the centre, so the grid assembles instead of popping in all at once.
- **Category tabs** (LANGUAGES, BACKEND, DATA, ML, FRONTEND, CLOUD, TESTING) light up one group in its colour and dim the rest.
- **Hover, focus or tap a slot**: the card on the right shows what you used that skill for and how many projects use it.
- **PROVEN IN** buttons open the matching project in Works: the page scrolls there and the project's details pop up.
- A **badge** row at the bottom (CDAC Kolkata, 2025).
- Also in this phase: once you scroll, the header gets a dark backing (a soft fade on desktop, a frosted bar on phones), so text passing underneath no longer collides with the links.

## Files

```
src/chapters/Arsenal.tsx     the chapter: grid, fly-in, filter tabs, skill card, badges
src/assets/icons/*.svg       23 logos (see CREDITS.md for licences)
src/assets/icons.ts          loads every logo in that folder automatically
src/content.ts               skillCategories, skills, badges (all the words live here)
src/chapters/Works.tsx       now listens for 'open-project'
src/components/Header.tsx    the scrolled backing
```

## The ideas worth understanding

**1. Loading every logo at once: `import.meta.glob`.**
`icons.ts` asks Vite for every `.svg` in the icons folder and gets back a map from file path to final URL. To add a logo, drop `name.svg` in the folder and write `icon: 'name'` on the skill. No import line to add.

**2. The fly-in is just CSS with per-slot variables.**
Each slot gets its own `--fx` / `--fy` (where it starts) and `--delay` (when it starts) as inline CSS variables. The stylesheet has one rule: before the grid gets `is-entered`, slots sit at `translate(var(--fx), var(--fy))` with opacity 0; after it, they transition to `none` with a slow ease-out curve. The browser does the animation; React only flips one class.

**3. Playing it once, at the right moment: `IntersectionObserver`.**
The observer fires when a quarter of the grid is on screen, adds `is-entered`, then disconnects so it never replays.

**4. The ripple delay.**
A slot's delay is its "ring": how many steps it is from the middle of the grid (`|col − centre| + |row − centre|`), × 90 ms. The middle lands first, the corners last.

**5. Chapters talking to each other with an event.**
Arsenal doesn't know how Works opens a dialog. A PROVEN IN button just announces `open-project` with the project's index (`window.dispatchEvent(new CustomEvent(...))`). Works listens, scrolls itself into view and opens that project. Neither component has to import the other.

**6. Skills point to projects by number.**
`provenIn: ['01', '03']` refers to project numbers in `content.ts`, so the "USED IN N PROJECTS" count and the buttons always match your real project list.

**7. Accessible buttons.**
Slots and tabs are real `<button>`s with `aria-pressed`, so a keyboard or screen reader can use them. The skill card is `aria-live="polite"`, so screen readers announce the change.

**8. Phones and reduced motion.**
On phones the grid has 4 columns and the card sits below it. With reduced motion turned on, the slots appear without flying.

## To edit

- Add or change a skill: `skills` in `content.ts`.
- Add a certificate: `badges` in `content.ts`.
- Change a category colour: `skillCategories` in `content.ts`.

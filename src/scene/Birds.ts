import * as THREE from 'three';
import { rectsToGeometry, seededRandom } from './geometry';

// Pixel-art bird, drawn as text: X = a pixel. Three wing positions.
// The flap cycles up → level → down → level, like a real wingbeat.
const FRAMES = [
  [
    'X.......X',
    'XX.....XX',
    '.XX...XX.',
    '..XXXXX..',
    '....X....',
  ],
  [
    '.........',
    'XXX...XXX',
    '...XXX...',
    '....X....',
    '.........',
  ],
  [
    '....X....',
    '..XXXXX..',
    '.XX...XX.',
    'XX.....XX',
    'X.......X',
  ],
];
const CYCLE = [0, 1, 2, 1];

// Turn a frame into one geometry of little squares, centred on (0, 0), 1 unit per pixel.
function frameGeometry(rows: string[]) {
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  rows.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch === 'X') rects.push({ x: c - row.length / 2, y: rows.length / 2 - r - 1, w: 1, h: 1 });
    });
  });
  return rectsToGeometry(rects);
}

type Bird = {
  frames: THREE.Mesh[];
  dx: number; dy: number;   // place in the flock
  phase: number;            // where in its wingbeat it starts
  flapRate: number;         // wingbeats per second
};

type Flock = {
  group: THREE.Group;
  birds: Bird[];
  y: number;          // world height the flock flies at
  speed: number;      // world units per second
  offset: number;     // where along its loop it starts
  scale: number;      // world units per pixel (smaller = further away)
};

/**
 * A few small flocks crossing the daytime sky, left to right, on a loop.
 * They flap as they go, bob gently, and fade out as the sun sets.
 */
export class Birds {
  readonly group = new THREE.Group();
  private flocks: Flock[] = [];
  private material = new THREE.MeshBasicMaterial({
    color: '#2c3450', transparent: true, opacity: 1, depthTest: false, depthWrite: false,
  });

  constructor(renderOrder: number) {
    const geos = FRAMES.map(frameGeometry);
    const rand = seededRandom(33);
    // [design y from top, speed, flock size, pixel scale]
    // Kept high in the sky so they rarely cross the big headings.
    const setup: [number, number, number, number][] = [
      [105, 70, 5, 3],
      [190, 52, 3, 2.2],
      [70, 88, 4, 2.8],
      [250, 40, 3, 1.8],   // a far-off flock: smaller and slower
    ];
    setup.forEach(([designY, speed, size, scale], f) => {
      const group = new THREE.Group();
      group.scale.set(scale, scale, 1);
      const birds: Bird[] = [];
      for (let i = 0; i < size; i++) {
        // A loose V: each bird a bit behind and to one side of the one before.
        const side = i % 2 ? 1 : -1;
        const rank = Math.ceil(i / 2);
        const frames = geos.map((g) => {
          const m = new THREE.Mesh(g, this.material);
          m.renderOrder = renderOrder;
          m.visible = false;
          group.add(m);
          return m;
        });
        birds.push({
          frames,
          dx: -rank * (11 + rand() * 6),
          dy: side * rank * (5 + rand() * 4),
          phase: rand() * 4,
          flapRate: 2.2 + rand() * 1.2,
        });
      }
      this.group.add(group);
      this.flocks.push({ group, birds, y: 900 - designY, speed, offset: f * 700 + rand() * 300, scale });
    });
  }

  /**
   * @param day   1 = full daylight, 0 = gone
   * @param width current world width (the loop spans the whole screen plus margins)
   */
  update(seconds: number, day: number, width: number, colour: THREE.Color) {
    this.group.visible = day > 0.01;
    if (!this.group.visible) return;
    this.material.opacity = 0.85 * day;   // a touch see-through so they sit in the sky, not on it
    this.material.color.copy(colour);

    const margin = 260;
    const loop = width + margin * 2;
    for (const f of this.flocks) {
      // Fly left to right, then wrap around off-screen and come back in on the left.
      const x = ((seconds * f.speed + f.offset) % loop) - margin;
      f.group.position.set(x, f.y + Math.sin(seconds * 0.6 + f.offset) * 10, 0);
      for (const b of f.birds) {
        // Pick this bird's wing position for the current moment.
        const frame = CYCLE[Math.floor((seconds * b.flapRate * CYCLE.length + b.phase) % CYCLE.length)];
        b.frames.forEach((m, i) => {
          m.visible = i === frame;
          m.position.set(b.dx, b.dy + Math.sin(seconds * 2 + b.phase) * 1.2, 0);
        });
      }
    }
  }

  dispose() {
    this.material.dispose();
  }
}

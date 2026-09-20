import * as THREE from 'three';
import { GROUND_Y } from './palette';

// A tiny seeded random generator. Same seed = same city on every visit,
// so the skyline never "reshuffles" when someone reloads the page.
export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type Building = { x: number; width: number; height: number };

// Walk left to right placing buildings of random width and height.
// Heights are snapped to multiples of 5 so the roofline looks stepped and blocky.
export function generateSkyline(opts: {
  totalWidth: number;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  seed: number;
}): Building[] {
  const rand = seededRandom(opts.seed);
  const out: Building[] = [];
  let x = 0;
  while (x < opts.totalWidth) {
    const steps = Math.floor((opts.maxWidth - opts.minWidth) / 10) + 1;
    const width = opts.minWidth + Math.floor(rand() * steps) * 10;
    const height = Math.round((opts.minHeight + rand() * (opts.maxHeight - opts.minHeight)) / 5) * 5;
    out.push({ x, width, height });
    x += width;
  }
  return out;
}

// Merge many rectangles into ONE geometry. One geometry = one draw call,
// which is much faster for the GPU than drawing 60 separate buildings.
export function rectsToGeometry(rects: { x: number; y: number; w: number; h: number }[]) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  rects.forEach((r, i) => {
    const x0 = r.x, x1 = r.x + r.w, y0 = r.y, y1 = r.y + r.h;
    positions.push(x0, y0, 0, x1, y0, 0, x1, y1, 0, x0, y1, 0);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    const o = i * 4;
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  return g;
}

export function buildingsToRects(buildings: Building[]) {
  return buildings.map((b) => ({ x: b.x, y: GROUND_Y, w: b.width, h: b.height }));
}

// Pick lit windows inside each building on a regular grid.
// `chance` controls how many of the possible windows are lit.
export function windowSlots(buildings: Building[], seed: number, chance: number) {
  const rand = seededRandom(seed);
  const slots: { x: number; y: number }[] = [];
  for (const b of buildings) {
    if (b.width < 30 || b.height < 30) continue;
    for (let wx = b.x + 6; wx < b.x + b.width - 8; wx += 10) {
      for (let wy = GROUND_Y + 10; wy < GROUND_Y + b.height - 10; wy += 14) {
        if (rand() < chance) slots.push({ x: wx, y: wy });
      }
    }
  }
  return slots;
}

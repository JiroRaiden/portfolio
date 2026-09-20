import * as THREE from 'three';
import { palette, sky, WORLD_HEIGHT, DESIGN_WIDTH, GROUND_Y, SHOW_ROAD } from './palette';
import {
  basicVertex, skyFragment, halftoneFragment, sunFragment, roadFragment, streakFragment,
} from './shaders';
import {
  generateSkyline, buildingsToRects, rectsToGeometry, windowSlots, seededRandom,
} from './geometry';
import { Van } from './Van';
import { Birds } from './Birds';

// We want the exact hex colours from the design, not Three.js's 3D-lighting colour conversion.
THREE.ColorManagement.enabled = false;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const color = (hex: string) => new THREE.Color(hex);

// Blend through a list of [progress, colour] keyframes and write the result into `out`.
type Keys = readonly (readonly [number, string])[];
function sampleKeys(keys: Keys, p: number, out: THREE.Color) {
  if (p <= keys[0][0]) return out.set(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    const [t1, c1] = keys[i];
    if (p <= t1) {
      const [t0, c0] = keys[i - 1];
      const k = (p - t0) / (t1 - t0);
      return out.set(c0).lerp(tmp.set(c1), k * k * (3 - 2 * k)); // smooth, not linear
    }
  }
  return out.set(keys[keys.length - 1][1]);
}
const tmp = new THREE.Color();
const tmpBird = new THREE.Color();

// Design-space y (0 at the top, 900 at the bottom) -> world y (0 at the bottom).
const wy = (designY: number) => WORLD_HEIGHT - designY;

type Streak = { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; x: number; y: number; delay: number; duration: number };

/**
 * The whole background: sky, sun, birds, two skyline layers, windows, road, van, stars.
 * It knows nothing about React. The page tells it two things:
 *   - update(progress, seconds): how far the visitor has scrolled (0..1) and the current time
 *   - resize(width, height): when the window changes size
 */
export class CityScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private worldWidth = DESIGN_WIDTH;
  private pixelRatio = 1;
  private reducedMotion: boolean;

  // Things we change every frame.
  private sky!: THREE.Mesh;
  private skyMat!: THREE.ShaderMaterial;
  private sun!: THREE.Mesh;
  private sunMat!: THREE.ShaderMaterial;
  private backLayer = new THREE.Group();
  private frontLayer = new THREE.Group();
  private windowMats: THREE.MeshBasicMaterial[] = [];
  private stars!: THREE.Points;
  private starMat!: THREE.ShaderMaterial;
  private road!: THREE.Mesh;
  private roadMat!: THREE.ShaderMaterial;
  private van = new Van();
  private birds = new Birds(2.5); // drawn after the sun (in front of it), before the buildings
  private streaks: Streak[] = [];
  private pixelMats: THREE.ShaderMaterial[] = []; // materials that need the pixel ratio
  private backMat!: THREE.ShaderMaterial;  // building colours change with the time of day
  private frontMat!: THREE.ShaderMaterial;

  constructor(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }) {
    this.reducedMotion = opts.reducedMotion;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setClearColor(palette.charcoal);
    // Orthographic = flat 2D view. left, right, top, bottom are in world units.
    this.camera = new THREE.OrthographicCamera(0, DESIGN_WIDTH, WORLD_HEIGHT, 0, -100, 100);

    this.buildSky();
    this.buildStars();
    this.buildSun();
    this.buildSkylines();
    if (SHOW_ROAD) {
      this.buildRoad();
      this.scene.add(this.van.group);
    }
    this.buildShootingStars();
    this.scene.add(this.backLayer, this.frontLayer);
    if (!this.reducedMotion) this.scene.add(this.birds.group);
  }

  // ---------- building the scene (runs once) ----------

  // Helper: a ShaderMaterial that draws on top of whatever came before it.
  // With a 2D scene we don't need depth testing; renderOrder decides who is in front.
  // Every material is marked transparent so they all share ONE drawing pass;
  // otherwise Three.js draws solid things first and see-through things last,
  // and the sun would always end up in front of the city.
  private shader(fragment: string, uniforms: Record<string, THREE.IUniform>) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: basicVertex, fragmentShader: fragment, uniforms,
      transparent: true, depthTest: false, depthWrite: false,
    });
    if ('uPixelRatio' in uniforms) this.pixelMats.push(mat);
    return mat;
  }

  private buildSky() {
    this.skyMat = this.shader(skyFragment, {
      uTop: { value: color(sky.top[0][1]) },
      uBottom: { value: color(sky.bottom[0][1]) },
      uPixelRatio: { value: 1 },
    });
    this.sky = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.skyMat);
    this.sky.renderOrder = 0;
    this.scene.add(this.sky);
  }

  // Stars are one THREE.Points object: hundreds of squares drawn in a single call.
  private buildStars() {
    const rand = seededRandom(21);
    const count = 140;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const choices = [palette.text, palette.text, palette.text, palette.cyan, palette.pink, palette.cream].map(color);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = rand() * 3200;
      pos[i * 3 + 1] = wy(20 + rand() * 500);
      const c = choices[Math.floor(rand() * choices.length)];
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = [2, 3, 3, 4][Math.floor(rand() * 4)];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(size, 1));
    this.starMat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float size;
        attribute vec3 color;
        uniform float uPixelRatio;
        uniform float uTime;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          vColor = color;
          // Each star twinkles at its own speed, based on its position.
          vTwinkle = 0.75 + 0.25 * sin(uTime * (1.0 + mod(position.x, 3.0)) + position.y);
          gl_PointSize = size * uPixelRatio;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() { gl_FragColor = vec4(vColor, uOpacity * vTwinkle); }`,
      transparent: true, depthTest: false, depthWrite: false,
    });
    this.pixelMats.push(this.starMat);
    this.stars = new THREE.Points(g, this.starMat);
    this.stars.renderOrder = 1;
    this.scene.add(this.stars);
  }

  private buildSun() {
    this.sunMat = this.shader(sunFragment, {
      uColor: { value: color(palette.cream) },
      uSize: { value: 360 },
      uRadius: { value: 160 },
      uFill: { value: 0.85 },
    });
    this.sun = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.sunMat);
    this.sun.renderOrder = 2;
    this.scene.add(this.sun);
  }

  private halftone(base: string, dot: string, cell: number, radius: number) {
    return this.shader(halftoneFragment, {
      uBase: { value: color(base) }, uDot: { value: color(dot) },
      uCell: { value: cell }, uRadius: { value: radius }, uPixelRatio: { value: 1 },
    });
  }

  private addWindows(layer: THREE.Group, slots: { x: number; y: number }[], seed: number, order: number) {
    const rand = seededRandom(seed);
    const colours = [palette.pink, palette.cyan, palette.cream, palette.cream, palette.cream].map(color);
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    // InstancedMesh: one window shape, drawn hundreds of times with different positions and colours.
    const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(4, 6), mat, slots.length);
    const m = new THREE.Matrix4();
    slots.forEach((s, i) => {
      m.makeTranslation(s.x + 2, s.y + 3, 0);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, colours[Math.floor(rand() * colours.length)]);
    });
    mesh.renderOrder = order;
    layer.add(mesh);
    this.windowMats.push(mat);
  }

  private buildSkylines() {
    // Back layer: taller, lighter, moves slowly.
    const back = generateSkyline({ totalWidth: 3400, minHeight: 186, maxHeight: 316, minWidth: 30, maxWidth: 80, seed: 7 });
    this.backMat = this.halftone(palette.backBase, palette.backDot, 7, 1.8);
    const backMesh = new THREE.Mesh(rectsToGeometry(buildingsToRects(back)), this.backMat);
    backMesh.renderOrder = 3;
    this.backLayer.add(backMesh);
    this.addWindows(this.backLayer, windowSlots(back, 3, 0.16), 4, 4);

    // Front layer: shorter, darker, moves fast.
    const front = generateSkyline({ totalWidth: 4600, minHeight: 60, maxHeight: 140, minWidth: 40, maxWidth: 100, seed: 11 });
    this.frontMat = this.halftone(palette.frontBase, palette.frontDot, 6, 1.4);
    const frontMesh = new THREE.Mesh(rectsToGeometry(buildingsToRects(front)), this.frontMat);
    frontMesh.renderOrder = 8;
    this.frontLayer.add(frontMesh);
    this.addWindows(this.frontLayer, windowSlots(front, 5, 0.22), 6, 9);
  }

  // The road replaces the old checker strip. It fills the space under the buildings.
  private buildRoad() {
    this.roadMat = this.shader(roadFragment, {
      uAsphalt: { value: color(sky.asphalt[0][1]) },
      uKerb: { value: color(sky.kerb[0][1]) },
      uLine: { value: color(sky.roadLine[0][1]) },
      uPixelRatio: { value: 1 },
    });
    this.road = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.roadMat);
    this.road.renderOrder = 10;
    this.scene.add(this.road);
  }

  private buildShootingStars() {
    const setup: [number, number, number, number, string][] = [
      // [x as share of width, design y, delay s, duration s, colour]
      [0.88, 40, 0, 6.5, palette.text], [0.68, 90, 1.8, 8, palette.cyan], [0.96, 170, 3.4, 7, palette.text],
      [0.53, 30, 4.9, 9, palette.text], [0.82, 230, 6.1, 7.5, palette.pink], [0.99, 60, 7.6, 8.5, palette.text],
    ];
    const geo = new THREE.PlaneGeometry(170, 2);
    geo.translate(85, 0, 0); // pivot at the tail so rotation swings around it
    for (const [x, y, delay, duration, c] of setup) {
      const mat = this.shader(streakFragment, { uColor: { value: color(c) }, uOpacity: { value: 0 } });
      const mesh = new THREE.Mesh(geo, mat);
      // Point the streak down and to the left (the direction it travels).
      mesh.rotation.z = Math.atan2(-490, -700);
      mesh.renderOrder = 1;
      this.scene.add(mesh);
      this.streaks.push({ mesh, mat, x, y: wy(y), delay, duration });
    }
  }

  // ---------- every frame ----------

  update(progress: number, seconds: number) {
    const p = clamp01(progress);
    const W = this.worldWidth;
    const travel = W / DESIGN_WIDTH; // keep parallax proportional on narrow screens

    // Sun: sinks from high in the sky to below the skyline, grows, and warms from cream to pink.
    // On narrow (phone) screens the sun shrinks so it doesn't cover the text.
    const sunScale = Math.min(1, Math.max(0.5, W / 1300));
    const radius = (160 + 50 * p) * sunScale;
    const size = (radius + 8) * 2;
    // On phones the sun also starts lower, below the name instead of behind it.
    const sunStart = sunScale < 1 ? 470 : 300;
    this.sun.position.set(W * (sunScale < 1 ? 0.78 : 0.72), wy(sunStart + (940 - sunStart) * p), 0);
    this.sun.scale.set(size, size, 1);
    sampleKeys(sky.sun, p, this.sunMat.uniforms.uColor.value);
    this.sunMat.uniforms.uFill.value = 0.85 - 0.43 * clamp01(p / 0.6); // solid by day, see-through at dusk
    this.sunMat.uniforms.uSize.value = size;
    this.sunMat.uniforms.uRadius.value = radius;

    // Sky and buildings: day -> golden hour -> sunset -> night.
    sampleKeys(sky.top, p, this.skyMat.uniforms.uTop.value);
    sampleKeys(sky.bottom, p, this.skyMat.uniforms.uBottom.value);
    sampleKeys(sky.backBase, p, this.backMat.uniforms.uBase.value);
    sampleKeys(sky.backDot, p, this.backMat.uniforms.uDot.value);
    sampleKeys(sky.frontBase, p, this.frontMat.uniforms.uBase.value);
    sampleKeys(sky.frontDot, p, this.frontMat.uniforms.uDot.value);
    if (SHOW_ROAD) {
      sampleKeys(sky.asphalt, p, this.roadMat.uniforms.uAsphalt.value);
      sampleKeys(sky.kerb, p, this.roadMat.uniforms.uKerb.value);
      sampleKeys(sky.roadLine, p, this.roadMat.uniforms.uLine.value);
    }

    // Night: stars and windows fade in after dusk.
    const night = clamp01((p - 0.45) / 0.45);
    const lights = clamp01((p - 0.35) / 0.45);
    this.starMat.uniforms.uOpacity.value = night;
    this.starMat.uniforms.uTime.value = seconds;
    this.windowMats.forEach((m) => (m.opacity = lights));

    // Birds: full flocks at the top of the page, thinning out through golden hour, gone by dusk.
    const day = 1 - clamp01((p - 0.2) / 0.28);
    if (!this.reducedMotion) {
      this.birds.update(seconds, day * day, W, sampleKeys(sky.birds, p, tmpBird));
    }

    // The van drives with your scroll: far left at the top of the page, far right at the bottom.
    // Scroll back up and it reverses (its wheels roll backwards too).
    if (SHOW_ROAD) this.van.update(W * (0.04 + 0.82 * p), lights, seconds);

    // Parallax: the front layer travels about twice as far as the back one.
    this.backLayer.position.x = -450 * p * travel;
    this.frontLayer.position.x = -1000 * p * travel;

    // Shooting stars: each one loops on its own timer, travelling for the first 28% of its cycle.
    for (const s of this.streaks) {
      const t = ((seconds - s.delay) % s.duration + s.duration) % s.duration / s.duration;
      const k = t / 0.28;
      const visible = !this.reducedMotion && seconds >= s.delay && k < 1;
      const eased = k * k * (3 - 2 * k); // smoothstep: slow start, fast middle, soft end
      s.mesh.position.set(s.x * W - 700 * eased, s.y - 490 * eased, 0);
      s.mat.uniforms.uOpacity.value = visible ? night * Math.sin(Math.PI * Math.min(1, k)) : 0;
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number) {
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(width, height, false);
    // Keep the world 900 units tall; the width follows the screen's shape.
    this.worldWidth = WORLD_HEIGHT * (width / height);
    this.camera.right = this.worldWidth;
    this.camera.updateProjectionMatrix();

    this.sky.scale.set(this.worldWidth, WORLD_HEIGHT, 1);
    this.sky.position.set(this.worldWidth / 2, WORLD_HEIGHT / 2, 0);
    if (SHOW_ROAD) {
      this.road.scale.set(this.worldWidth, GROUND_Y, 1);
      this.road.position.set(this.worldWidth / 2, GROUND_Y / 2, 0);
    }

    // Shaders that measure in screen pixels need to know how dense the pixels are,
    // and how many screen pixels one world unit is.
    const pr = this.pixelRatio * (height / WORLD_HEIGHT);
    for (const m of this.pixelMats) m.uniforms.uPixelRatio.value = pr;
  }

  dispose() {
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose()); else mat?.dispose();
    });
    this.birds.dispose();
    this.renderer.dispose();
  }
}

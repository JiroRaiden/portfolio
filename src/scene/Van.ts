import * as THREE from 'three';
import { palette } from './palette';
import { beamFragment, basicVertex } from './shaders';

// The van is drawn in its own little coordinate space, facing right:
// x = 0 at the back bumper, x = 98 at the front; y = 0 where the tyres touch the road.
// Everything is flat 2D shapes (THREE.Shape), layered with renderOrder.

const BASE_ORDER = 12;           // in front of the road (10)
const WHEEL_RADIUS = 9;
const WHEEL_X = [22, 76];        // wheel centres
const WHEEL_Y = 9;

const flat = (c: string) =>
  new THREE.MeshBasicMaterial({ color: c, transparent: true, depthTest: false, depthWrite: false });

// A rectangle with rounded corners, as a Shape (outline) we can fill.
function roundedRect(x: number, y: number, w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function polygon(points: [number, number][]) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
  s.closePath();
  return s;
}

export class Van {
  readonly group = new THREE.Group();   // moved left/right by the scene
  private body = new THREE.Group();     // bobs gently on its suspension
  private wheels: THREE.Group[] = [];
  private beamMat: THREE.ShaderMaterial;
  private tailMat: THREE.MeshBasicMaterial;
  private headMat: THREE.MeshBasicMaterial;
  private windowMats: THREE.MeshBasicMaterial[] = [];
  private glassDay = new THREE.Color('#9fd8e6');
  private glassNight = new THREE.Color('#ffd9a0');

  constructor() {
    const add = (shape: THREE.Shape, mat: THREE.Material, order: number, parent: THREE.Object3D = this.body) => {
      const m = new THREE.Mesh(new THREE.ShapeGeometry(shape, 8), mat);
      m.renderOrder = BASE_ORDER + order * 0.01;
      parent.add(m);
      return m;
    };

    // --- Body: one outline with a rounded roof and a sloped windscreen.
    const body = new THREE.Shape();
    body.moveTo(4, 8);
    body.lineTo(92, 8);
    body.quadraticCurveTo(98, 8, 98, 14);        // rounded front-bottom corner
    body.lineTo(98, 22);
    body.quadraticCurveTo(97, 25, 92, 26);       // bonnet
    body.lineTo(84, 40);                         // windscreen slope
    body.quadraticCurveTo(82, 43, 78, 43);
    body.lineTo(9, 43);                          // roof
    body.quadraticCurveTo(2, 43, 2, 36);         // rounded rear-top corner
    body.lineTo(2, 12);
    body.quadraticCurveTo(2, 8, 4, 8);
    add(body, flat('#f3f1ee'), 0);

    // Lower panel, a shade darker, so the body doesn't look flat.
    add(polygon([[2, 8], [98, 8], [98, 15], [2, 15]]), flat('#d8d4cc'), 1);
    // Pink stripe along the side.
    add(polygon([[2, 18], [97, 18], [96.3, 21.5], [2, 21.5]]), flat(palette.pink), 2);
    // Roof rail.
    add(roundedRect(14, 43, 56, 2.5, 1), flat('#8a8a93'), 2);

    // --- Windows (they glow warm at night).
    const glass = () => {
      const m = flat('#9fd8e6');
      this.windowMats.push(m);
      return m;
    };
    add(polygon([[78, 27], [91, 27], [83, 39.5], [78, 39.5]]), glass(), 3);   // windscreen
    add(roundedRect(52, 27, 22, 12.5, 2), glass(), 3);                        // cab side window
    add(roundedRect(26, 27, 22, 12.5, 2), glass(), 3);                        // rear side window
    add(roundedRect(6, 27, 16, 12.5, 2), glass(), 3);                         // back window
    // A light reflection streak on each window.
    add(polygon([[56, 38], [60, 38], [55, 28], [52, 28]]), flat('#ffffff'), 4).material.opacity = 0.35;
    add(polygon([[30, 38], [34, 38], [29, 28], [26, 28]]), flat('#ffffff'), 4).material.opacity = 0.35;

    // --- Details.
    add(polygon([[75.5, 10], [76.5, 10], [76.5, 40], [75.5, 40]]), flat('#b9b5ad'), 4);  // door line
    add(roundedRect(68, 23, 5, 1.6, 0.8), flat('#6d6b68'), 4);                            // door handle
    add(roundedRect(86, 29, 4, 3, 1), flat('#3a3a40'), 4);                                // wing mirror
    add(roundedRect(0, 6.5, 99, 3.5, 1.5), flat('#6d6b68'), 5);                           // bumper

    // Headlight and tail light.
    this.headMat = flat('#fff3cf');
    add(roundedRect(94.5, 14, 4, 5, 1.5), this.headMat, 6);
    this.tailMat = flat(palette.pink);
    this.tailMat.opacity = 0.7;
    add(roundedRect(1, 16, 3, 7, 1), this.tailMat, 6);

    // Wheel arches: dark half-discs behind the tyres.
    for (const x of WHEEL_X) {
      const arch = new THREE.Shape();
      arch.absarc(x, WHEEL_Y, WHEEL_RADIUS + 2.5, 0, Math.PI, false);
      arch.closePath();
      add(arch, flat('#2a2a2e'), 7);
    }

    // --- Wheels: tyre, rim, hub and two spokes so you can see them roll.
    for (const x of WHEEL_X) {
      const w = new THREE.Group();
      w.position.set(x, WHEEL_Y, 0);
      const disc = (r: number, c: string, order: number) => {
        const s = new THREE.Shape();
        s.absarc(0, 0, r, 0, Math.PI * 2, false);
        return add(s, flat(c), order, w);
      };
      disc(WHEEL_RADIUS, '#151517', 8);
      disc(5.5, '#c9c7c3', 9);
      add(polygon([[-5, -0.8], [5, -0.8], [5, 0.8], [-5, 0.8]]), flat('#8a8a93'), 10, w);
      add(polygon([[-0.8, -5], [0.8, -5], [0.8, 5], [-0.8, 5]]), flat('#8a8a93'), 10, w);
      disc(1.8, '#2a2a2e', 11);
      this.wheels.push(w);
      this.group.add(w);   // wheels don't bob with the body
    }

    // --- Headlight beam: a soft cone in front, only visible at night.
    this.beamMat = new THREE.ShaderMaterial({
      vertexShader: basicVertex, fragmentShader: beamFragment,
      uniforms: { uColor: { value: new THREE.Color('#fff3cf') }, uOpacity: { value: 0 } },
      transparent: true, depthTest: false, depthWrite: false,
    });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(110, 26), this.beamMat);
    beam.position.set(98 + 55, 15, 0);
    beam.renderOrder = BASE_ORDER - 0.5;
    this.body.add(beam);

    this.group.add(this.body);
  }

  /**
   * x: where the van is on screen (world units).
   * lights: 0 = daytime, 1 = full night.
   * seconds: the clock, for the gentle engine wobble.
   */
  update(x: number, lights: number, seconds: number) {
    this.group.position.x = x;
    // Rolling without slipping: distance travelled / radius = angle turned (in radians).
    // Negative because turning clockwise moves a wheel to the right.
    for (const w of this.wheels) w.rotation.z = -x / WHEEL_RADIUS;
    this.body.position.y = Math.sin(seconds * 9) * 0.35;

    this.beamMat.uniforms.uOpacity.value = 0.6 * lights;
    this.tailMat.opacity = 0.7 + 0.3 * lights;
    this.headMat.color.set('#fff3cf').lerp(new THREE.Color('#ffffff'), lights);
    for (const m of this.windowMats) m.color.copy(this.glassDay).lerp(this.glassNight, lights * 0.8);
  }
}

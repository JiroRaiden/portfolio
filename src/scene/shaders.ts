// Shaders are small programs that run on the GPU.
// - The VERTEX shader runs once per corner of a shape and decides where it lands on screen.
// - The FRAGMENT shader runs once per pixel and decides that pixel's colour.
// Uniforms (uXxx) are values we pass in from JavaScript every frame.

// Shared vertex shader: pass the shape's UV (0..1 across its surface) to the fragment shader.
export const basicVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// SKY: a vertical gradient (top colour -> horizon colour) with faint diagonal stripes.
// The two colours change with scroll, which is what turns day into sunset into night.
// gl_FragCoord is the pixel position on screen, so the stripes stay the
// same size on every screen instead of stretching with the window.
export const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform float uPixelRatio;
  varying vec2 vUv;

  void main() {
    vec2 p = gl_FragCoord.xy / uPixelRatio;           // CSS pixels
    // Ease the gradient so the horizon colour hugs the ground.
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 0.85, vUv.y));
    float band = mod(p.x + p.y, 14.0);                  // 45 degree stripes, 14px apart
    col *= band < 7.0 ? 0.94 : 1.0;                     // stripes = a slightly darker shade
    gl_FragColor = vec4(col, 1.0);
  }
`;

// HALFTONE: a flat fill with a grid of round dots, like printed comics.
export const halftoneFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uDot;
  uniform float uCell;        // dot spacing in CSS pixels
  uniform float uRadius;      // dot radius in CSS pixels
  uniform float uPixelRatio;

  void main() {
    vec2 p = gl_FragCoord.xy / uPixelRatio;
    vec2 cell = mod(p, uCell) - uCell * 0.5;          // position inside the current dot cell
    float d = length(cell);
    float dotMask = 1.0 - smoothstep(uRadius - 0.6, uRadius + 0.6, d);
    gl_FragColor = vec4(mix(uBase, uDot, dotMask), 1.0);
  }
`;

// SUN: horizontal stripes clipped to a circle, plus a dashed outline.
export const sunFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uSize;        // quad size in world units (used to convert UV to units)
  uniform float uRadius;      // sun radius in world units
  uniform float uFill;        // stripe strength: strong by day, faint at dusk
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * uSize;                       // position relative to the sun's centre
    float r = length(p);

    // Stripes: 9 units of colour, 8 units gap.
    float stripe = step(mod(p.y + 1000.0, 17.0), 9.0);
    float inside = 1.0 - smoothstep(uRadius - 1.0, uRadius, r);
    float fill = inside * stripe * uFill;

    // Dashed ring: an arc 2 units thick, cut into dashes along its angle.
    float ring = 1.0 - smoothstep(0.0, 1.5, abs(r - uRadius));
    float angle = atan(p.y, p.x);
    float dash = step(0.43, fract(angle * uRadius / 14.0));
    float outline = ring * dash * 0.85;

    float a = max(fill, outline);
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

// ROAD: asphalt with a kerb along the top and a dashed centre line.
// Colours come in as uniforms so the road follows the time of day.
export const roadFragment = /* glsl */ `
  uniform vec3 uAsphalt;
  uniform vec3 uKerb;
  uniform vec3 uLine;
  uniform float uPixelRatio;
  varying vec2 vUv;

  void main() {
    vec3 col = uAsphalt;
    // Kerb: the top 12% of the strip, with small dark gaps like paving stones.
    if (vUv.y > 0.88) {
      float slab = mod(gl_FragCoord.x / uPixelRatio, 24.0);
      col = slab < 22.0 ? uKerb : uAsphalt;
    }
    // Centre line: 20px dashes with 16px gaps, halfway up the asphalt.
    float x = mod(gl_FragCoord.x / uPixelRatio, 36.0);
    if (abs(vUv.y - 0.44) < 0.035 && x < 20.0) col = uLine;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// GLOW: a soft cone of light (headlight beam), bright at the lamp, fading outwards.
export const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float along = 1.0 - vUv.x;                       // 1 at the lamp, 0 at the far end
    float across = 1.0 - abs(vUv.y - 0.5) * 2.0;     // 1 in the middle, 0 at the edges
    float a = along * along * smoothstep(0.0, 0.6, across) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

// SHOOTING STAR: a thin streak, transparent at the tail and bright at the head.
export const streakFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float a = smoothstep(0.0, 1.0, vUv.x) * uOpacity;
    gl_FragColor = vec4(uColor, a);
  }
`;

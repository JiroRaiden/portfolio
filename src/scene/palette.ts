// One place for every colour the scene uses, so the 3D city and the
// HTML chapters on top of it always match the design.
export const palette = {
  charcoal: '#1d1d20',
  stripe: '#232327',
  panel: '#151517',
  pink: '#ff4fa0',
  cyan: '#3ee6d8',
  cream: '#ffd9b0',
  orange: '#ff9a62',
  text: '#f3f1ee',
  // Halftone building colours: base fill + dot colour.
  backBase: '#34343a',
  backDot: '#4d4d54',
  frontBase: '#222226',
  frontDot: '#303036',
  cable: '#5c5c62',
  deck: '#45454b',
} as const;

// The design was drawn on a 1440 x 900 frame. We keep the world 900 units
// tall so every measurement from the design can be reused as-is.
export const WORLD_HEIGHT = 900;
export const DESIGN_WIDTH = 1440;
// Road + van along the bottom of the screen. Switched off for now:
// set this to true to bring them back (the code is all still there).
export const SHOW_ROAD = false;
// Buildings stand on this line: on top of the road when it is shown, on the screen edge when not.
export const GROUND_Y = SHOW_ROAD ? 40 : 0;

// Time of day. Each list is [scroll progress, colour]; in-between values blend.
// 0 = top of the page (day), 1 = bottom (night).
export const sky = {
  top: [[0, '#5b86c6'], [0.3, '#56699a'], [0.55, '#2f2640'], [0.85, '#1d1d20']],
  bottom: [[0, '#cfe3f0'], [0.3, '#f4b183'], [0.55, '#ff6f7d'], [0.85, '#1d1d20']],
  sun: [[0, '#fff3cf'], [0.3, '#ffd9b0'], [0.55, '#ff9a62'], [1, '#ff4fa0']],
  // Buildings: lighter blue-grey by day, charcoal at night.
  backBase: [[0, '#71809b'], [0.4, '#5a5a6e'], [0.8, '#34343a']],
  backDot: [[0, '#8594ae'], [0.4, '#6c6c80'], [0.8, '#4d4d54']],
  frontBase: [[0, '#465067'], [0.4, '#35334a'], [0.8, '#222226']],
  frontDot: [[0, '#56617a'], [0.4, '#434058'], [0.8, '#303036']],
  // Road: grey-blue asphalt by day, near-black at night.
  asphalt: [[0, '#555c6c'], [0.4, '#3a3446'], [0.8, '#19191c']],
  kerb: [[0, '#a3acbd'], [0.4, '#6c6c80'], [0.8, '#45454b']],
  roadLine: [[0, '#f3f1ee'], [0.5, '#ffd9b0'], [0.8, '#8a7a66']],
  // Birds: dark blue silhouettes against the day sky, plum against the sunset.
  birds: [[0, '#2c3450'], [0.3, '#3b2c44'], [0.5, '#2a2233']],
} as const;


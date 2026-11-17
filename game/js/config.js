// PERIHELION tuning. Every number that shapes how the game feels lives here so
// the design can be tuned in one place. Distances are canvas pixels on the
// fixed 960x540 stage, times are seconds, speeds are pixels per second.

export const STAGE = { w: 960, h: 540 };

export const SUN = {
  x: STAGE.w / 2,
  y: STAGE.h / 2 + 6,
  radius: 46,          // visible disc
  // Effective mu = gravity * gravityScale / 100 = 1.15e7: at spawn distance
  // (250 px) a circular orbit needs ~215 px/s, at the graze band ~330 px/s,
  // so faster-nearer gives a real Keplerian feel and thrust still matters.
  gravity: 1150000,
  gravityScale: 1000,  // accel = gravity / dist (softened inverse, feels good)
  grazeBand: [78, 132], // distance from centre that counts as a graze
  burnRadius: 74,      // inside this the hull starts taking heat damage
  killRadius: 52,      // touching the photosphere is instant death
};

export const COMET = {
  thrust: 560,         // px/s^2 while burning
  steer: 2.2,          // rad/s the velocity vector bends toward the pointer while thrusting
  maxSpeed: 680,
  fuelMax: 100,
  fuelBurn: 26,        // per second of thrust
  fuelRegen: 9,        // per second coasting
  fuelRegenFar: 16,    // per second coasting beyond FAR_ORBIT
  hullMax: 100,
  hitInvuln: 1.3,      // seconds of invulnerability after a hit
  radius: 7,
  spawn: { x: SUN.x, y: SUN.y - 250, vx: 215, vy: 0 }, // a stable-ish orbit
};

export const FAR_ORBIT = 430;

export const HEAT = {
  rateNear: 55,        // heat per second at the burn radius
  coolRate: 34,        // cooling per second far away
  damageFrom: 78,      // heat above this hurts
  damagePerSec: 9,
};

export const SCORE = {
  dust: 25,
  graze: 40,
  orbit: 150,
  multMax: 9,
  grazeSpeedMin: 210,  // a graze only counts with real speed
};

export const FLARES = {
  firstAt: 5,          // seconds into the run
  baseGap: [6.5, 9.5], // random gap between eruptions at level 1
  gapPerLevel: 0.55,   // gap shrinks per orbit level
  minGap: 3.4,
  telegraph: 1.25,     // wedge glows before the beam fires
  active: 1.7,
  length: 330,         // beam reach from the sun centre
  halfWidth: 0.16,     // radians, half the beam's angular width
  sweepMax: 1.1,       // rad/s the beam can rotate while active
  damage: 24,
  tick: 0.45,          // seconds between damage ticks inside the beam
};

export const ROCKS = {
  firstAt: 10,
  baseGap: [5.5, 8.5],
  gapPerLevel: 0.5,
  minGap: 2.6,
  speed: [70, 150],
  speedPerLevel: 9,
  radius: [9, 20],
  damage: 30,
  burnAt: 150,         // closer than this to the sun a rock starts burning up
};

export const DUST = {
  count: 9,            // motes kept on the field
  radius: 5,
  pickup: 16,          // pickup distance from the comet
  minSunDist: 120,     // motes never spawn inside the graze band
  maxSunDist: 400,
};

// Hunter drones: from the second night on, the star is defended. Hunters
// chase the comet with a limited turn rate — and they die the way you make
// them: overheated in the burn band, caught in a flare, or swallowed whole.
export const HUNTERS = {
  fromNight: 1,        // NIGHTS index they start appearing on (II: SOLAR WIND)
  gap: [8, 13],        // seconds between arrivals on their first night
  gapPerNight: 0.85,   // each later night sends them sooner
  maxAlive: 3,
  speed: 168,          // top chase speed
  accel: 300,
  turn: 2.4,           // rad/s steering — you can out-turn them, barely
  radius: 9,
  heatRate: 95,        // heat/s inside the burn band; 100 heat = dead
  life: 26,            // seconds before they break off and retreat
  touchDamage: 18,     // kamikaze hit on the comet
  score: 150,
};

// The nightly choice: each new night offers two upgrades, pick one.
// ids are applied by game.js's applyChoice.
export const CHOICES = [
  // → NIGHT II · SOLAR WIND
  [
    { id: 'tank',   name: 'AUX TANK',       desc: '+45% fuel capacity' },
    { id: 'regen',  name: 'RECYCLER',       desc: '+70% fuel regeneration' },
  ],
  // → NIGHT III · EMBER SWARM
  [
    { id: 'armour', name: 'ARMOUR PLATING', desc: '+35 hull, fitted at once' },
    { id: 'shield', name: 'HEATSHIELD',     desc: 'corona heat builds 30% slower' },
  ],
  // → NIGHT IV · TOTALITY
  [
    { id: 'engine', name: 'VECTOR ENGINE',  desc: '+22% thrust' },
    { id: 'scoop',  name: 'WIDEBAND SCOOP', desc: 'graze band 18 km wider' },
  ],
  // → NIGHT V · FIRE SEASON
  [
    { id: 'lean',   name: 'LEAN BURN',      desc: 'thrust costs 30% less fuel' },
    { id: 'core',   name: 'REINFORCED CORE', desc: '+35 hull, fitted at once' },
  ],
  // → NIGHT VI · THE LONG DARK
  [
    { id: 'over',   name: 'OVERDRIVE',      desc: '+15% top speed' },
    { id: 'fins',   name: 'COOLANT FINS',   desc: 'cool down 55% faster' },
  ],
  // → NIGHT VII · CORONA MAXIMA
  [
    { id: 'pred',   name: 'PREDATOR PROTOCOL', desc: 'hunter kills score double' },
    { id: 'magnet', name: 'STARDUST MAGNET',   desc: '+60% pickup reach' },
  ],
];

// The Seven Nights: each completed orbit raises the curtain on a new night
// with its own temper. Multipliers stack on top of the level scaling, so the
// star gets faster, hotter and meaner the longer you survive.
export const NIGHTS = [
  { name: 'FIRST LIGHT',    epithet: 'learn the star\'s temper',   flareGap: 1,    flareSweep: 1,    rockGap: 1,    rockSpeed: 1,    heat: 1,    dust: 1   },
  { name: 'SOLAR WIND',     epithet: 'the flares quicken',         flareGap: 0.8,  flareSweep: 1.25, rockGap: 1,    rockSpeed: 1,    heat: 1,    dust: 1   },
  { name: 'EMBER SWARM',    epithet: 'the belt throws stones',     flareGap: 1,    flareSweep: 1,    rockGap: 0.7,  rockSpeed: 1.25, heat: 1,    dust: 1   },
  { name: 'TOTALITY',       epithet: 'the corona burns longer',    flareGap: 0.75, flareSweep: 1.1,  rockGap: 1,    rockSpeed: 1,    heat: 1.25, dust: 1.5 },
  { name: 'FIRE SEASON',    epithet: 'the heat lingers',           flareGap: 0.7,  flareSweep: 1.2,  rockGap: 0.9,  rockSpeed: 1.1,  heat: 1.4,  dust: 1.5 },
  { name: 'THE LONG DARK',  epithet: 'fast rocks, sweeping fire',  flareGap: 0.75, flareSweep: 1.4,  rockGap: 0.55, rockSpeed: 1.4,  heat: 1.3,  dust: 1.5 },
  { name: 'CORONA MAXIMA',  epithet: 'the star gives everything',  flareGap: 0.55, flareSweep: 1.5,  rockGap: 0.5,  rockSpeed: 1.5,  heat: 1.5,  dust: 2   },
];

export const COLORS = {
  void: '#06030f',
  sunCore: '#fff3d6',
  sunMid: '#ffb347',
  sunEdge: '#ff7a2f',
  comet: '#9df3ff',
  cometCore: '#eaffff',
  dust: '#ffd76a',
  flare: '#ff5a3c',
  rock: '#8d7fb8',
  hud: '#cdd6ff',
  danger: '#ff4d6d',
  good: '#7dffc4',
};

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
  thrust: 460,         // px/s^2 while burning
  maxSpeed: 620,
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
  firstAt: 9,          // seconds into the run
  baseGap: [7.5, 11],  // random gap between eruptions at level 1
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
  firstAt: 16,
  baseGap: [6.5, 10],
  gapPerLevel: 0.5,
  minGap: 2.6,
  speed: [70, 150],
  speedPerLevel: 9,
  radius: [9, 20],
  damage: 30,
  burnAt: 150,         // closer than this to the sun a rock starts burning up
};

export const DUST = {
  count: 7,            // motes kept on the field
  radius: 5,
  pickup: 16,          // pickup distance from the comet
  minSunDist: 120,     // motes never spawn inside the graze band
  maxSunDist: 400,
};

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

// Tiny math helpers shared by every system. No state lives here.

export const TAU = Math.PI * 2;

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export const lerp = (a, b, t) => a + (b - a) * t;

// Frame-rate independent exponential approach: moves `cur` toward `target`
// with a time constant of `rate` per second.
export const approach = (current, target, rate, dt) =>
  lerp(current, target, 1 - Math.exp(-rate * dt));

export const rand = (lo = 1, hi) => (hi === undefined ? Math.random() * lo : lo + Math.random() * (hi - lo));

export const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

export const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);

// Smallest signed difference between two angles, in (-PI, PI].
export const angleDelta = (a, b) => {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};

// True when the ray from the sun at `angle` falls inside an arc centred on
// `arcAngle` with half width `half`.
export const inArc = (angle, arcAngle, half) => Math.abs(angleDelta(arcAngle, angle)) <= half;

export const fmt = (n) => Math.round(n).toLocaleString('en-US');

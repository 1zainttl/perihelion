// The comet: the player's ship. Newtonian fall around the sun, thrust toward
// the pointer, a fuel tank, a hull, a heat gauge, and a glowing trail that
// records where it has flown.

import { SUN, COMET, HEAT, FAR_ORBIT, COLORS } from './config.js';
import { clamp, dist, angleTo, angleDelta, TAU } from './utils.js';

export function createComet() {
  return {
    x: COMET.spawn.x, y: COMET.spawn.y,
    vx: COMET.spawn.vx, vy: COMET.spawn.vy,
    fuel: COMET.fuelMax,
    fuelMax: COMET.fuelMax,   // upgrades can grow these
    hullMax: COMET.hullMax,
    hull: COMET.hullMax,
    heat: 0,
    invuln: 0,
    thrusting: false,
    alive: true,
    trail: [],            // recent positions for the ion tail
    lastAngle: Math.atan2(COMET.spawn.y - SUN.y, COMET.spawn.x - SUN.x),
    orbits: 0,

    // up: the player's chosen upgrade multipliers (thrust, burn, regen,
    // maxSpeed, heat, cool — all default 1).
    update(dt, input, particles, up = {}) {
      if (!this.alive) return null;

      // Gravity: softened inverse-distance pull toward the sun.
      const dx = SUN.x - this.x, dy = SUN.y - this.y;
      const d = Math.max(Math.hypot(dx, dy), 30);
      const g = (SUN.gravity * SUN.gravityScale) / (d * d * 100);
      this.vx += (dx / d) * g * dt;
      this.vy += (dy / d) * g * dt;

      // Thrust toward the pointer while the button is held and fuel lasts.
      this.thrusting = input.state.thrust && this.fuel > 0;
      if (this.thrusting) {
        const a = angleTo(this.x, this.y, input.state.px, input.state.py);
        const thrust = COMET.thrust * (up.thrust ?? 1);
        this.vx += Math.cos(a) * thrust * dt;
        this.vy += Math.sin(a) * thrust * dt;
        // Vectoring: the velocity bends toward where you point, so the ship
        // answers the stick while the star still owns the orbit.
        const sp = Math.hypot(this.vx, this.vy);
        if (sp > 1) {
          const cur = Math.atan2(this.vy, this.vx);
          const bend = clamp(angleDelta(cur, a), -COMET.steer * dt, COMET.steer * dt);
          this.vx = Math.cos(cur + bend) * sp;
          this.vy = Math.sin(cur + bend) * sp;
        }
        this.fuel = Math.max(0, this.fuel - COMET.fuelBurn * (up.burn ?? 1) * dt);
        const back = angleTo(input.state.px, input.state.py, this.x, this.y);
        particles.exhaust(
          this.x + Math.cos(back) * 8, this.y + Math.sin(back) * 8,
          this.vx * 0.15 + Math.cos(back) * 90,
          this.vy * 0.15 + Math.sin(back) * 90,
        );
      } else {
        const far = d > FAR_ORBIT;
        const regen = (far ? COMET.fuelRegenFar : COMET.fuelRegen) * (up.regen ?? 1);
        this.fuel = Math.min(this.fuelMax, this.fuel + regen * dt);
      }

      const maxSpeed = COMET.maxSpeed * (up.maxSpeed ?? 1);
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Heat: the burn band warms you, deep space cools you.
      if (d < SUN.burnRadius) {
        this.heat = clamp(this.heat + HEAT.rateNear * (this.heatMul || 1) * (up.heat ?? 1) * (1 - d / SUN.burnRadius + 0.35) * dt, 0, 100);
      } else {
        this.heat = clamp(this.heat - HEAT.coolRate * (up.cool ?? 1) * dt, 0, 100);
      }
      let event = null;
      if (this.heat > HEAT.damageFrom) {
        this.hull -= HEAT.damagePerSec * dt;
        event = 'burning';
      }

      // Orbit counting: each full lap around the sun.
      const ang = Math.atan2(this.y - SUN.y, this.x - SUN.x);
      let delta = ang - this.lastAngle;
      if (delta > Math.PI) delta -= TAU;
      if (delta < -Math.PI) delta += TAU;
      this.orbitProgress = (this.orbitProgress ?? 0) + delta;
      this.lastAngle = ang;
      let lapped = false;
      if (Math.abs(this.orbitProgress) >= TAU) {
        this.orbits += 1;
        this.orbitProgress = 0;
        lapped = true;
      }

      // The ion trail.
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 90) this.trail.shift();

      if (this.invuln > 0) this.invuln -= dt;
      // Report death to the game; it owns alive=false and the results scene.
      if (this.hull <= 0) return 'hull';
      if (d < SUN.killRadius) return 'sun';
      return lapped ? 'orbit' : event;
    },

    sunDist() { return dist(this.x, this.y, SUN.x, SUN.y); },
    speed() { return Math.hypot(this.vx, this.vy); },

    draw(ctx) {
      if (!this.alive) return;

      // Ion tail, fading out.
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 1; i < this.trail.length; i++) {
        const k = i / this.trail.length;
        ctx.strokeStyle = `rgba(125, 230, 255, ${(k * 0.5).toFixed(3)})`;
        ctx.lineWidth = 3.5 * k;
        ctx.beginPath();
        ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
        ctx.stroke();
      }
      ctx.restore();

      const flicker = this.invuln > 0 && Math.floor(this.invuln * 14) % 2 === 0;
      if (flicker) return; // invulnerability blink

      // Glow shell.
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 26);
      const hot = this.heat / 100;
      g.addColorStop(0, `rgba(${157 + hot * 98}, ${243 - hot * 120}, 255, 0.5)`);
      g.addColorStop(1, 'rgba(125, 230, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 26, 0, TAU);
      ctx.fill();

      // Nucleus, warming with heat.
      ctx.fillStyle = hot > 0.55 ? COLORS.sunMid : COLORS.cometCore;
      ctx.beginPath();
      ctx.arc(this.x, this.y, COMET.radius, 0, TAU);
      ctx.fill();
      ctx.fillStyle = COLORS.cometCore;
      ctx.beginPath();
      ctx.arc(this.x - 1.5, this.y - 1.5, COMET.radius * 0.45, 0, TAU);
      ctx.fill();
    },
  };
}

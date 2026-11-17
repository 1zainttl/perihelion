// Hunters: hostile drones that ride in from the dark and chase the comet.
// You have no gun — the star is the gun. Hunters die by overheating in the
// burn band, by flying through a live flare, or by falling into the
// photosphere. Every kill you engineer pays out; every one that touches you
// costs hull. They give up and retreat when their chase clock runs out.

import { STAGE, SUN, HUNTERS, COLORS, COMET } from './config.js';
import { rand, dist, angleDelta, clamp, TAU } from './utils.js';

export function createHunters() {
  let hunters = [];
  let timer = HUNTERS.gap[0];

  const spawn = () => {
    const edge = Math.floor(rand(4));
    const m = 24;
    let x, y;
    if (edge === 0) { x = rand(STAGE.w); y = -m; }
    else if (edge === 1) { x = STAGE.w + m; y = rand(STAGE.h); }
    else if (edge === 2) { x = rand(STAGE.w); y = STAGE.h + m; }
    else { x = -m; y = rand(STAGE.h); }
    // Enter already moving toward mid-field so the chase starts immediately.
    const a = Math.atan2(STAGE.h / 2 - y, STAGE.w / 2 - x);
    hunters.push({
      x, y,
      vx: Math.cos(a) * HUNTERS.speed * 0.5,
      vy: Math.sin(a) * HUNTERS.speed * 0.5,
      heat: 0,
      life: HUNTERS.life,
      leaving: false,
      strobe: rand(TAU),
    });
  };

  return {
    // hooks: { onSpawn(), onKill(h, cause), onRam(h) }
    update(dt, night, comet, sun, particles, hooks) {
      if (night >= HUNTERS.fromNight) {
        const maxAlive = Math.min(HUNTERS.maxAlive, 2 + Math.floor((night - HUNTERS.fromNight) / 2));
        timer -= dt;
        if (timer <= 0) {
          timer = rand(...HUNTERS.gap) * Math.pow(HUNTERS.gapPerNight, night - HUNTERS.fromNight);
          if (hunters.length < maxAlive) { spawn(); hooks.onSpawn?.(); }
        }
      }

      for (let i = hunters.length - 1; i >= 0; i--) {
        const h = hunters[i];
        h.life -= dt;
        h.strobe += dt * 9;
        if (h.life <= 0) h.leaving = true;

        const sp = Math.hypot(h.vx, h.vy) || 1;
        const cur = Math.atan2(h.vy, h.vx);
        let want;
        if (h.leaving) {
          // Break off: run for deep space, away from the star.
          want = Math.atan2(h.y - SUN.y, h.x - SUN.x);
        } else {
          want = Math.atan2(comet.y - h.y, comet.x - h.x);
        }
        const turn = clamp(angleDelta(cur, want), -HUNTERS.turn * dt, HUNTERS.turn * dt);
        const ns = Math.min(HUNTERS.speed, sp + HUNTERS.accel * dt);
        h.vx = Math.cos(cur + turn) * ns;
        h.vy = Math.sin(cur + turn) * ns;
        h.x += h.vx * dt;
        h.y += h.vy * dt;

        const dSun = dist(h.x, h.y, SUN.x, SUN.y);

        // The burn band cooks them — the core kill mechanic.
        if (dSun < SUN.burnRadius) {
          h.heat += HUNTERS.heatRate * dt;
          particles.rockBurn(h.x, h.y, h.vx, h.vy);
          if (h.heat >= 100) {
            hunters.splice(i, 1);
            hooks.onKill?.(h, 'overheat');
            continue;
          }
        } else {
          h.heat = Math.max(0, h.heat - 30 * dt);
        }

        // Swallowed by the star.
        if (dSun < SUN.killRadius + 3) {
          hunters.splice(i, 1);
          hooks.onKill?.(h, 'sun');
          continue;
        }

        // Caught in a live flare beam.
        if (sun.beamHits(h.x, h.y)) {
          hunters.splice(i, 1);
          hooks.onKill?.(h, 'flare');
          continue;
        }

        // Gone for good?
        if (h.x < -90 || h.x > STAGE.w + 90 || h.y < -90 || h.y > STAGE.h + 90) {
          hunters.splice(i, 1);
          continue;
        }

        // Kamikaze: they touch the comet, both pay for it.
        if (!h.leaving && comet.alive && comet.invuln <= 0 &&
            dist(h.x, h.y, comet.x, comet.y) < HUNTERS.radius + COMET.radius + 2) {
          hunters.splice(i, 1);
          hooks.onRam?.(h);
          continue;
        }
      }
    },

    draw(ctx) {
      for (const h of hunters) {
        const a = Math.atan2(h.vy, h.vx);
        const hot = h.heat / 100;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(a);

        // Engine glow, reddening as it cooks.
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
        g.addColorStop(0, `rgba(${255}, ${Math.round(90 - hot * 40)}, ${Math.round(120 + hot * 60)}, 0.4)`);
        g.addColorStop(1, 'rgba(255, 60, 90, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, TAU);
        ctx.fill();

        // Dart body.
        ctx.beginPath();
        ctx.moveTo(11, 0);
        ctx.lineTo(-8, 6.5);
        ctx.lineTo(-4.5, 0);
        ctx.lineTo(-8, -6.5);
        ctx.closePath();
        ctx.fillStyle = hot > 0.55 ? '#ff7a4a' : '#3d2b52';
        ctx.fill();
        ctx.strokeStyle = hot > 0.2 ? COLORS.sunMid : '#b98fff';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Strobe.
        if (Math.sin(h.strobe) > 0.55) {
          ctx.fillStyle = COLORS.danger;
          ctx.beginPath();
          ctx.arc(0, 0, 2.2, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
    },

    clear() { hunters = []; timer = HUNTERS.gap[0]; },
    get count() { return hunters.length; },
  };
}

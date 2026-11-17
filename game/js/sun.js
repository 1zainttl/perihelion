// The sun: a layered radial-gradient star with a breathing corona, and the
// solar flares — rotating beam sectors that telegraph, fire, and sweep.
// The sun is both the score multiplier's source (graze it) and the killer.

import { SUN, FLARES, COLORS } from './config.js';
import { TAU, rand, inArc, angleDelta, clamp } from './utils.js';

export function createSun() {
  let flareTimer = FLARES.firstAt;
  let flare = null; // { angle, drift, phase, t }
  let coronaT = 0;

  return {
    x: SUN.x,
    y: SUN.y,

    // Returns an event string when something worth a sound happened.
    // mods: the night's temper (flareGap / flareSweep multipliers).
    update(dt, level, cometAngle, mods = {}) {
      const gapMul = mods.flareGap ?? 1;
      const sweepMul = mods.flareSweep ?? 1;
      coronaT += dt;
      let event = null;

      if (!flare) {
        flareTimer -= dt;
        if (flareTimer <= 0) {
          const gap = Math.max(FLARES.minGap, (rand(...FLARES.baseGap) - FLARES.gapPerLevel * (level - 1)) * gapMul);
          flareTimer = gap;
          // Erupt toward the comet half the time so the threat feels aimed.
          const aimed = Math.random() < 0.55 && cometAngle !== undefined;
          const angle = aimed ? cometAngle + rand(-0.5, 0.5) : rand(TAU);
          const sweep = Math.min(FLARES.sweepMax, (0.25 + level * 0.07) * sweepMul);
          flare = { angle, drift: rand(-sweep, sweep), phase: 'telegraph', t: FLARES.telegraph };
          event = 'flare-telegraph';
        }
      } else {
        flare.t -= dt;
        if (flare.phase === 'telegraph' && flare.t <= 0) {
          flare.phase = 'active';
          flare.t = FLARES.active;
          event = 'flare-fire';
        } else if (flare.phase === 'active') {
          flare.angle += flare.drift * dt;
          if (flare.t <= 0) flare = null;
        }
      }
      return event;
    },

    // Damage check: is this point inside the live beam?
    beamHits(x, y) {
      if (!flare || flare.phase !== 'active') return false;
      const dx = x - SUN.x, dy = y - SUN.y;
      const d = Math.hypot(dx, dy);
      if (d > FLARES.length || d < SUN.radius * 0.6) return false;
      const width = FLARES.halfWidth * (1.35 - 0.5 * (d / FLARES.length));
      return inArc(Math.atan2(dy, dx), flare.angle, width);
    },

    flareActive() { return flare && flare.phase === 'active'; },

    draw(ctx, t) {
      const { x, y } = SUN;

      // Corona: three breathing glow shells.
      for (let i = 3; i >= 1; i--) {
        const pulse = 1 + 0.05 * Math.sin(coronaT * (1.1 + i * 0.35) + i);
        const r = SUN.radius * (1.5 + i * 0.55) * pulse;
        const g = ctx.createRadialGradient(x, y, SUN.radius * 0.4, x, y, r);
        g.addColorStop(0, `rgba(255, 179, 71, ${0.16 - i * 0.035})`);
        g.addColorStop(1, 'rgba(255, 122, 47, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }

      // Flare: telegraph wedge, then the beam itself.
      if (flare) {
        const reach = FLARES.length;
        if (flare.phase === 'telegraph') {
          const k = 1 - flare.t / FLARES.telegraph;
          ctx.save();
          ctx.globalAlpha = 0.18 + 0.3 * k * (0.6 + 0.4 * Math.sin(t * 18));
          ctx.fillStyle = COLORS.danger;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.arc(x, y, reach * 0.9, flare.angle - FLARES.halfWidth, flare.angle + FLARES.halfWidth);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          const fade = clamp(flare.t / 0.35, 0, 1);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (const [wScale, alpha] of [[1.35, 0.28], [0.8, 0.5], [0.32, 0.85]]) {
            const w = FLARES.halfWidth * wScale;
            const g = ctx.createRadialGradient(x, y, SUN.radius * 0.5, x, y, reach);
            g.addColorStop(0, `rgba(255, 120, 60, ${alpha * fade})`);
            g.addColorStop(0.75, `rgba(255, 90, 60, ${alpha * 0.5 * fade})`);
            g.addColorStop(1, 'rgba(255, 90, 60, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.arc(x, y, reach, flare.angle - w, flare.angle + w);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // The disc, with a hot rim.
      const disc = ctx.createRadialGradient(x - 10, y - 12, 4, x, y, SUN.radius);
      disc.addColorStop(0, COLORS.sunCore);
      disc.addColorStop(0.55, COLORS.sunMid);
      disc.addColorStop(1, COLORS.sunEdge);
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(x, y, SUN.radius, 0, TAU);
      ctx.fill();

      // Rim shimmer.
      ctx.strokeStyle = 'rgba(255, 230, 170, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, SUN.radius + 1 + Math.sin(coronaT * 3) * 1.2, 0, TAU);
      ctx.stroke();
    },
  };
}

// Stardust: the golden motes that are the run's bread and butter. A fixed
// number orbit the play field at any time; collecting one scores, sparkles,
// and nudges the multiplier. They never spawn inside the graze band — the
// close stuff has to be earned with heat.

import { SUN, DUST, STAGE, COLORS } from './config.js';
import { rand, dist, TAU } from './utils.js';

export function createPickups() {
  let motes = [];

  const place = (mote) => {
    // Ring band around the sun, outside the graze zone.
    const a = rand(TAU);
    const d = rand(DUST.minSunDist, DUST.maxSunDist);
    mote.x = SUN.x + Math.cos(a) * d * 1.15;
    mote.y = SUN.y + Math.sin(a) * d * 0.82;
    mote.x = Math.min(Math.max(mote.x, 24), STAGE.w - 24);
    mote.y = Math.min(Math.max(mote.y, 24), STAGE.h - 24);
    mote.phase = rand(TAU);
    mote.taken = false;
  };

  return {
    reset() {
      motes = [];
      for (let i = 0; i < DUST.count; i++) {
        const m = {};
        place(m);
        motes.push(m);
      }
    },

    update(dt, comet, onCollect) {
      for (const m of motes) {
        m.phase += dt * 2.2;
        if (!m.taken && comet.alive && dist(m.x, m.y, comet.x, comet.y) < DUST.pickup + 4) {
          m.taken = true;
          onCollect(m.x, m.y);
          place(m); // respawn somewhere new
        }
      }
    },

    draw(ctx) {
      for (const m of motes) {
        if (m.taken) continue;
        const pulse = 0.75 + 0.25 * Math.sin(m.phase);
        const r = DUST.radius * pulse;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 3);
        g.addColorStop(0, 'rgba(255, 215, 106, 0.8)');
        g.addColorStop(1, 'rgba(255, 215, 106, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, r * 3, 0, TAU);
        ctx.fill();
        // Four-point star core.
        ctx.fillStyle = COLORS.dust;
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.phase * 0.4);
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.5); ctx.lineTo(r * 0.36, 0); ctx.lineTo(0, r * 1.5); ctx.lineTo(-r * 0.36, 0);
        ctx.closePath();
        ctx.moveTo(-r * 1.5, 0); ctx.lineTo(0, -r * 0.36); ctx.lineTo(r * 1.5, 0); ctx.lineTo(0, r * 0.36);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    },
  };
}

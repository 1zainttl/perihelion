// Particles: one pooled system for exhaust, sparkles, graze streaks and the
// final burn-out. Additive blending makes everything glow against the void.

import { rand, TAU } from './utils.js';

const MAX = 900;

export function createParticles() {
  const pool = [];

  const spawn = (opts) => {
    if (pool.length >= MAX) pool.shift();
    pool.push({
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0.6, age: 0,
      size: 2, shrink: true,
      color: '255, 220, 120',
      drag: 0,
      ...opts,
    });
  };

  return {
    exhaust(x, y, vx, vy) {
      spawn({
        x, y,
        vx: vx + rand(-18, 18), vy: vy + rand(-18, 18),
        life: rand(0.3, 0.6), size: rand(1.2, 2.6),
        color: '125, 230, 255', drag: 2.2,
      });
    },
    sparkle(x, y) {
      for (let i = 0; i < 10; i++) {
        const a = rand(TAU), s = rand(40, 150);
        spawn({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: rand(0.35, 0.7), size: rand(1, 2.4),
          color: '255, 215, 106', drag: 1.5,
        });
      }
    },
    grazeStreak(x, y, vx, vy) {
      for (let i = 0; i < 16; i++) {
        spawn({
          x: x + rand(-6, 6), y: y + rand(-6, 6),
          vx: vx * rand(0.25, 0.5) + rand(-30, 30),
          vy: vy * rand(0.25, 0.5) + rand(-30, 30),
          life: rand(0.35, 0.8), size: rand(1.4, 3),
          color: '255, 170, 80', drag: 0.8,
        });
      }
    },
    explosion(x, y) {
      for (let i = 0; i < 90; i++) {
        const a = rand(TAU), s = rand(30, 420);
        spawn({
          x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: rand(0.5, 1.6), size: rand(1.5, 4.5),
          color: i % 3 === 0 ? '157, 243, 255' : i % 3 === 1 ? '255, 179, 71' : '255, 90, 60',
          drag: 1.1,
        });
      }
    },
    rockBurn(x, y, vx, vy) {
      spawn({
        x, y, vx: vx * 0.3 + rand(-25, 25), vy: vy * 0.3 + rand(-25, 25),
        life: rand(0.4, 0.9), size: rand(1.2, 3),
        color: '255, 122, 47', drag: 0.6,
      });
    },
    update(dt) {
      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];
        p.age += dt;
        if (p.age >= p.life) { pool.splice(i, 1); continue; }
        const d = 1 - p.drag * dt;
        if (d > 0) { p.vx *= d; p.vy *= d; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    },
    draw(ctx) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of pool) {
        const k = 1 - p.age / p.life;
        const r = p.shrink ? p.size * k : p.size;
        ctx.fillStyle = `rgba(${p.color}, ${(k * 0.9).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(r, 0.1), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    },
    clear() { pool.length = 0; },
  };
}

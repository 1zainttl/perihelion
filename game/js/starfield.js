// Starfield: two parallax layers of stars plus a slow colour drift of distant
// nebulae. Pure decoration, drawn first every frame.

import { STAGE } from './config.js';
import { rand, TAU } from './utils.js';

export function createStarfield() {
  const layers = [
    { stars: [], speed: 0.12, sizeMax: 1.1, alpha: 0.5 },
    { stars: [], speed: 0.3, sizeMax: 1.8, alpha: 0.85 },
  ];
  for (const layer of layers) {
    for (let i = 0; i < 90; i++) {
      layer.stars.push({
        x: rand(STAGE.w),
        y: rand(STAGE.h),
        r: rand(0.4, layer.sizeMax),
        tw: rand(TAU),       // twinkle phase
        twSpeed: rand(0.4, 1.6),
      });
    }
  }
  const nebulae = [];
  for (let i = 0; i < 4; i++) {
    nebulae.push({
      x: rand(STAGE.w), y: rand(STAGE.h), r: rand(180, 320),
      hue: [265, 285, 210, 320][i], drift: rand(-4, 4), a: rand(0.04, 0.07),
    });
  }

  return {
    update(dt, cx, cy) {
      // Parallax against the camera shake offset passed in as (cx, cy).
      for (const n of nebulae) {
        n.x += n.drift * dt;
        if (n.x < -n.r) n.x = STAGE.w + n.r;
        if (n.x > STAGE.w + n.r) n.x = -n.r;
      }
      for (const layer of layers) {
        for (const s of layer.stars) s.tw += s.twSpeed * dt;
      }
    },
    draw(ctx, t, camX = 0, camY = 0) {
      for (const n of nebulae) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `hsla(${n.hue}, 70%, 45%, ${n.a})`);
        g.addColorStop(1, 'hsla(265, 70%, 45%, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      }
      for (const layer of layers) {
        for (const s of layer.stars) {
          const x = s.x - camX * layer.speed;
          const y = s.y - camY * layer.speed;
          const a = layer.alpha * (0.6 + 0.4 * Math.sin(s.tw));
          ctx.fillStyle = `rgba(226, 232, 255, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(((x % STAGE.w) + STAGE.w) % STAGE.w, ((y % STAGE.h) + STAGE.h) % STAGE.h, s.r, 0, TAU);
          ctx.fill();
        }
      }
    },
  };
}

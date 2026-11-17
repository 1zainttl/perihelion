// Hazards: asteroids drift in from the edge of the stage on tangled paths.
// They damage the comet on contact, and burn up in a shower of sparks if they
// fall too close to the sun — worth watching, and worth luring.

import { STAGE, SUN, ROCKS, COLORS } from './config.js';
import { rand, dist, TAU } from './utils.js';

export function createHazards() {
  let rocks = [];
  let timer = ROCKS.firstAt;

  const spawnRock = (level) => {
    // Spawn just off a random edge, aimed loosely at the play field.
    const edge = Math.floor(rand(4));
    const m = 30;
    let x, y;
    if (edge === 0) { x = rand(STAGE.w); y = -m; }
    else if (edge === 1) { x = STAGE.w + m; y = rand(STAGE.h); }
    else if (edge === 2) { x = rand(STAGE.w); y = STAGE.h + m; }
    else { x = -m; y = rand(STAGE.h); }
    const tx = STAGE.w / 2 + rand(-260, 260);
    const ty = STAGE.h / 2 + rand(-180, 180);
    const a = Math.atan2(ty - y, tx - x);
    const s = rand(...ROCKS.speed) + ROCKS.speedPerLevel * (level - 1);
    const r = rand(...ROCKS.radius);
    const verts = [];
    const n = 8;
    for (let i = 0; i < n; i++) verts.push(rand(0.72, 1.25));
    rocks.push({
      x, y,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      r, verts, spin: rand(-1.5, 1.5), rot: rand(TAU),
      burning: 0,
    });
  };

  return {
    update(dt, level, comet, particles, onHit) {
      const gap = Math.max(ROCKS.minGap, rand(...ROCKS.baseGap) - ROCKS.gapPerLevel * (level - 1));
      timer -= dt;
      if (timer <= 0) { timer = gap; spawnRock(level); }

      for (let i = rocks.length - 1; i >= 0; i--) {
        const rock = rocks[i];
        rock.x += rock.vx * dt;
        rock.y += rock.vy * dt;
        rock.rot += rock.spin * dt;

        // Sunlight grinds rocks down near the star.
        const dSun = dist(rock.x, rock.y, SUN.x, SUN.y);
        if (dSun < ROCKS.burnAt) {
          rock.burning += dt;
          particles.rockBurn(rock.x, rock.y, rock.vx, rock.vy);
          rock.r -= 6 * dt;
          if (rock.r < 4 || dSun < SUN.killRadius + 4) { rocks.splice(i, 1); continue; }
        }

        // Off screen for good?
        if (rock.x < -80 || rock.x > STAGE.w + 80 || rock.y < -80 || rock.y > STAGE.h + 80) {
          rocks.splice(i, 1);
          continue;
        }

        // Hit the comet?
        if (comet.alive && comet.invuln <= 0 && dist(rock.x, rock.y, comet.x, comet.y) < rock.r + COMET_HIT_PAD) {
          rocks.splice(i, 1);
          onHit(ROCKS.damage, rock.x, rock.y);
        }
      }
    },

    draw(ctx) {
      for (const rock of rocks) {
        ctx.save();
        ctx.translate(rock.x, rock.y);
        ctx.rotate(rock.rot);
        ctx.beginPath();
        for (let i = 0; i < rock.verts.length; i++) {
          const a = (i / rock.verts.length) * TAU;
          const rr = rock.r * rock.verts[i];
          if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath();
        if (rock.burning > 0) {
          ctx.fillStyle = '#c9714a';
          ctx.shadowColor = COLORS.flare;
          ctx.shadowBlur = 18;
        } else {
          ctx.fillStyle = '#241d3d';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = COLORS.rock;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    },

    clear() { rocks = []; timer = ROCKS.firstAt; },
    get count() { return rocks.length; },
  };
}

const COMET_HIT_PAD = 6;

// HUD: hull and heat bars, the fuel gauge, score with its multiplier, the
// current night and orbit count. Drawn in the canvas so screenshots carry it all.

import { STAGE, COMET, COLORS, NIGHTS } from './config.js';
import { fmt, clamp } from './utils.js';

function bar(ctx, x, y, w, h, frac, color, label) {
  ctx.fillStyle = 'rgba(10, 8, 30, 0.65)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * clamp(frac, 0, 1), h);
  ctx.strokeStyle = 'rgba(205, 214, 255, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w, h);
  ctx.fillStyle = COLORS.hud;
  ctx.font = '600 10px "Avenir Next", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 4);
}

export function drawHud(ctx, game) {
  const { comet, score, mult, orbits, level, time } = game;

  // Top-left: hull and heat.
  bar(ctx, 18, 22, 150, 9, game.comet.hull / game.comet.hullMax,
    game.comet.hull > 35 ? COLORS.good : COLORS.danger, 'HULL');
  bar(ctx, 18, 46, 150, 7, game.comet.heat / 100,
    game.comet.heat > 78 ? COLORS.danger : COLORS.sunMid, 'HEAT');

  // Hunter tally, once the hunt is on.
  if (game.kills > 0) {
    ctx.textAlign = 'left';
    ctx.font = '700 12px "Avenir Next", system-ui, sans-serif';
    ctx.fillStyle = COLORS.danger;
    ctx.fillText(`HUNTERS DOWN  ${game.kills}`, 18, 84);
  }

  // Bottom-left: fuel.
  bar(ctx, 18, STAGE.h - 30, 150, 8, game.comet.fuel / game.comet.fuelMax, '#6ea8ff', 'FUEL');

  // Top-right: score block.
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hud;
  ctx.font = '700 26px "Avenir Next", system-ui, sans-serif';
  ctx.fillText(fmt(score), STAGE.w - 20, 40);
  ctx.font = '600 13px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = mult > 1 ? COLORS.dust : 'rgba(205, 214, 255, 0.6)';
  ctx.fillText(`×${mult} MULTIPLIER`, STAGE.w - 20, 58);
  ctx.fillStyle = 'rgba(205, 214, 255, 0.6)';
  const night = NIGHTS[Math.min(game.night, NIGHTS.length - 1)];
  ctx.fillText(`NIGHT ${game.night + 1} · ${night.name} · ORBIT ${orbits} · ${Math.floor(time)}s`, STAGE.w - 20, 76);

  // Aim line: a faint guide from the comet toward the pointer while playing.
  if (comet.alive && game.input.state.pointerActive) {
    ctx.save();
    ctx.strokeStyle = 'rgba(157, 243, 255, 0.18)';
    ctx.setLineDash([4, 7]);
    ctx.beginPath();
    ctx.moveTo(comet.x, comet.y);
    ctx.lineTo(game.input.state.px, game.input.state.py);
    ctx.stroke();
    ctx.restore();
  }
}

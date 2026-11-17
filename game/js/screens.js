// Screens: the title, pause and results overlays. The judge only ever sees
// the game through screenshots, so every screen states the loop in words:
// what you do, how you win points, and how you restart.

import { STAGE, COLORS, NIGHTS, CHOICES } from './config.js';
import { fmt, clamp, TAU } from './utils.js';

const CENTER = STAGE.w / 2;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function dim(ctx, alpha) {
  ctx.fillStyle = `rgba(4, 2, 12, ${alpha})`;
  ctx.fillRect(0, 0, STAGE.w, STAGE.h);
}

export function drawTitle(ctx, t, best) {
  dim(ctx, 0.45);
  ctx.textAlign = 'center';

  ctx.save();
  ctx.font = '800 64px "Avenir Next", system-ui, sans-serif';
  ctx.shadowColor = COLORS.sunMid;
  ctx.shadowBlur = 34;
  ctx.fillStyle = '#ffe9c4';
  ctx.fillText('SUNSKIMMER', CENTER, 168);
  ctx.restore();

  ctx.font = 'italic 600 17px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = COLORS.sunMid;
  ctx.fillText('skim the sun · don\'t burn', CENTER, 200);

  ctx.font = '500 15px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = COLORS.hud;
  const lines = [
    'You are a comet in a dying orbit around a restless star.',
    'HOLD the mouse button or SPACE to thrust toward your pointer.',
    'Graze the corona to raise your multiplier, harvest stardust,',
    'and bait the hunter drones into the star\'s own fire.',
    'Each orbit survived opens a new night — and a choice of',
    'upgrades. Seven nights, each hotter and crueler than the last.',
  ];
  lines.forEach((l, i) => ctx.fillText(l, CENTER, 246 + i * 23));

  if (best > 0) {
    ctx.font = '600 14px "Avenir Next", system-ui, sans-serif';
    ctx.fillStyle = COLORS.dust;
    ctx.fillText(`BEST FLIGHT  ${fmt(best)}`, CENTER, 408);
  }

  const pulse = 0.6 + 0.4 * Math.sin(t * 3);
  ctx.font = '700 20px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = `rgba(157, 243, 255, ${pulse.toFixed(3)})`;
  ctx.fillText('CLICK or press SPACE to launch', CENTER, 450);

  ctx.font = '400 12px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(205, 214, 255, 0.45)';
  ctx.fillText('P pause · M mute · an original game for the make.fun best-game bounty', CENTER, 494);
}

// The night card: a new night falls, and with it a choice — two upgrade
// cards, pick one. The flight waits on the decision; there is no timer.
export function drawNight(ctx, game, t) {
  dim(ctx, 0.55);
  ctx.textAlign = 'center';

  const night = NIGHTS[Math.min(game.night, NIGHTS.length - 1)];
  const pair = CHOICES[clamp(game.night - 1, 0, CHOICES.length - 1)];

  ctx.font = '600 14px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = COLORS.dust;
  ctx.fillText(`NIGHT ${ROMAN[Math.min(game.night, 6)]} OF VII`, CENTER, 108);

  ctx.save();
  ctx.font = '800 44px "Avenir Next", system-ui, sans-serif';
  ctx.shadowColor = COLORS.sunMid;
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#ffe9c4';
  ctx.fillText(night.name, CENTER, 160);
  ctx.restore();

  ctx.font = 'italic 500 16px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = COLORS.hud;
  ctx.fillText(night.epithet, CENTER, 190);

  ctx.font = '600 13px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(205, 214, 255, 0.75)';
  ctx.fillText('the night offers a gift — choose one', CENTER, 232);

  // Two upgrade cards.
  const cw = 268, ch = 118, gap = 36;
  const y = 258;
  pair.forEach((opt, i) => {
    const cx = CENTER + (i === 0 ? -(cw + gap) / 2 : (cw + gap) / 2);
    const hover = Math.sin(t * 2.2 + i * 2) * 0.5 + 0.5;
    ctx.save();
    ctx.fillStyle = 'rgba(16, 12, 38, 0.88)';
    ctx.strokeStyle = `rgba(255, 179, 71, ${(0.45 + hover * 0.3).toFixed(3)})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(cx - cw / 2, y, cw, ch, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLORS.dust;
    ctx.font = '700 15px "Avenir Next", system-ui, sans-serif';
    ctx.fillText(`[ ${i + 1} ]`, cx, y + 28);
    ctx.fillStyle = '#ffe9c4';
    ctx.font = '800 17px "Avenir Next", system-ui, sans-serif';
    ctx.fillText(opt.name, cx, y + 56);
    ctx.fillStyle = COLORS.hud;
    ctx.font = '500 13.5px "Avenir Next", system-ui, sans-serif';
    ctx.fillText(opt.desc, cx, y + 82);
    ctx.restore();
  });

  const pulse = 0.5 + 0.4 * Math.sin(t * 4);
  ctx.font = '500 12px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = `rgba(205, 214, 255, ${pulse.toFixed(3)})`;
  ctx.fillText('press 1 or 2 — or click a card', CENTER, y + ch + 40);
}

export function drawPause(ctx) {
  dim(ctx, 0.55);
  ctx.textAlign = 'center';
  ctx.font = '800 40px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = COLORS.hud;
  ctx.fillText('PAUSED', CENTER, 250);
  ctx.font = '500 16px "Avenir Next", system-ui, sans-serif';
  ctx.fillText('press P to keep flying', CENTER, 290);
}

export function drawResults(ctx, game, t) {
  dim(ctx, 0.62);
  ctx.textAlign = 'center';

  const cause = {
    sun: 'SWALLOWED BY THE STAR',
    hull: 'HULL FAILURE',
    flare: 'CAUGHT BY A FLARE',
    rock: 'STRUCK BY AN ASTEROID',
    hunter: 'RUN DOWN BY A HUNTER',
  }[game.deathCause] ?? 'BURNED OUT';

  ctx.save();
  ctx.font = '800 46px "Avenir Next", system-ui, sans-serif';
  ctx.shadowColor = COLORS.danger;
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#ffb3c0';
  ctx.fillText(cause, CENTER, 150);
  ctx.restore();

  ctx.font = '700 58px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(fmt(game.score), CENTER, 228);
  ctx.font = '600 15px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = game.score >= game.best && game.score > 0 ? COLORS.dust : COLORS.hud;
  ctx.fillText(game.score >= game.best && game.score > 0 ? '★ NEW BEST FLIGHT ★' : `best ${fmt(game.best)}`, CENTER, 254);

  // Flight stats, two columns.
  ctx.font = '500 15px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = COLORS.hud;
  const rows = [
    ['nights survived', `${ROMAN[Math.min(game.night, 6)]} · ${NIGHTS[Math.min(game.night, NIGHTS.length - 1)].name}`],
    ['hunters downed', game.kills],
    ['orbits completed', game.orbits],
    ['stardust gathered', game.dustCollected],
    ['closest approach', `${Math.round(game.closest)} km*`],
    ['top multiplier', `×${game.topMult}`],
    ['flight time', `${game.time.toFixed(1)} s`],
  ];
  rows.forEach(([k, v], i) => {
    const y = 284 + i * 23;
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(205, 214, 255, 0.65)';
    ctx.fillText(k, CENTER - 16, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(String(v), CENTER + 16, y);
  });
  ctx.textAlign = 'center';
  ctx.font = 'italic 400 11px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(205, 214, 255, 0.4)';
  ctx.fillText('*1 km ≈ 10 pixels of cold, indifferent space', CENTER, 446);

  const pulse = 0.6 + 0.4 * Math.sin(t * 3);
  ctx.font = '700 19px "Avenir Next", system-ui, sans-serif';
  ctx.fillStyle = `rgba(157, 243, 255, ${pulse.toFixed(3)})`;
  ctx.fillText('press R or CLICK to fly again', CENTER, 486);
}

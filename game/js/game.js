// The game orchestrator: the state machine (title → playing → paused →
// results), the scoring (dust, grazes, orbits, multiplier), the escalating
// level, camera shake, and the glue between sun, comet, hazards and motes.

import { SUN, SCORE, COMET, STAGE, NIGHTS } from './config.js';
import { createSun } from './sun.js';
import { createComet } from './comet.js';
import { createHazards } from './hazards.js';
import { createPickups } from './pickups.js';
import { createParticles } from './particles.js';
import { createStarfield } from './starfield.js';
import { drawHud } from './hud.js';
import { drawTitle, drawPause, drawResults, drawNight } from './screens.js';
import { clamp, fmt } from './utils.js';

const BEST_KEY = 'sunskimmer-best';

export function createGame(input, audio) {
  const sun = createSun();
  const particles = createParticles();
  const starfield = createStarfield();
  const hazards = createHazards();
  const pickups = createPickups();

  const game = {
    scene: 'title',       // title | playing | night | paused | results
    t: 0,                 // wall clock for ambient animation
    time: 0,              // seconds of this run
    score: 0,
    mult: 1,
    orbits: 0,
    level: 1,
    night: 0,             // index into NIGHTS; rises with completed orbits
    nightT: 0,            // seconds left on the night card
    dustCollected: 0,
    topMult: 1,
    closest: Infinity,    // nearest pass to the sun, px
    best: Number(localStorage.getItem(BEST_KEY) || 0),
    deathCause: null,
    shake: 0,
    comet: createComet(),
    grazeArmed: true,     // a graze counts once per pass into the band
    grazeFlash: 0,
    input, audio,
    sun, particles, hazards, pickups,
  };

  const reset = () => {
    game.time = 0;
    game.score = 0;
    game.mult = 1;
    game.orbits = 0;
    game.level = 1;
    game.night = 0;
    game.nightT = 0;
    game.dustCollected = 0;
    game.topMult = 1;
    game.closest = Infinity;
    game.deathCause = null;
    game.shake = 0;
    game.grazeArmed = true;
    game.comet = createComet();
    particles.clear();
    hazards.clear();
    pickups.reset();
  };

  const addScore = (base) => {
    const pts = base * game.mult;
    game.score += pts;
    return pts;
  };

  const bumpMult = () => {
    game.mult = Math.min(SCORE.multMax, game.mult + 1);
    game.topMult = Math.max(game.topMult, game.mult);
  };

  const die = (cause) => {
    if (!game.comet.alive) return;
    game.comet.alive = false;
    game.deathCause = cause;
    game.shake = 14;
    audio.setThrust(false);
    audio.burnOut();
    particles.explosion(game.comet.x, game.comet.y);
    game.best = Math.max(game.best, game.score);
    localStorage.setItem(BEST_KEY, String(game.best));
    game.scene = 'results';
  };

  const damage = (amount, cause, x, y) => {
    if (game.comet.invuln > 0 || !game.comet.alive) return;
    game.comet.hull -= amount;
    game.comet.invuln = COMET.hitInvuln;
    game.mult = 1; // a hit resets the multiplier
    game.shake = 9;
    audio.hit();
    particles.explosion(x ?? game.comet.x, y ?? game.comet.y);
    if (game.comet.hull <= 0) die(cause);
  };

  // --- public controls -------------------------------------------------

  game.start = () => {
    reset();
    game.scene = 'playing';
    audio.unlock();
    audio.start();
  };

  // --- per-frame ---------------------------------------------------------

  game.update = (dt) => {
    game.t += dt;
    starfield.update(dt);

    if (game.scene === 'title') {
      if (input.took('__click__') || input.took(' ')) game.start();
      return;
    }

    if (game.scene === 'results') {
      particles.update(dt);
      if (input.took('r') || input.took('__click__') || input.took(' ')) game.start();
      return;
    }

    if (input.took('p') || input.took('escape')) {
      game.scene = game.scene === 'paused' ? 'playing' : 'paused';
      audio.setThrust(false);
    }
    if (input.took('m')) audio.toggleMute();
    if (game.scene === 'paused') return;

    // Night card: a short breather between nights, world holds its breath.
    if (game.scene === 'night') {
      game.nightT -= dt;
      particles.update(dt);
      if (game.nightT <= 0 || input.took('__click__') || input.took(' ')) {
        game.scene = 'playing';
      }
      return;
    }

    // --- playing ---
    game.time += dt;
    const comet = game.comet;
    const mods = NIGHTS[Math.min(game.night, NIGHTS.length - 1)];
    comet.heatMul = mods.heat;

    const event = comet.update(dt, input, particles);
    audio.setThrust(comet.thrusting && comet.alive);

    if (event === 'sun') die('sun');
    else if (event === 'hull') die('hull');
    else if (event === 'orbit') {
      game.orbits = comet.orbits;
      game.level = 1 + Math.floor(comet.orbits / 2);
      addScore(SCORE.orbit);
      bumpMult();
      audio.orbit(game.level);
      // A completed orbit opens the next night.
      const newNight = Math.min(game.orbits, NIGHTS.length - 1);
      if (newNight > game.night) {
        game.night = newNight;
        game.scene = 'night';
        game.nightT = 2.8;
        audio.setThrust(false);
      }
    }

    if (!comet.alive) { particles.update(dt); return; }

    // Graze: fast pass through the band around the burn zone.
    const d = comet.sunDist();
    game.closest = Math.min(game.closest, d);
    const inBand = d >= SUN.grazeBand[0] && d <= SUN.grazeBand[1];
    if (inBand && game.grazeArmed && comet.speed() > SCORE.grazeSpeedMin) {
      game.grazeArmed = false;
      game.grazeFlash = 0.6;
      addScore(SCORE.graze);
      bumpMult();
      audio.graze(game.mult);
      particles.grazeStreak(comet.x, comet.y, comet.vx, comet.vy);
    }
    if (!inBand && d > SUN.grazeBand[1] + 30) game.grazeArmed = true;
    if (game.grazeFlash > 0) game.grazeFlash -= dt;

    // The sun's flares, tempered by the night.
    const sunEvent = sun.update(dt, game.level, Math.atan2(comet.y - SUN.y, comet.x - SUN.x), mods);
    if (sunEvent === 'flare-telegraph') audio.warn();
    if (sun.beamHits(comet.x, comet.y) && comet.invuln <= 0) {
      damage(SCORE ? 24 : 24, 'flare');
    }

    // Asteroids, likewise.
    hazards.update(dt, game.level, comet, particles, (dmg, x, y) => damage(dmg, 'rock', x, y), mods);

    // Stardust, worth more on the cruel nights.
    pickups.update(dt, comet, (x, y) => {
      addScore(Math.round(SCORE.dust * mods.dust));
      game.dustCollected += 1;
      audio.pickup(game.mult);
      particles.sparkle(x, y);
    });

    particles.update(dt);
    if (game.shake > 0) game.shake = Math.max(0, game.shake - dt * 18);
  };

  game.draw = (ctx) => {
    ctx.clearRect(0, 0, STAGE.w, STAGE.h);

    // Camera shake.
    const sx = game.shake ? (Math.random() - 0.5) * game.shake : 0;
    const sy = game.shake ? (Math.random() - 0.5) * game.shake : 0;
    ctx.save();
    ctx.translate(sx, sy);

    starfield.draw(ctx, game.t, sx, sy);
    sun.draw(ctx, game.t);
    pickups.draw(ctx);
    hazards.draw(ctx);
    game.comet.draw(ctx);
    particles.draw(ctx);

    // Graze flash ring.
    if (game.grazeFlash > 0) {
      const k = game.grazeFlash / 0.6;
      ctx.strokeStyle = `rgba(255, 215, 106, ${(k * 0.8).toFixed(3)})`;
      ctx.lineWidth = 2 + 3 * k;
      ctx.beginPath();
      ctx.arc(game.comet.x, game.comet.y, 14 + (1 - k) * 42, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    if (game.scene === 'playing' || game.scene === 'paused' || game.scene === 'night') drawHud(ctx, game);
    if (game.scene === 'title') drawTitle(ctx, game.t, game.best);
    if (game.scene === 'paused') drawPause(ctx);
    if (game.scene === 'night') drawNight(ctx, game, game.t);
    if (game.scene === 'results') drawResults(ctx, game, game.t);

    // Vignette on top of everything.
    const v = ctx.createRadialGradient(
      STAGE.w / 2, STAGE.h / 2, STAGE.h * 0.45,
      STAGE.w / 2, STAGE.h / 2, STAGE.h * 0.95,
    );
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(2,1,8,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, STAGE.w, STAGE.h);
  };

  pickups.reset();
  return game;
}

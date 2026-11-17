// Dev screenshots. `?shot=<name>` poses the real game into a representative
// moment so captures for the bounty dossier show actual gameplay, not mockups.
// Everything here drives the same update/draw path a player would hit —
// no drawing happens outside the normal renderer.

import { SUN, COMET } from './config.js';

// Advance the simulation with a scripted input for `seconds`, in fixed steps.
function simulate(game, input, seconds, script = () => {}) {
  const step = 1 / 60;
  for (let t = 0; t < seconds; t += step) {
    script(t, input.state);
    game.update(step);
    input.endFrame();
  }
  input.state.thrust = false;
}

// Put the comet on a fast low orbit: distance `d` from the sun, moving
// tangentially at `speed`.
function placeOnOrbit(game, d, speed, angle = -0.6) {
  const c = game.comet;
  c.x = SUN.x + Math.cos(angle) * d;
  c.y = SUN.y + Math.sin(angle) * d;
  // Tangential velocity, counter-clockwise.
  c.vx = -Math.sin(angle) * speed;
  c.vy = Math.cos(angle) * speed;
  c.lastAngle = Math.atan2(c.y - SUN.y, c.x - SUN.x);
  c.orbitProgress = 0;
}

export function applyDevShot(game, input, audio) {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot) return;

  // Freeze the rAF loop so captures are deterministic; captures pump manually.
  window.__sunskimmerFreeze = true;

  if (shot === 'title') {
    // Let the ambient title animation settle; nothing else to stage.
    game.best = Math.max(game.best, 4820);
    simulate(game, input, 1.2);
    return;
  }

  if (shot === 'play' || shot === 'graze' || shot === 'over' || shot === 'night') {
    game.start();
    audio.setThrust(false); // headless captures shouldn't hum

    // A mid-run scoreline worth showing.
    game.time = 74;
    game.score = shot === 'over' ? 3915 : 2480;
    game.mult = shot === 'graze' ? 5 : 3;
    game.topMult = Math.max(game.topMult, game.mult);
    game.orbits = 4;
    game.level = 3;
    game.night = shot === 'play' ? 1 : shot === 'graze' ? 3 : 4;
    game.dustCollected = 21;
    game.comet.orbits = 4;
    game.comet.fuel = 68;

    if (shot === 'play') {
      placeOnOrbit(game, 235, 225, 1.8); // near-circular; ends mid-left after the burn
      // Brief prograde burn so the trail arcs and the exhaust plume shows,
      // short enough that the comet stays near its orbit.
      simulate(game, input, 0.9, (t, s) => {
        const c = game.comet;
        s.thrust = t > 0.15;
        s.px = c.x + c.vx * 0.35 - (c.x - SUN.x) * 0.1; // ahead and slightly in
        s.py = c.y + c.vy * 0.35 - (c.y - SUN.y) * 0.1;
      });
      // Keep the burn lit through the capture frames.
      const c = game.comet;
      input.state.thrust = true;
      input.state.px = c.x + c.vx * 0.35;
      input.state.py = c.y + c.vy * 0.35;
      game.grazeArmed = true;
      return;
    }

    if (shot === 'graze') {
      placeOnOrbit(game, 105, 330); // deep in the graze band, at band speed
      game.comet.heat = 64;
      game.closest = 96;
      // One short pass through the band to fire the graze flash and streaks.
      simulate(game, input, 0.32);
      game.grazeFlash = Math.max(game.grazeFlash, 0.5);
      game.comet.heat = 71;
      return;
    }

    if (shot === 'night') {
      placeOnOrbit(game, 235, 225, 1.8);
      game.orbits = 1;
      game.comet.orbits = 1;
      game.time = 41;
      game.score = 1240;
      simulate(game, input, 0.8);
      // Freeze on the night card for NIGHT II.
      game.night = 1;
      game.scene = 'night';
      game.nightT = 2.8;
      return;
    }

    if (shot === 'over') {
      placeOnOrbit(game, 150, 60); // far too slow: the star pulls it in
      game.closest = 88;
      game.topMult = 6;
      simulate(game, input, 2.0);
      if (game.scene !== 'results') {
        // Guarantee the scene even if the dive drifted wide.
        game.comet.x = SUN.x + 30;
        game.comet.y = SUN.y;
        simulate(game, input, 0.2);
      }
      // Let the explosion bloom, then freeze on the results card.
      simulate(game, input, 1.1);
      return;
    }
  }
}

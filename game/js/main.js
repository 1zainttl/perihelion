// Boot: wire the canvas, input and audio into the game, then run the loop.
// The stage is a fixed 960x540 world; the backing store scales with the
// device pixel ratio so lines stay crisp on retina screens, and CSS letter-
// boxes it into the window.

import { STAGE } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createGame } from './game.js';
import { applyDevShot } from './devshot.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = STAGE.w * dpr;
canvas.height = STAGE.h * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

const input = createInput(canvas);
const audio = createAudio();
const game = createGame(input, audio);

// ?shot=title|play|graze|over poses the game for screenshots. Only reachable
// by hand-editing the URL; normal play never touches it.
applyDevShot(game, input, audio);

// Debug/capture handle: hidden tabs don't fire rAF, so expose a manual pump.
window.__perihelion = {
  game,
  pump(seconds = 1 / 60) {
    const step = 1 / 60;
    for (let t = 0; t < seconds; t += step) {
      game.update(step);
      input.endFrame();
    }
    game.draw(ctx);
  },
};

let last = performance.now();
function frame(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 1 / 20) dt = 1 / 20; // tab was hidden: don't teleport the comet
  game.update(dt);
  game.draw(ctx);
  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

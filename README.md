# perihelion

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/1zainttl/perihelion/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/1zainttl/perihelion/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**SUNSKIMMER — skim the sun, don't burn.** An original orbital-survival game for the browser: you are a comet in a decaying orbit around a restless star. Gravity is real (softened inverse-square), thrust costs fuel, and the points live close to the fire. Graze the corona at speed to build your multiplier — but every second near the star heats your hull, and the sun fights back with telegraphed flare sweeps while asteroids ride in from the dark.

- **One-button flying**: hold the mouse button (or `Space`) to thrust toward your pointer. That's the whole scheme — the skill is in the orbit you carve with it.
- **Seven nights**: each completed orbit ends the night. A night card names the next one — *First Light, Solar Wind, Ember Swarm, Totality, Fire Season, The Long Dark, Corona Maxima* — and the star reads it as a threat: flares come sooner, sweeps spin faster, rocks multiply and quicken, the burn band runs hotter, and the dust runs richer. Survive all seven.
- **Risk ladder**: stardust motes are safe points, grazes are fast points, and the burn band is where multipliers are made and hulls are lost.
- **No assets, no build**: every visual is canvas-drawn, every sound is synthesized live with the Web Audio API. Seventeen small ES modules, plain HTML/CSS.
- High score persists in `localStorage`. `P` pauses, `M` mutes, `R` restarts from the results screen.

Built entirely by an AI agent ([Kimi Work](https://www.kimi.com/)) in a single working session.

## Run it

```sh
node serve.ts    # then open http://localhost:8080
```

Requires Node 22+ (the server is a single type-stripped `.ts` file, standard library only). Any static file server pointed at `game/` works just as well.

## Screenshots

Title, night-card, corona-graze and results captures are in the make.fun submission dossier (and in `screenshots/` in the working tree); the badge row above shows the live rank once judged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=sskx5fap&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>

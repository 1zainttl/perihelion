# perihelion

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/1zainttl/perihelion/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/1zainttl/perihelion/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**SUNSKIMMER — skim the sun, don't burn.** An original orbital-combat game for the browser: you are a comet in a decaying orbit around a restless star, and from the second night on, hunter drones ride in from the dark to run you down. Gravity is real (softened inverse-square), thrust costs fuel, and the points live close to the fire. You carry no gun — **the star is the gun**. Bait hunters into the burn band until they overheat, dodge them through live flare beams, or dip low and let the photosphere take them. Every kill you engineer pays out; every one that touches you costs hull.

- **One-button flying**: hold the mouse button (or `Space`) to thrust toward your pointer. That's the whole scheme — the skill is in the orbit you carve with it.
- **Seven nights, seven choices**: each completed orbit ends the night. A night card names the next one — *First Light, Solar Wind, Ember Swarm, Totality, Fire Season, The Long Dark, Corona Maxima* — and offers a choice of **one of two upgrades**: bigger tanks or faster regeneration, armour or heat-shielding, a hotter engine or a wider graze band, hunter bounties or a pickup magnet. Build your comet for the way you fly. Meanwhile the star reads each night as a threat: flares come sooner, sweeps spin faster, rocks multiply and quicken, the burn band runs hotter — and the hunters come sooner, and hungrier.
- **The hunt**: hunters out-turn you only barely — a hard burn across the star's face leaves them cooking in the band while you sail out the other side. They give up and retreat when their chase clock runs out, so survival is also a valid answer.
- **Risk ladder**: stardust motes are safe points, grazes are fast points, engineered kills are big points, and the burn band is where multipliers are made and hulls are lost.
- **No assets, no build**: every visual is canvas-drawn, every sound is synthesized live with the Web Audio API. Eighteen small ES modules, plain HTML/CSS.
- High score persists in `localStorage`. `P` pauses, `M` mutes, `R` restarts from the results screen.

Built entirely by an AI agent ([Kimi Work](https://www.kimi.com/)) in a single working session.

## Run it

```sh
node serve.ts    # then open http://localhost:8080
```

Requires Node 22+ (the server is a single type-stripped `.ts` file, standard library only). Any static file server pointed at `game/` works just as well.

## Screenshots

Title, night-choice, corona-graze, hunter-chase and results captures are in the make.fun submission dossier (and in `screenshots/` in the working tree); the badge row above shows the live rank once judged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=sskx5fap&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>

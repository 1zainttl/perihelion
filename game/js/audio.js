// Audio: every sound is synthesized live with the Web Audio API — no samples,
// no files. A soft drone sits under the run, the thrust is filtered noise, and
// pickups, grazes, warnings and the final burn-out are little FM envelopes.

export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = false;
  let thrustNode = null;
  let drone = null;

  const ensure = () => {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    } catch {
      return false;
    }
    return true;
  };

  const now = () => ctx.currentTime;

  // One enveloped oscillator voice.
  const blip = ({ type = 'sine', from = 440, to = from, t = 0.18, vol = 0.2, delay = 0 }) => {
    if (!ctx || muted) return;
    const t0 = now() + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + t);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + t + 0.05);
  };

  const noiseBurst = ({ t = 0.5, vol = 0.4, from = 1200, to = 120, delay = 0 }) => {
    if (!ctx || muted) return;
    const t0 = now() + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * t));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(from, t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(to, 20), t0 + t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
    src.connect(filter).connect(gain).connect(master);
    src.start(t0);
  };

  return {
    // Browsers unlock audio on the first gesture; call from the start click.
    unlock() {
      if (!ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (!drone) {
        drone = ctx.createGain();
        drone.gain.value = 0.05;
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        o1.type = 'sine'; o1.frequency.value = 55;
        o2.type = 'sine'; o2.frequency.value = 55.7; // slow beating
        o1.connect(drone); o2.connect(drone);
        drone.connect(master);
        o1.start(); o2.start();
      }
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.55;
      return muted;
    },
    get muted() { return muted; },

    setThrust(on) {
      if (!ctx || muted) on = false;
      if (on && !thrustNode) {
        const len = ctx.sampleRate;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 320; filter.Q.value = 0.8;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now());
        gain.gain.exponentialRampToValueAtTime(0.16, now() + 0.08);
        src.connect(filter).connect(gain).connect(master);
        src.start();
        thrustNode = { src, gain };
      } else if (!on && thrustNode) {
        const { src, gain } = thrustNode;
        thrustNode = null;
        gain.gain.setTargetAtTime(0.0001, now(), 0.05);
        src.stop(now() + 0.3);
      }
    },

    pickup(mult) {
      const base = 520 * Math.pow(1.06, Math.min(mult, 9));
      blip({ type: 'triangle', from: base, to: base * 1.5, t: 0.12, vol: 0.16 });
      blip({ type: 'sine', from: base * 2, t: 0.1, vol: 0.08, delay: 0.04 });
    },
    graze(mult) {
      blip({ type: 'sawtooth', from: 300, to: 620 + mult * 40, t: 0.22, vol: 0.12 });
      blip({ type: 'sine', from: 900, to: 1500, t: 0.18, vol: 0.07, delay: 0.06 });
    },
    orbit(level) {
      [523, 659, 784].forEach((f, i) =>
        blip({ type: 'triangle', from: f, t: 0.16, vol: 0.12, delay: i * 0.07 }));
    },
    warn() {
      blip({ type: 'square', from: 220, to: 180, t: 0.16, vol: 0.1 });
      blip({ type: 'square', from: 220, to: 180, t: 0.16, vol: 0.1, delay: 0.2 });
    },
    hunterWarn() {
      blip({ type: 'square', from: 165, to: 140, t: 0.13, vol: 0.09 });
      blip({ type: 'square', from: 165, to: 140, t: 0.13, vol: 0.09, delay: 0.16 });
    },
    hunterDown() {
      noiseBurst({ t: 0.4, vol: 0.32, from: 1500, to: 110 });
      blip({ type: 'triangle', from: 660, to: 990, t: 0.16, vol: 0.12, delay: 0.03 });
      blip({ type: 'sine', from: 1320, t: 0.12, vol: 0.07, delay: 0.1 });
    },
    pick() {
      blip({ type: 'triangle', from: 440, to: 660, t: 0.12, vol: 0.14 });
      blip({ type: 'triangle', from: 660, to: 880, t: 0.15, vol: 0.12, delay: 0.09 });
    },
    hit() {
      noiseBurst({ t: 0.3, vol: 0.4, from: 900, to: 160 });
      blip({ type: 'sawtooth', from: 160, to: 60, t: 0.3, vol: 0.2 });
    },
    burnOut() {
      noiseBurst({ t: 1.4, vol: 0.55, from: 2400, to: 60 });
      blip({ type: 'sawtooth', from: 220, to: 30, t: 1.2, vol: 0.22 });
      blip({ type: 'sine', from: 110, to: 24, t: 1.6, vol: 0.18, delay: 0.1 });
    },
    start() {
      [392, 523, 659, 880].forEach((f, i) =>
        blip({ type: 'triangle', from: f, t: 0.14, vol: 0.1, delay: i * 0.06 }));
    },
  };
}

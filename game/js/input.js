// Input: pointer position, thrust button, and the one-shot key commands.
// The comet thrusts toward the pointer while the button (or Space) is held,
// so the same scheme works with mouse, trackpad or keyboard.

export function createInput(canvas) {
  const state = {
    px: 480, py: 140,       // pointer position in stage coordinates
    thrust: false,          // pointer or Space currently held
    pressed: new Set(),     // keys handled as one-shot commands
    pointerActive: false,   // a pointer moved at least once
  };

  const toStage = (e) => {
    const r = canvas.getBoundingClientRect();
    // Map to the fixed 960x540 stage, not the (DPR-scaled) backing store.
    state.px = ((e.clientX - r.left) / r.width) * 960;
    state.py = ((e.clientY - r.top) / r.height) * 540;
    state.pointerActive = true;
  };

  canvas.addEventListener('pointermove', toStage);
  canvas.addEventListener('pointerdown', (e) => {
    toStage(e);
    state.thrust = true;
    state.pressed.add('__click__');
    canvas.setPointerCapture?.(e.pointerId);
  });
  const release = () => { state.thrust = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    state.pressed.add(k);
    if (k === ' ') state.thrust = true;
    if ([' ', 'arrowup', 'arrowdown'].includes(k)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === ' ') state.thrust = false;
  });

  return {
    state,
    // Consumes a one-shot press: true exactly once per keydown.
    took(key) {
      if (state.pressed.has(key)) { state.pressed.delete(key); return true; }
      return false;
    },
    endFrame() { state.pressed.clear(); },
  };
}

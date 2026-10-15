// Terminal sounds, synthesized with raw Web Audio (no files). Off by default; the [SND] button turns it on
// (a user gesture, so the AudioContext may start). The choice is remembered in this browser only.
let ctx = null;
let master = null;
let on = false;
try { on = localStorage.getItem('ph-snd') === 'on'; } catch {}
const listeners = new Set();

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.32;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const sound = {
  get on() { return on; },
  set(v) {
    on = !!v;
    try { localStorage.setItem('ph-snd', on ? 'on' : 'off'); } catch {}
    if (on) ensure();
    listeners.forEach((f) => f(on));
  },
  onChange(f) { listeners.add(f); },
  // The first gesture after load wakes the context if sound was left on last visit.
  wake() { if (on) ensure(); },
};

function env(g, t, a, d, peak) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function tone(type, freq, dur, peak = 0.3, when = 0, slideTo) {
  if (!on || !ensure() || ctx.state !== 'running') return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  env(g, t, 0.004, dur, peak);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}
let noiseBuf = null;
function noise(dur, peak, freq = 3000, q = 0.8, when = 0) {
  if (!on || !ensure() || ctx.state !== 'running') return;
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + when;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  env(g, t, 0.002, dur, peak);
  s.connect(f).connect(g).connect(master);
  s.start(t, Math.random() * 0.3);
  s.stop(t + dur + 0.05);
}

let lastKey = 0;
export const sfx = {
  key() { const n = performance.now(); if (n - lastKey < 45) return; lastKey = n; noise(0.03, 0.22, 2600 + Math.random() * 1600, 1.4); },
  beep() { tone('square', 880, 0.08, 0.12); },
  boot() { tone('square', 660, 0.07, 0.1); tone('square', 990, 0.1, 0.1, 0.09); },
  bell() { tone('sine', 1318, 0.6, 0.22); tone('sine', 1975, 0.4, 0.08, 0.01); },
  attn() { tone('square', 740, 0.06, 0.1); tone('square', 740, 0.06, 0.1, 0.12); },
  degauss() { tone('sawtooth', 120, 0.7, 0.25, 0, 40); noise(0.5, 0.25, 400, 0.6); tone('sine', 60, 0.9, 0.3); },
  thunk() { tone('sine', 90, 0.25, 0.35, 0, 45); noise(0.08, 0.2, 900, 0.7); },
  hum() { tone('sine', 60, 1.4, 0.06); },
};

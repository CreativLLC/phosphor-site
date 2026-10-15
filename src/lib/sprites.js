// Draws the Phosphor-OS pixel crew (grids exported from the app by tools/sprites.mjs) into small canvases.
// 8 frames a second like the app, only while on screen; a still frame under reduced motion.
import { $$, watch, onTick, motion } from './util.js';

const PAL = [null, [176, 124, 8, 255], [255, 176, 0, 255], [255, 214, 138, 255], [11, 7, 0, 255], null, [63, 224, 255, 255]];

export async function crew() {
  const els = $$('canvas.sprite');
  if (!els.length) return;
  const data = (await import('../sprites.json')).default;
  const decode = (a) => ({ ...a, frames: a.frames.map((b64) => { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }) });
  const anims = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, decode(v)]));
  const cache = new Map();
  const img = (a, i) => {
    const key = a.frames[i];
    let im = cache.get(key);
    if (!im) {
      im = new ImageData(a.w, a.h);
      key.forEach((c, j) => { const p = PAL[c]; if (p) im.data.set(p, j * 4); });
      cache.set(key, im);
    }
    return im;
  };
  const live = new Set();
  const items = els.map((c, n) => {
    const a = anims[c.dataset.sprite] || anims.crew;
    c.width = a.w; c.height = a.h;
    const it = { c, g: c.getContext('2d'), a, off: n * 3, last: -1, kind: c.dataset.sprite };
    watch(c, (on) => (on ? live.add(it) : live.delete(it)), '100px');
    return it;
  });
  const paint = (it, t) => {
    const a = it.a;
    let f = a.still;
    if (!motion.reduced) {
      const k = (Math.floor(t / 125) + it.off) % a.total;
      f = a.ends.findIndex((e) => k < e);
    }
    if (f === it.last) return;
    it.last = f;
    it.g.clearRect(0, 0, a.w, a.h);
    it.g.putImageData(img(a, f), 0, 0);
  };
  items.forEach((it) => paint(it, 0));
  onTick((t) => live.forEach((it) => paint(it, t)));
  return {
    setDone(canvas, done) {
      const it = items.find((x) => x.c === canvas);
      if (!it) return;
      it.a = (done ? anims[`${it.kind}Done`] : anims[it.kind]) || anims.crew;
      it.last = -1;
      paint(it, performance.now());
    },
  };
}

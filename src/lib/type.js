// Kinetic type on the CRT clock: decode/scramble and a typewriter. Visual only: headings keep their real text
// for assistive tech (an aria-label is set before the letters are scrambled).
import { onTick, motion } from './util.js';
import { sfx } from './sound.js';

const GLYPHS = '#$%&*+<>/\\=?@[]{}01_ABCDEFHKLMNPRSTUVXZ';
const running = new WeakMap();

// Decode el's text from noise to `text` over `ticks` ticks (left to right).
export function scramble(el, text = el.textContent, ticks = 10) {
  if (!el) return Promise.resolve();
  running.get(el)?.();
  if (motion.reduced) { el.textContent = text; return Promise.resolve(); }
  return new Promise((done) => {
    let n = 0;
    const len = text.length;
    const off = onTick(() => {
      n++;
      const k = Math.floor((n / ticks) * len);
      let s = '';
      for (let i = 0; i < len; i++) {
        const ch = text[i];
        s += i < k || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = s;
      if (n >= ticks) { el.textContent = text; stop(); done(); }
    });
    const stop = () => { off(); running.delete(el); };
    running.set(el, () => { stop(); el.textContent = text; done(); });
  });
}

// Type `text` into el, `cps` chars per tick. Resolves when finished.
export function typeInto(el, text, perTick = 1, sound = true) {
  running.get(el)?.();
  if (motion.reduced) { el.textContent = text; return Promise.resolve(); }
  return new Promise((done) => {
    let i = 0;
    el.textContent = '';
    const off = onTick(() => {
      i = Math.min(text.length, i + perTick);
      el.textContent = text.slice(0, i);
      if (sound) sfx.key();
      if (i >= text.length) { stop(); done(); }
    });
    const stop = () => { off(); running.delete(el); };
    running.set(el, () => { stop(); el.textContent = text; done(); });
  });
}

// Headings: decode once when they first enter the viewport.
export function headings(list) {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target;
    if (motion.reduced) return;
    const text = el.textContent;
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', text);
    // scramble each text node separately would break markup; headings here are plain text
    scramble(el, text, Math.min(14, 6 + Math.round(text.length / 6)));
  }), { rootMargin: '0px 0px -12% 0px' });
  list.forEach((h) => io.observe(h));
}

// Shared helpers: reduced-motion state (live), visibility, a 12 fps tick clock, small timing utils.
const mq = matchMedia('(prefers-reduced-motion: reduce)');
const subs = new Set();
export const motion = {
  get reduced() { return mq.matches; },
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
};
const sync = () => { document.documentElement.classList.toggle('is-reduced', mq.matches); subs.forEach((f) => f(mq.matches)); };
mq.addEventListener?.('change', sync);
sync();

export const finePointer = () => matchMedia('(pointer: fine) and (hover: hover)').matches;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const rand = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// Call fn(true/false) when el enters / leaves the viewport (with margin).
export function watch(el, fn, rootMargin = '0px', threshold = 0) {
  if (!('IntersectionObserver' in window)) { fn(true); return () => {}; }
  const io = new IntersectionObserver((es) => es.forEach((e) => fn(e.isIntersecting, e)), { rootMargin, threshold });
  io.observe(el);
  return () => io.disconnect();
}

// The CRT clock: everything that "animates" ticks at 12 fps (one shared timer, sleeps when the tab is hidden).
const tickers = new Set();
let timer = 0;
export const TICK = 1000 / 12;
function run() {
  timer = 0;
  if (document.hidden || !tickers.size) return;
  const t = performance.now();
  tickers.forEach((f) => f(t));
  timer = setTimeout(run, TICK);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && !timer) run(); });
export function onTick(fn) {
  tickers.add(fn);
  if (!timer) timer = setTimeout(run, TICK);
  return () => tickers.delete(fn);
}

// Scroll-linked work, batched into one rAF per frame.
const scrollers = new Set();
let raf = 0;
const frame = () => { raf = 0; scrollers.forEach((f) => f()); };
const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
addEventListener('scroll', kick, { passive: true });
addEventListener('resize', kick, { passive: true });
export function onScroll(fn) { scrollers.add(fn); kick(); return () => scrollers.delete(fn); }

// Progress of an element through the viewport: 0 when its top hits the viewport top, 1 when its bottom does.
export function pinProgress(el) {
  const r = el.getBoundingClientRect();
  const span = r.height - innerHeight;
  return span > 0 ? clamp(-r.top / span) : r.top < 0 ? 1 : 0;
}

export const idle = (fn, timeout = 1500) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200));

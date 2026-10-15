// Page-wide effects: stepped reveals, the status bar (sector, signal ticks, clock), CRT strength + rare pulses,
// the fit-to-width wordmark, the hero tagline cycle and glitch, the exploding layer stack, the afterglow cursor,
// copy buttons and focus-on-anchor.
import { $, $$, watch, motion, onScroll, clamp, finePointer, rand } from './util.js';
import { scramble } from './type.js';
import { nav } from '../content.js';
import { sfx } from './sound.js';

export function reveals() {
  const els = $$('.rv');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
}

export function statusBar() {
  const n = $('.sector-n'), l = $('.sector-l'), ticks = $$('.sig i'), clock = $('.clock');
  const tick = () => { const d = new Date(); clock.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  tick(); setInterval(tick, 15000);
  let cur = '';
  const secs = nav.map((x) => document.getElementById(x.id)).filter(Boolean);
  const set = (id) => {
    if (id === cur) return;
    cur = id;
    const i = nav.findIndex((x) => x.id === id);
    ticks.forEach((t, k) => { t.classList.toggle('on', k < i); t.classList.toggle('cur', k === i); });
    if (i < 0) { const end = scrollY > innerHeight * 2; n.textContent = end ? '//' : '00'; scramble(l, end ? 'END OF LINE' : 'SYSTEM ONLINE', 5); return; }
    n.textContent = nav[i].n === '--' ? '>>' : nav[i].n;
    scramble(l, nav[i].label, 6);
  };
  onScroll(() => {
    const y = innerHeight * 0.4;
    let id = '';
    for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) id = s.id; }
    set(id || (scrollY > innerHeight * 2 ? '~end' : ''));
  });
}

export function crtControls() {
  const h = document.documentElement;
  const btn = $('#crt-btn');
  const order = ['full', 'low', 'off'];
  const set = (v) => {
    h.setAttribute('data-crt', v);
    try { localStorage.setItem('ph-crt', v); } catch {}
    $('b', btn).textContent = v.toUpperCase();
    sfx.beep();
  };
  $('b', btn).textContent = (h.getAttribute('data-crt') || 'full').toUpperCase();
  btn.addEventListener('click', () => set(order[(order.indexOf(h.getAttribute('data-crt')) + 1) % 3]));
  // rare pulses, like the app's crt.ts: a 0.24 s flicker every 5-12 s, the roll band every 15-30 s
  const fx = $('.crt-fx');
  const pulse = (cls, a, b) => setTimeout(() => {
    if (!motion.reduced && !document.hidden && h.getAttribute('data-crt') === 'full') {
      fx.classList.remove(cls); void fx.offsetWidth; fx.classList.add(cls);
    }
    pulse(cls, a, b);
  }, rand(a, b));
  pulse('flick', 5000, 12000);
  pulse('roll', 15000, 30000);
  return set;
}

export function wordmark() {
  const w = $('.wordmark');
  if (!w) return;
  // the size is pure CSS (no layout shift, no late LCP); JS only adds the rare glitch
  // a rare glitch hit, as in the trailer
  const glitch = () => setTimeout(() => {
    if (!motion.reduced && !document.hidden && w.getBoundingClientRect().bottom > 0) { w.classList.remove('glitch'); void w.offsetWidth; w.classList.add('glitch'); }
    glitch();
  }, rand(6000, 13000));
  glitch();
}

export function tagline() {
  const t = $('.tl-text');
  if (!t) return;
  const alts = t.dataset.alts.split('|');
  const h1 = $('#hero-h');
  h1.setAttribute('aria-label', `Phosphor-OS: ${alts[0].toLowerCase().replace(/^./, (c) => c.toUpperCase())}`);
  t.setAttribute('aria-hidden', 'true');
  let i = 0, vis = true;
  watch(t, (on) => (vis = on));
  setInterval(() => {
    if (motion.reduced || !vis || document.hidden || innerWidth < 900) return;
    i = (i + 1) % alts.length;
    scramble(t, alts[i], 10);
  }, 5200);
}

export function layerStack() {
  const st = $('.stack');
  if (!st) return;
  onScroll(() => {
    if (motion.reduced) { st.style.setProperty('--spread', '1'); return; }
    const r = st.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (innerHeight + r.height * 0.4));
    st.style.setProperty('--spread', (0.15 + p * 1.25).toFixed(3));
  });
}

export function afterglow() {
  if (!finePointer()) return;
  const c = document.createElement('canvas');
  c.className = 'trail';
  c.setAttribute('aria-hidden', 'true');
  document.body.append(c);
  const g = c.getContext('2d');
  let pts = [], raf = 0, quiet = 0;
  const size = () => { c.width = innerWidth; c.height = innerHeight; };
  size();
  addEventListener('resize', size);
  const off = () => motion.reduced || document.documentElement.getAttribute('data-crt') === 'off';
  addEventListener('pointermove', (e) => {
    if (off() || e.pointerType !== 'mouse') return;
    pts.push([e.clientX, e.clientY]);
    if (pts.length > 3) pts.shift();
    quiet = 0;
    if (!raf) raf = requestAnimationFrame(draw);
  }, { passive: true });
  function draw() {
    raf = 0;
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = 'rgba(0,0,0,0.16)';
    g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'lighter';
    if (pts.length > 1) {
      g.strokeStyle = 'rgba(255,176,0,0.55)';
      g.shadowColor = 'rgba(255,176,0,0.9)';
      g.shadowBlur = 10;
      g.lineWidth = 2;
      g.lineCap = 'square';
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (const p of pts.slice(1)) g.lineTo(p[0], p[1]);
      g.stroke();
      pts = pts.slice(-1);
    }
    if (++quiet < 40) raf = requestAnimationFrame(draw);
    else g.clearRect(0, 0, c.width, c.height);
  }
}

export function copyButtons() {
  $$('.copy').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'COPIED'; b.classList.add('ok'); sfx.beep(); }
    catch { b.textContent = 'SELECT IT'; }
    setTimeout(() => { b.textContent = 'COPY'; b.classList.remove('ok'); }, 1600);
  }));
}

export function anchorFocus() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || a.classList.contains('cmd-open')) return;
    const id = a.getAttribute('href').slice(1);
    const el = id && document.getElementById(id);
    if (!el) return;
    setTimeout(() => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }, motion.reduced ? 0 : 500);
  });
}

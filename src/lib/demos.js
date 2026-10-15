// Scripted loops for 03 (desktop notifications + bell) and 04 (tabs flipping to done / needs you, AUTO router,
// notifications that wait). Each runs only while on screen; reduced motion shows a finished still state.
import { $, $$, watch, motion, sleep } from './util.js';
import { sfx } from './sound.js';
import { typeInto } from './type.js';
import { beat, os } from '../content.js';

// A cancellable script runner: steps are [delayMs, fn]. Loops while visible.
function loopScript(root, steps, { reset, final, gap = 2400 } = {}) {
  let vis = false, gen = 0;
  async function run() {
    const my = ++gen;
    while (vis && my === gen) {
      reset?.();
      for (const [ms, fn] of steps) {
        await sleep(ms);
        if (!vis || my !== gen) return;
        await fn();
      }
      await sleep(gap);
    }
  }
  const set = (on) => {
    if (motion.reduced) { gen++; final?.(); return; }
    if (on && !vis) { vis = true; run(); }
    else if (!on) { vis = false; gen++; }
  };
  watch(root, set, '0px', 0.2);
  motion.on((r) => { if (r) { gen++; vis = false; final?.(); } });
  if (motion.reduced) final?.();
}

const note = (cls, title, body) => {
  const d = document.createElement('div');
  d.className = cls;
  d.innerHTML = `<b></b><span></span>`;
  d.firstChild.textContent = title;
  d.lastChild.textContent = body;
  return d;
};

export function desktop() {
  const desk = $('.desk');
  if (!desk) return;
  const notes = $('.desk-notes', desk), bellN = $('.dbell-n', desk), bell = $('.dbell', desk);
  const N = os.notes;
  let n = 0;
  const card = (x) => note(x.need ? 'dnote need' : 'dnote', x.t, x.b);
  const push = (x) => {
    notes.append(card(x));
    while (notes.children.length > 3) notes.firstChild.remove();
    bellN.textContent = ++n;
    bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring');
    x.need ? sfx.attn() : sfx.bell();
  };
  loopScript(desk, [
    [900, () => push(N[0])],
    [2200, () => push(N[1])],
    [2600, () => push(N[2])],
  ], {
    reset: () => { notes.textContent = ''; n = 0; bellN.textContent = '0'; },
    final: () => { notes.textContent = ''; N.forEach((x) => notes.append(card(x))); bellN.textContent = String(N.length); },
    gap: 5200,
  });
}

export function comms() {
  const root = $('.comms');
  if (!root) return;
  const tabs = $$('.ctab', root), lines = $('.c-lines', root), stack = $('.c-stack', root), bellN = $('.c-bell-n', root), bell = $('.c-bell', root);
  let n = 0;
  const state = (i, s) => { tabs[i].className = `ctab ${s}`; };
  const ring = () => { bellN.textContent = ++n; bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring'); };
  const notif = (need, t, b) => {
    stack.prepend(note(need ? 'cnote need' : 'cnote', t, b));
    while (stack.children.length > 3) stack.lastChild.remove();
    ring();
    need ? sfx.attn() : sfx.bell();
  };
  async function route(r) {
    const you = document.createElement('p');
    you.className = 'you';
    lines.append(you);
    while (lines.children.length > 6) lines.firstChild.remove();
    await typeInto(you, r.msg, 2);
    await sleep(500);
    const rt = document.createElement('p');
    rt.className = 'rt';
    rt.innerHTML = 'AUTO &rarr; <b></b> &middot; <span class="th"></span> <span class="why"></span>';
    $('b', rt).textContent = r.model;
    $('.th', rt).textContent = r.think;
    $('.why', rt).textContent = `- ${r.why}`;
    lines.append(rt);
    sfx.beep();
  }
  const R = beat.route;
  loopScript(root, [
    [600, () => route(R[0])],
    [700, () => { state(1, 'done'); notif(false, 'DONE', 'Fix flaky tests: 42 tests passing.'); }],
    [1300, () => { state(2, 'attn'); notif(true, 'CLAUDE NEEDS YOU', 'Release notes: approve the publish?'); }],
    [900, () => route(R[1])],
    [800, () => { state(3, 'done'); notif(false, 'DONE', 'Landing page: build is green.'); }],
    [700, () => route(R[2])],
    [1400, () => { state(4, 'attn'); notif(true, 'QUESTION', 'Docs pass: amber or a darker amber?'); }],
    [1800, () => { state(2, 'busy'); }],
  ], {
    reset: () => { tabs.forEach((_, i) => state(i, 'busy')); lines.textContent = ''; stack.textContent = ''; n = 0; bellN.textContent = '0'; },
    final: () => {
      tabs.forEach((_, i) => state(i, ['busy', 'done', 'attn', 'done', 'busy'][i]));
      lines.textContent = '';
      R.forEach((r) => { const y = document.createElement('p'); y.className = 'you'; y.textContent = r.msg; const t = document.createElement('p'); t.className = 'rt'; t.textContent = `AUTO -> ${r.model} . ${r.think} - ${r.why}`; lines.append(y, t); });
      stack.textContent = '';
      stack.append(note('cnote need', 'CLAUDE NEEDS YOU', 'Release notes: approve the publish?'), note('cnote', 'DONE', 'Fix flaky tests: 42 tests passing.'));
      bellN.textContent = '2';
    },
    gap: 3000,
  });
}

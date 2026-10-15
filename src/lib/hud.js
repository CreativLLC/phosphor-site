// 01 SEE EVERYTHING. On wide screens the section pins and the mission panel assembles itself panel by panel
// as you scroll (each one powers on like a tube, its label tag lights, the callout types in). Elsewhere the HUD
// boots in one go when it comes into view. Once on, a scripted demo timeline keeps it live: NOW types, steps
// tick, the context gauge fills, crew members finish, files appear. Fake data only.
import { $, $$, watch, onTick, onScroll, pinProgress, motion, clamp } from './util.js';
import { sfx } from './sound.js';
import { scramble } from './type.js';
import { mission } from '../content.js';

const ORDER = ['now', 'summary', 'steps', 'context', 'crew', 'model', 'plan', 'files'];

function segs(el, pct) {
  const n = Math.round((pct / 100) * 20);
  $$('i', el).forEach((i, k) => {
    i.style.background = k < n ? 'var(--ph)' : '';
    i.style.boxShadow = k < n ? '0 0 4px rgb(255 176 0 / .5)' : '';
  });
}

export function seeEverything(spritesReady) {
  let sprites = null;
  spritesReady?.then((s) => { sprites = s; });
  const sec = $('#see');
  if (!sec) return;
  const pin = $('.see-pin', sec);
  const hud = $('.hud', sec);
  const panels = Object.fromEntries($$('.pn', hud).map((p) => [p.dataset.k, p]));
  const items = $$('.call-list li', sec);
  const ticks = $$('.call-ticks i', sec);
  const count = $('.cc-n', sec);
  const wideMQ = matchMedia('(min-width: 900px) and (min-height: 620px)');
  let pinned = false, idx = -2;

  // ----- live demo state -----
  const el = {
    now: $('.now-t', hud), steps: $$('.steps li', hud), stv: $('.st-v', hud), ctxv: $('.ctx-v', hud), ctxt: $('.ctx-t', hud), ctx: $('.mctx', hud),
    m5: $('.m5h', hud), mw: $('.mwk', hud), v5: $('.v5h', hud), vw: $('.vwk', hud), files: $$('.files li', hud), flv: $('.fl-v', hud),
    crew: $$('.cc', hud), crewv: $('.crew-v', hud), ag: $('.ag-v', hud), pct: $('.pct', hud), prog: $('.prog', hud), chip: $('.stepchip', hud), cur: $('.cur-step', hud), tm: $('.tm', hud),
  };
  const S = { step: 2, ctx: 27, p5: 23, wk: 41, files: 3, sec: 5, nowI: 0, typed: 0, beat: 0, hold: 0 };
  const total = mission.steps.length;

  function paint() {
    el.steps.forEach((li, i) => { li.className = i < S.step ? 'x' : i === S.step ? 'act' : ''; });
    const pct = Math.round((S.step / total) * 100);
    el.stv.textContent = S.step >= total ? `${total}/${total} DONE` : `${S.step}/${total} ${pct}%`;
    el.ctxv.textContent = `${S.ctx}%`; el.ctxt.textContent = `${Math.round(S.ctx * 2)}K`; segs(el.ctx, S.ctx);
    el.v5.textContent = `${S.p5}%`; segs(el.m5, S.p5); el.vw.textContent = `${S.wk}%`; segs(el.mw, S.wk);
    el.files.forEach((li, i) => li.classList.toggle('on', i < S.files));
    el.flv.textContent = S.files;
    const done = Math.max(0, S.step - 2);
    const running = Math.max(0, el.crew.length - done);
    el.crew.forEach((c, i) => {
      const d = i < done;
      if (c.classList.contains('done') !== d) {
        c.classList.toggle('done', d);
        $('.st', c).textContent = d ? '[DONE]' : '[RUNNING]';
        sprites?.setDone($('canvas', c), d);
      }
    });
    el.crewv.textContent = `${running} ACTIVE / 5`;
    el.ag.textContent = `${running} RUNNING / 5`;
    el.pct.textContent = `${pct}%`;
    el.prog.style.setProperty('--p', (S.step / total).toFixed(3));
    el.chip.textContent = S.step >= total ? 'COMPLETE' : `STEP ${S.step + 1}/${total}`;
    el.cur.textContent = S.step >= total ? mission.task.toLowerCase().replace(/^./, (c) => c.toUpperCase()) : mission.steps[S.step];
    el.tm.textContent = `00:${String(S.sec % 60).padStart(2, '0')}`;
  }
  paint();

  let live = false, lastBeat = 0, lastSec = 0;
  function tick(t) {
    if (!live) return;
    if (t - lastSec > 1000) { lastSec = t; S.sec++; el.tm.textContent = `00:${String(S.sec % 60).padStart(2, '0')}`; }
    // typing the NOW line, two characters per tick
    const line = mission.now[S.nowI];
    if (S.typed < line.length) {
      S.typed = Math.min(line.length, S.typed + 2);
      el.now.textContent = line.slice(0, S.typed);
      if (S.typed % 4 === 0) sfx.key();
      return;
    }
    if (t - lastBeat < 2300) return;
    lastBeat = t;
    S.beat++;
    if (S.step >= total) {
      if (++S.hold > 2) Object.assign(S, { step: 0, ctx: 12, p5: 21, wk: 40, files: 0, sec: 0, hold: 0 });
      paint();
      return;
    }
    S.nowI = (S.nowI + 1) % mission.now.length;
    S.typed = 0;
    if (S.beat % 2 === 0) {
      S.step++;
      S.files = Math.min(el.files.length, S.files + 1);
      if (S.files > 0) { const li = el.files[S.files - 1]; li.classList.remove('new'); void li.offsetWidth; li.classList.add('new'); }
    }
    S.ctx = Math.min(68, S.ctx + 4);
    S.p5 = Math.min(40, S.p5 + 1);
    paint();
  }
  onTick(tick);
  const setLive = (v) => { live = v && !motion.reduced; };
  watch(hud, setLive, '0px', 0.1);
  motion.on(() => setLive(true));

  // ----- leader line from the callout to the hot panel (pinned mode only) -----
  const stage = $('.see-stage', sec);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'leader');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path d=""/><rect width="7" height="7"/>';
  stage.append(svg);
  function leader() {
    const path = svg.firstChild, dot = svg.lastChild;
    if (!pinned || idx < 0 || idx > 7) { svg.style.opacity = '0'; return; }
    const S0 = stage.getBoundingClientRect();
    const P = panels[ORDER[idx]].getBoundingClientRect();
    const L = $('.chip', items[idx]).getBoundingClientRect();
    const x1 = L.left - S0.left - 12, y1 = L.top + L.height / 2 - S0.top;
    const x2 = P.right - S0.left, y2 = P.top + Math.min(P.height / 2, 28) - S0.top;
    const mx = x2 + Math.max(18, (x1 - x2) * 0.4);
    svg.setAttribute('viewBox', `0 0 ${S0.width} ${S0.height}`);
    path.setAttribute('d', `M${x1} ${y1} H${mx} V${y2} H${x2 + 4}`);
    dot.setAttribute('x', x2 + 1); dot.setAttribute('y', y2 - 3.5);
    svg.style.opacity = '1';
    svg.classList.remove('draw'); void svg.getBoundingClientRect(); svg.classList.add('draw');
  }
  addEventListener('resize', () => leader());

  // ----- assembly -----
  function setIdx(i, quiet) {
    if (i === idx) return;
    const prev = idx;
    idx = i;
    ORDER.forEach((k, n) => {
      const p = panels[k];
      const on = n <= i || i >= 8;
      if (on !== p.classList.contains('on')) p.classList.toggle('on', on);
      p.classList.toggle('hot', n === i);
    });
    items.forEach((li, n) => li.classList.toggle('on', n === Math.min(i, 7) && i >= 0));
    ticks.forEach((tk, n) => tk.classList.toggle('on', n <= i));
    count.textContent = String(clamp(i + 1, 0, 8)).padStart(2, '0');
    leader();
    if (i >= 0 && i < 8 && !quiet) {
      if (i > prev) sfx.beep();
      const chip = $('.chip', items[i]);
      scramble(chip, chip.textContent, 6);
      const tag = $('.pn-tag', panels[ORDER[i]]);
      scramble(tag, tag.textContent, 6);
    }
  }

  function onPin() {
    if (!pinned) return;
    const p = pinProgress(pin);
    const i = p < 0.05 ? -1 : p > 0.94 ? 8 : Math.min(7, Math.floor(((p - 0.05) / 0.86) * 8));
    setIdx(i);
  }

  let booted = false;
  function bootOnce() {
    if (booted || pinned || motion.reduced) return;
    booted = true;
    sec.classList.add('assemble');
    let n = 0;
    const off = onTick(() => {
      if (n % 2 === 0) panels[ORDER[n / 2]]?.classList.add('on');
      n++;
      if (n > ORDER.length * 2) { off(); sec.classList.remove('assemble'); }
    });
  }

  function mode() {
    const want = wideMQ.matches && !motion.reduced;
    if (want === pinned) return;
    pinned = want;
    sec.classList.toggle('pinned', pinned);
    sec.classList.toggle('assemble', pinned);
    if (pinned) { idx = -2; onPin(); }
    else { $$('.pn', hud).forEach((p) => p.classList.remove('hot')); items.forEach((li) => li.classList.remove('on')); }
  }
  wideMQ.addEventListener?.('change', mode);
  motion.on(mode);
  mode();
  onScroll(onPin);
  watch(hud, (on) => on && bootOnce(), '0px', 0.25);
}

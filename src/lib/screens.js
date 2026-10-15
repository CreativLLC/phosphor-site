// Screens: the hero monitor (demo session through the WebGL CRT), the trailer on a curved CRT with its own
// controls, and the lazy, play-when-visible wall clips. Every screen falls back to a plain <video> + CSS CRT.
import { $, $$, watch, motion, onScroll, clamp, idle } from './util.js';
import { sfx } from './sound.js';

const saveData = () => navigator.connection?.saveData === true;
let glMod = null;
const loadGL = () => (glMod ??= import('./crt-gl.js'));

function setSrc(v) {
  if (v.dataset.src && !v.getAttribute('src')) { v.src = v.dataset.src; v.load(); }
}
const safePlay = (v) => v.play?.().catch(() => {});
// Posters below the fold load only when you get near them (keeps the first paint light on mobile).
export function lazyPosters() {
  for (const v of $$('video[data-poster]')) watch(v, (on) => { if (on && !v.poster) v.poster = v.dataset.poster; }, '900px');
}

// ---------- wall clips ----------
export function lazyClips() {
  for (const v of $$('video.lazyv')) {
    let near = false;
    watch(v, (on) => { if (on) { near = true; setSrc(v); } }, '300px');
    watch(v, (on) => {
      if (on && near && !motion.reduced) safePlay(v);
      else v.pause();
    }, '0px', 0.15);
  }
  motion.on((r) => { if (r) $$('video.lazyv').forEach((v) => v.pause()); });
  reducedPlayButtons();
}

// Under reduced motion, clips rest on their poster with an explicit play button.
function reducedPlayButtons() {
  const add = () => {
    for (const v of $$('video.lazyv, .mon-hero video')) {
      const host = v.parentElement;
      if (host.querySelector('.rm-play')) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rm-play';
      b.textContent = 'PLAY CLIP';
      b.setAttribute('aria-label', 'Play this clip');
      b.addEventListener('click', () => {
        setSrc(v);
        if (v.paused) { safePlay(v); b.textContent = 'PAUSE'; } else { v.pause(); b.textContent = 'PLAY CLIP'; }
      });
      host.append(b);
    }
  };
  if (motion.reduced) add();
  motion.on((r) => (r ? add() : $$('.rm-play').forEach((b) => b.remove())));
}

// ---------- hero monitor ----------
export function heroMonitor() {
  const fig = $('.mon-hero');
  if (!fig) return;
  const screen = $('.screen', fig);
  const video = $('video', screen);
  let crt = null, visible = false, tried = false;

  const want = () => visible && !motion.reduced && !document.hidden;
  const sync = () => {
    if (want()) { setSrc(video); safePlay(video); crt?.start(); }
    else { video.pause(); crt?.stop(); }
  };

  async function initGL() {
    if (tried || motion.reduced || saveData()) return;
    tried = true;
    const { createCRT, canGL } = await loadGL();
    if (!canGL()) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    screen.insertBefore(canvas, video.nextSibling);
    crt = createCRT(canvas, video, { curve: 0.07, bloom: 0.8, chroma: 1, scan: 0.28, power: 0, onLost: () => screen.classList.remove('gl') });
    if (!crt) { canvas.remove(); return; }
    const reveal = () => {
      crt.once();
      requestAnimationFrame(() => { screen.classList.add('gl'); crt.powerOn(900); if (visible) sfx.thunk(); });
      sync();
    };
    if (video.readyState >= 2) reveal(); else video.addEventListener('loadeddata', reveal, { once: true });
  }

  watch(screen, (on) => { if (on && !motion.reduced) { setSrc(video); idle(initGL, 1200); } }, '400px');
  watch(screen, (on) => { visible = on; sync(); }, '0px', 0.05);
  document.addEventListener('visibilitychange', sync);
  motion.on(sync);

  // Scroll-linked rise: the monitor lies back on the horizon and stands up as you scroll to it.
  const stage = $('#stage');
  onScroll(() => {
    if (motion.reduced) { fig.style.removeProperty('--tilt'); return; }
    const r = stage.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (innerHeight * 0.85));
    fig.style.setProperty('--tilt', (1 - p).toFixed(3));
  });
}

// ---------- trailer ----------
export function trailerPlayer() {
  const screen = $('[data-crt="trailer"]');
  if (!screen) return;
  const video = $('video', screen);
  const play = $('.tv-play', screen);
  const ctrl = $('.tv-ctrl');
  const pp = $('.tv-pp', ctrl), mute = $('.tv-mute', ctrl), bar = $('.tv-bar', ctrl), tt = $('.tv-t', ctrl), fs = $('.tv-fs', ctrl);
  let crt = null, started = false;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  async function start() {
    started = true;
    play.hidden = true;
    sfx.thunk();
    screen.closest('.monitor')?.scrollIntoView({ block: 'center', behavior: motion.reduced ? 'auto' : 'smooth' });
    if (!motion.reduced && !crt) {
      try {
        const { createCRT, canGL } = await loadGL();
        if (canGL()) {
          const canvas = document.createElement('canvas');
          canvas.setAttribute('aria-hidden', 'true');
          screen.insertBefore(canvas, video.nextSibling);
          crt = createCRT(canvas, video, { curve: 0.05, scan: 0.26, bloom: 0.75, decay: 0.7, grain: 0.03, power: 0, maxDpr: 1.5 });
          if (!crt) canvas.remove();
        }
      } catch { crt = null; }
    }
    video.muted = false;
    if (crt) {
      ctrl.hidden = false;
      screen.classList.add('gl');
      crt.start();
      crt.powerOn(700);
    } else {
      video.controls = true;
    }
    await video.play().catch(() => { video.muted = true; mute.textContent = 'SND OFF'; return video.play().catch(() => {}); });
    (crt ? pp : video).focus?.({ preventScroll: true });
  }
  play.addEventListener('click', start);

  pp.addEventListener('click', () => { if (video.paused) { video.play(); } else video.pause(); });
  video.addEventListener('play', () => { pp.textContent = 'PAUSE'; crt?.start(); });
  video.addEventListener('pause', () => { pp.textContent = 'PLAY'; setTimeout(() => video.paused && crt?.stop(), 400); });
  video.addEventListener('ended', () => {
    crt?.stop();
    play.hidden = false;
    $('span:not(.tv-tri)', play).textContent = 'REPLAY TRANSMISSION';
  });
  mute.addEventListener('click', () => { video.muted = !video.muted; mute.textContent = video.muted ? 'SND OFF' : 'SND ON'; });
  video.addEventListener('timeupdate', () => {
    const d = video.duration || 45, c = video.currentTime;
    bar.style.setProperty('--p', (c / d).toFixed(4));
    bar.setAttribute('aria-valuenow', Math.round(c));
    bar.setAttribute('aria-valuetext', `${Math.round(c)} seconds of ${Math.round(d)}`);
    tt.textContent = `${fmt(c)} / ${fmt(d)}`;
  });
  const seek = (s) => { video.currentTime = clamp(s, 0, (video.duration || 45) - 0.1); crt?.once(); };
  bar.addEventListener('click', (ev) => { const r = bar.getBoundingClientRect(); seek(((ev.clientX - r.left) / r.width) * (video.duration || 45)); });
  bar.addEventListener('keydown', (ev) => {
    const k = ev.key;
    if (k === 'ArrowRight' || k === 'ArrowUp') seek(video.currentTime + 5);
    else if (k === 'ArrowLeft' || k === 'ArrowDown') seek(video.currentTime - 5);
    else if (k === 'Home') seek(0);
    else if (k === 'End') seek(1e9);
    else return;
    ev.preventDefault();
  });
  fs.addEventListener('click', () => {
    const el = screen;
    if (document.fullscreenElement) document.exitFullscreen();
    else (el.requestFullscreen?.() ?? video.webkitEnterFullscreen?.());
  });
  // Pause when scrolled away or the tab is hidden (the viewer can resume).
  watch(screen, (on) => { if (!on && started && !video.paused) video.pause(); }, '0px', 0);
  document.addEventListener('visibilitychange', () => { if (document.hidden && !video.paused) video.pause(); });
}

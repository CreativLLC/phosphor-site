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
// The poster <img> is the LCP image; the clip fades in over it once it plays. Every screen shows the WHOLE app
// (16:9: tabs, crew, chat, mission panel). Wide screens punch in on the mission panel as you scroll out of the hero,
// which hands over to 01, where the same panel builds itself. On phones the full app is too small to read, so
// a tap swaps in a second clip of the mission panel alone (4:5) and a second tap goes back to the full app.
const MISSION = { x: 0.87, y: 0.33 }; // centre of the mission panel inside the full-app clip
const PUNCH = 1.25; // extra zoom at the end of the scroll (1 -> 2.25)
export function heroMonitor() {
  const fig = $('.mon-hero');
  if (!fig) return;
  const screen = $('.screen', fig);
  const video = $('video', screen);
  const narrow = matchMedia('(max-width: 899px)');
  if (narrow.matches && video.dataset.srcM) video.dataset.src = video.dataset.srcM;
  let crt = null, visible = false, tried = false;
  video.addEventListener('playing', () => video.classList.add('on'));

  // tap to zoom (phones): full app <-> mission panel
  const zbtn = $('.zoom-btn', screen), pz = $('.poster-z', screen);
  function setZoom(on) {
    fig.classList.toggle('zoomed', on);
    zbtn.setAttribute('aria-pressed', String(on));
    if (on && !pz.src) pz.src = pz.dataset.src;
    pz.hidden = !on;
    const next = on ? video.dataset.srcZ : (narrow.matches ? video.dataset.srcM : video.dataset.src);
    video.classList.remove('on');
    video.dataset.src = next;
    if (video.getAttribute('src')) { video.src = next; video.load(); }
    sync();
    if (on) sfx.thunk?.();
  }
  zbtn.addEventListener('click', () => setZoom(!fig.classList.contains('zoomed')));
  narrow.addEventListener('change', () => { if (fig.classList.contains('zoomed')) setZoom(false); });

  const want = () => visible && !motion.reduced && !document.hidden;
  const sync = () => {
    if (want()) { setSrc(video); safePlay(video); crt?.start(); }
    else { video.pause(); crt?.stop(); }
  };

  async function initGL() {
    // phones keep the plain clip + CSS glass: a full-time WebGL pass is not worth the battery (or the main thread)
    if (tried || motion.reduced || saveData() || narrow.matches || matchMedia('(pointer: coarse)').matches) return;
    tried = true;
    const { createCRT, canGL } = await loadGL();
    if (!canGL()) return;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    $('.zoom', screen).append(canvas);
    // sharp first: no afterglow, bloom and fringing nearly off, light scanlines, so the HUD text stays crisp
    crt = createCRT(canvas, video, { curve: 0.008, bloom: 0.05, chroma: 0.1, scan: 0.06, mask: 0, grain: 0.008, decay: 0, maxDpr: 2, power: 0, zcx: MISSION.x, zcy: MISSION.y, onLost: () => screen.classList.remove('gl') });
    if (!crt) { canvas.remove(); return; }
    const reveal = () => {
      crt.once();
      requestAnimationFrame(() => { screen.classList.add('gl'); crt.powerOn(900); if (visible) sfx.thunk(); });
      sync();
      punch();
    };
    if (video.readyState >= 2) reveal(); else video.addEventListener('loadeddata', reveal, { once: true });
  }

  watch(screen, (on) => { if (on && !motion.reduced) { setSrc(video); idle(initGL, 1200); } }, '400px');
  watch(screen, (on) => { visible = on; sync(); }, '0px', 0.05);
  document.addEventListener('visibilitychange', sync);
  motion.on(sync);

  // Scroll punch-in on the mission panel (wide screens only).
  function punch() {
    if (motion.reduced || narrow.matches) { fig.style.setProperty('--zoom', '1'); fig.style.setProperty('--lift', '0'); crt?.set('zoom', 1); return; }
    const p = clamp(scrollY / (innerHeight * 0.62));
    const e = p * p * (3 - 2 * p);
    const z = 1 + e * PUNCH;
    fig.style.setProperty('--zoom', z.toFixed(3));
    fig.style.setProperty('--lift', e.toFixed(3));
    if (crt) { crt.set('zoom', z); if (!crt.running) crt.once(); }
  }
  onScroll(punch);
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
          crt = createCRT(canvas, video, { curve: 0.03, scan: 0.1, mask: 0.02, bloom: 0.07, chroma: 0.15, decay: 0, grain: 0.01, power: 0, maxDpr: 1.5 });
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

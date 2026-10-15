// First visit in a session: a short BIOS boot (about 1.1 s), then the tube opens. Any key, click or tap skips.
// The page underneath is already rendered (the boot is an overlay), so it costs no content paint time.
import { $ } from './util.js';
import { boot as LINES } from '../content.js';
import { sfx } from './sound.js';

export function bootSequence() {
  const h = document.documentElement;
  if (!h.classList.contains('booting')) return Promise.resolve();
  const el = $('#boot');
  const txt = $('.boot-txt', el);
  return new Promise((resolve) => {
    let done = false, i = 0;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(iv);
      try { sessionStorage.setItem('ph-booted', '1'); } catch {}
      txt.textContent = LINES.join('\n') + '\n\nREADY.';
      el.classList.add('off');
      sfx.thunk();
      setTimeout(() => { h.classList.remove('booting'); el.remove(); resolve(); }, 430);
      removeEventListener('keydown', finish);
      removeEventListener('pointerdown', finish);
    };
    addEventListener('keydown', finish);
    addEventListener('pointerdown', finish);
    const iv = setInterval(() => {
      if (i >= LINES.length) { setTimeout(finish, 180); clearInterval(iv); return; }
      txt.textContent += (i ? '\n' : '') + LINES[i++];
      sfx.key();
    }, 130);
    setTimeout(finish, 2600);
  });
}

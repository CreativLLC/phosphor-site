// Entry. Order: boot overlay, then the cheap page-wide bits, then each section's demo when it is needed.
import { motion, idle, $ } from './lib/util.js';
import { bootSequence } from './lib/boot.js';
import { sound, sfx } from './lib/sound.js';
import { reveals, statusBar, crtControls, wordmark, tagline, layerStack, afterglow, copyButtons, anchorFocus } from './lib/fx.js';
import { headings } from './lib/type.js';
import { heroMonitor, trailerPlayer, lazyClips, lazyPosters } from './lib/screens.js';
import { seeEverything } from './lib/hud.js';
import { desktop, comms } from './lib/demos.js';
import { justAsk } from './lib/ask.js';
import { commandLine, toast } from './lib/cmd.js';
import { crew } from './lib/sprites.js';

wordmark();
const booted = bootSequence();
reveals();
statusBar();
const setCrt = crtControls();
anchorFocus();
copyButtons();

// sound toggle
const snd = $('#snd-btn');
const paintSnd = (on) => { snd.classList.toggle('lit', on); $('b', snd).textContent = on ? 'ON' : 'OFF'; };
paintSnd(sound.on);
snd.addEventListener('click', () => { sound.set(!sound.on); if (sound.on) sfx.boot(); });
sound.onChange(paintSnd);
addEventListener('pointerdown', () => sound.wake(), { once: true });

lazyPosters();
heroMonitor();
trailerPlayer();
lazyClips();
desktop();
comms();
justAsk();
layerStack();
// the whole-OS reel: arrow buttons scroll it sideways (it also scrolls with a trackpad, touch or the keyboard)
for (const b of document.querySelectorAll('.reel-b')) {
  b.addEventListener('click', () => { const r = $('.reel'); r.scrollBy({ left: +b.dataset.dir * r.clientWidth * 0.75, behavior: motion.reduced ? 'auto' : 'smooth' }); });
}
commandLine({ setCrt, playTrailer: () => $('.tv-play')?.click() });

booted.then(() => {
  tagline();
  headings([...document.querySelectorAll('.scr')]);
  idle(afterglow);
  if (!sessionStorage.getItem('ph-hint') && !motion.reduced && matchMedia('(pointer: fine)').matches) {
    try { sessionStorage.setItem('ph-hint', '1'); } catch {}
    // the tip goes after 5 s, or at the first scroll or keypress, whichever comes first (it must not sit on the HUD)
    let close = null, done = false;
    const bye = () => { done = true; close?.(); removeEventListener('scroll', bye); removeEventListener('keydown', bye); };
    addEventListener('scroll', bye, { passive: true, once: true });
    addEventListener('keydown', bye, { once: true });
    setTimeout(() => { if (!done && scrollY < innerHeight * 0.3) close = toast('TIP', 'Press / for the command line. Sound is off until you turn it on.', 5000); }, 1800);
  }
});

seeEverything(new Promise((r) => idle(() => crew().then(r, () => r(null)))));

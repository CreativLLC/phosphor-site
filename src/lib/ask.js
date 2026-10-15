// 02 JUST ASK. A prompt types itself, Claude answers, and the mini desktop changes inside a View Transition
// (where supported). Visitors can press any example to run it. Amber only: changes are layout, never hue.
import { $, $$, watch, motion, sleep } from './util.js';
import { typeInto } from './type.js';
import { sfx } from './sound.js';
import { ask } from '../content.js';

export function justAsk() {
  const demo = $('.ask-demo');
  if (!demo) return;
  const P = $('.ask-p', demo), R = $('.ask-r', demo), F = $('.ask-f', demo);
  const chips = $$('.ask-chip');
  const hm = $('.mclock .hm', demo), ap = $('.mclock .ap', demo);
  const KEY = { twelve: 'twelve', bell: 'bell', notes: 'notes', blink: 'blink' };
  let busy = false, manual = false, vis = false, gen = 0;

  // the bar clock: 24-hour until someone asks for 12-hour
  const clock = () => {
    const d = new Date(), h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
    if (demo.dataset.twelve === '1') { hm.textContent = `${h % 12 || 12}:${m}`; ap.textContent = h < 12 ? ' AM' : ' PM'; }
    else { hm.textContent = `${String(h).padStart(2, '0')}:${m}`; ap.textContent = ''; }
  };
  clock();
  setInterval(() => vis && clock(), 1000);

  const apply = (fn) => {
    if (document.startViewTransition && !motion.reduced) document.startViewTransition(fn);
    else fn();
  };
  const press = (id, on) => chips.forEach((c) => c.dataset.id === id && c.setAttribute('aria-pressed', String(on)));
  chips.forEach((c) => c.dataset.id !== 'reset' && c.setAttribute('aria-pressed', 'false'));

  async function run(p) {
    busy = true;
    const my = gen;
    R.textContent = ''; F.textContent = '';
    await typeInto(P, p.p, 2);
    if (my !== gen) return (busy = false);
    await sleep(motion.reduced ? 0 : 500);
    await typeInto(R, p.r, 3, false);
    F.innerHTML = '<b>EDITED</b>';
    F.append(document.createTextNode(p.file));
    sfx.beep();
    apply(() => { demo.dataset[KEY[p.id]] = '1'; clock(); });
    press(p.id, true);
    if (manual) $('#ask-live').textContent = `${p.p} Claude: ${p.r}`;
    busy = false;
  }
  function reset() {
    gen++;
    apply(() => { for (const k of Object.values(KEY)) demo.dataset[k] = '0'; clock(); });
    chips.forEach((c) => c.dataset.id !== 'reset' && c.setAttribute('aria-pressed', 'false'));
    P.textContent = ''; R.textContent = ''; F.textContent = '';
    busy = false;
  }

  chips.forEach((c) => c.addEventListener('click', async () => {
    manual = true;
    if (c.dataset.id === 'reset') return reset();
    if (busy) return;
    const p = ask.prompts.find((x) => x.id === c.dataset.id);
    if (demo.dataset[KEY[p.id]] === '1') {
      // pressing it again undoes it
      apply(() => { demo.dataset[KEY[p.id]] = '0'; clock(); });
      press(p.id, false);
      return;
    }
    run(p);
  }));

  async function auto() {
    const my = ++gen;
    while (vis && !manual && my === gen) {
      for (const p of ask.prompts) {
        if (!vis || manual || my !== gen) return;
        await run(p);
        await sleep(2200);
      }
      await sleep(2600);
      if (!vis || manual || my !== gen) return;
      reset();
      return auto();
    }
  }
  watch(demo, (on) => {
    vis = on;
    if (on && !manual && !busy) {
      if (motion.reduced) {
        // still frame: the first change already applied
        demo.dataset.twelve = '1'; press('twelve', true); clock();
        P.textContent = ask.prompts[0].p; R.textContent = ask.prompts[0].r;
        F.innerHTML = '<b>EDITED</b>'; F.append(document.createTextNode(ask.prompts[0].file));
      } else auto();
    }
  }, '0px', 0.35);
}

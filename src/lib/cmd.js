// The ship's command line: "/" or Ctrl/Cmd+K opens it (like the app's launcher). Jump to any section or run a
// command. Plus two eggs: the Konami code degausses the screen, typing "sudo" gets a polite refusal.
import { $, motion } from './util.js';
import { sfx, sound } from './sound.js';
import { nav, REPO_URL } from '../content.js';

export function toast(title, body, ms = 3800) {
  const host = $('.toasts');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<b></b><p></p>';
  t.firstChild.textContent = title;
  t.lastChild.textContent = body;
  host.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, ms);
}

export function degauss() {
  const h = document.documentElement;
  if (motion.reduced) { toast('DEGAUSS', 'Skipped: your system asks for reduced motion.'); return; }
  h.classList.remove('degauss'); void h.offsetWidth; h.classList.add('degauss');
  sfx.degauss();
  setTimeout(() => h.classList.remove('degauss'), 1000);
}

export function commandLine({ setCrt, playTrailer }) {
  const dlg = $('#cmd');
  const input = $('#cmd-input');
  const list = $('#cmd-list');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const go = (id) => () => { const el = document.getElementById(id); el?.scrollIntoView({ behavior: motion.reduced ? 'auto' : 'smooth' }); history.replaceState(null, '', `#${id}`); };
  const cmds = [
    ...nav.map((n) => ({ t: n.label, k: n.n === '--' ? 'GO' : `GO ${n.n}`, run: go(n.id) })),
    { t: 'PLAY THE TRAILER', k: 'RUN', run: () => { go('trailer')(); setTimeout(playTrailer, 600); } },
    { t: 'OPEN THE REPO ON GITHUB', k: 'LINK', run: () => window.open(REPO_URL, '_blank', 'noopener') },
    { t: 'SOUND ON / OFF', k: 'TOGGLE', run: () => sound.set(!sound.on) },
    { t: 'CRT: FULL', k: 'SET', run: () => setCrt('full') },
    { t: 'CRT: LOW', k: 'SET', run: () => setCrt('low') },
    { t: 'CRT: OFF (PLAIN TEXT)', k: 'SET', run: () => setCrt('off') },
    { t: 'DEGAUSS', k: 'FUN', run: degauss },
    { t: 'BACK TO TOP', k: 'GO', run: go('top') },
  ];
  let shown = [], sel = 0;
  const render = () => {
    const q = input.value.trim().toUpperCase();
    shown = cmds.filter((c) => !q || c.t.includes(q) || c.k.includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.textContent = '';
    shown.forEach((c, i) => {
      const li = document.createElement('li');
      li.id = `cmd-o${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === sel));
      li.textContent = c.t;
      const k = document.createElement('span');
      k.textContent = c.k;
      li.append(k);
      li.addEventListener('click', () => exec(i));
      list.append(li);
    });
    if (!shown.length) { const li = document.createElement('li'); li.textContent = 'NO MATCH. TRY "INSTALL"'; list.append(li); }
    input.setAttribute('aria-activedescendant', shown.length ? `cmd-o${sel}` : '');
    list.children[sel]?.scrollIntoView({ block: 'nearest' });
  };
  const exec = (i) => { const c = shown[i]; if (!c) return; dlg.close(); sfx.beep(); c.run(); };
  const open = () => { if (dlg.open) return; input.value = ''; sel = 0; render(); dlg.showModal(); input.focus(); sfx.beep(); };
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-controls', 'cmd-list');
  input.setAttribute('aria-expanded', 'true');
  input.addEventListener('input', () => { sel = 0; render(); sfx.key(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { sel = (sel + 1) % Math.max(1, shown.length); render(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = (sel - 1 + shown.length) % Math.max(1, shown.length); render(); e.preventDefault(); }
    else if (e.key === 'Enter') { exec(sel); e.preventDefault(); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.querySelectorAll('.cmd-open').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); open(); }));

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kpos = 0, typed = '';
  addEventListener('keydown', (e) => {
    const t = e.target;
    const field = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (!field && ((e.key === '/' && !e.ctrlKey && !e.metaKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'))) { e.preventDefault(); open(); return; }
    if (field) return;
    kpos = e.key === KONAMI[kpos] || e.key.toLowerCase() === KONAMI[kpos] ? kpos + 1 : e.key === KONAMI[0] ? 1 : 0;
    if (kpos === KONAMI.length) { kpos = 0; degauss(); toast('DEGAUSS', 'Field cleared. The crew thanks you.'); }
    if (e.key.length === 1) {
      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed === 'sudo') toast('PERMISSION CARD', 'No sudo on this ship. Ask Claude Code instead. It will ask you first.');
    }
  });
  return { open };
}

// Headless screenshots (never a visible window). Needs `npx vite preview` running on 127.0.0.1:5182.
// PLAYWRIGHT_BROWSERS_PATH=~/phosphor-site/trailer/.browsers node tools/shots.mjs [desktop|mobile|reduced]...
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { mkdirSync } from 'node:fs';
const require = createRequire(`${homedir()}/phosphor-site/trailer/package.json`);
process.env.PLAYWRIGHT_BROWSERS_PATH ||= `${homedir()}/phosphor-site/trailer/.browsers`;
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:5182/';
const OUT = 'shots';
const PFX = process.env.PFX || '';
mkdirSync(OUT, { recursive: true });
const which = process.argv.slice(2).length ? process.argv.slice(2) : ['desktop', 'mobile'];
const VP = { desktop: { width: 1440, height: 900, dpr: 1 }, mobile: { width: 390, height: 844, dpr: 2 }, reduced: { width: 1440, height: 900, dpr: 1, reduced: true }, wide: { width: 2560, height: 1080, dpr: 1 }, laptop: { width: 1280, height: 720, dpr: 1 } };
// [name, selector, fraction through a tall element | null, or a fixed scrollY in viewport heights when selector is '@']
const SECTIONS = [['hero', '#top', 0], ['stage', '@', 0.4], ['see-1', '#see .see-pin', 0.1], ['see-2', '#see .see-pin', 0.55], ['see-3', '#see .see-pin', 0.98], ['ask', '#ask', 0], ['trailer', '#trailer', 0], ['os', '#os', 0], ['reel', '.reel-wrap', 0], ['beat', '#beat', 0], ['phone', '#phone', 0], ['how', '#how', 0], ['gpu', '#gpu', 0], ['install', '#install', 0], ['faq', '#faq', 0], ['end', '.end', 0]];

const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const name of which) {
  const v = VP[name];
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dpr, reducedMotion: v.reduced ? 'reduce' : 'no-preference', isMobile: name === 'mobile', hasTouch: name === 'mobile' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await page.goto(BASE + '?noboot', { waitUntil: 'networkidle' });
  await page.evaluate(() => sessionStorage.setItem('ph-hint', '1'));
  await page.waitForTimeout(1500);
  for (const [id, sel, frac] of SECTIONS) {
    if (name === 'reduced' && !['hero', 'see-1', 'ask'].includes(id)) continue;
    if (name === 'wide' && !['hero', 'stage', 'see-2', 'ask', 'os'].includes(id)) continue;
    if (name === 'laptop' && !['hero', 'see-2', 'ask', 'faq'].includes(id)) continue;
    const ok = await page.evaluate(([sel, frac]) => {
      document.documentElement.style.scrollBehavior = 'auto';
      if (sel === '@') { scrollTo(0, innerHeight * frac); return true; }
      const el = document.querySelector(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const top = scrollY + r.top + frac * Math.max(0, r.height - innerHeight) - (frac ? 0 : 44);
      document.documentElement.style.scrollBehavior = 'auto';
      scrollTo(0, Math.max(0, top));
      return true;
    }, [sel, frac]);
    if (!ok) continue;
    await page.waitForTimeout(id === 'stage' ? 2600 : id.startsWith('see') ? 1600 : 2200);
    await page.screenshot({ path: `${OUT}/${PFX}${name}-${id}.png` });
  }
  if (name === 'desktop' || name === 'mobile') {
    await page.goto(BASE + '404.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${PFX}${name}-404.png` });
  }
  if (name === 'desktop' || name === 'mobile') {
    await page.goto(BASE + '?noboot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // full page: Playwright's fullPage stitching breaks on the sticky pinned section, so scroll one
    // viewport at a time like a visitor, capture each, and stack them with ffmpeg.
    const H = v.height;
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const parts = [];
    let lastY = -1, overlap = 0;
    for (let y = 0, k = 0; y < total; y += H, k++) {
      const real = await page.evaluate((y) => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, y); return scrollY; }, y);
      if (real <= lastY) break;
      // the last frame is clamped to the bottom of the page: crop what the previous frame already showed
      overlap = lastY >= 0 ? lastY + H - real : 0;
      lastY = real;
      await page.waitForTimeout(650);
      const f = `/tmp/shot-${name}-${String(k).padStart(2, '0')}.png`;
      await page.screenshot({ path: f });
      parts.push(f);
    }
    const { execFileSync } = await import('node:child_process');
    const n = parts.length, ov = Math.round(overlap * v.dpr);
    const pre = parts.map((_, i) => (i === n - 1 && ov > 0 ? `[${i}]crop=iw:ih-${ov}:0:${ov}[p${i}]` : `[${i}]null[p${i}]`)).join(';');
    const args = ['-v', 'error', '-y', ...parts.flatMap((f) => ['-i', f]), '-filter_complex', `${pre};${parts.map((_, i) => `[p${i}]`).join('')}vstack=inputs=${n}`, `${OUT}/${PFX}${name}-full.png`];
    execFileSync('ffmpeg', args);
  }
  console.log(name, errs.length ? errs : 'no errors');
  await ctx.close();
}
await browser.close();

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
mkdirSync(OUT, { recursive: true });
const which = process.argv.slice(2).length ? process.argv.slice(2) : ['desktop', 'mobile'];
const VP = { desktop: { width: 1440, height: 900, dpr: 1 }, mobile: { width: 390, height: 844, dpr: 2 }, reduced: { width: 1440, height: 900, dpr: 1, reduced: true }, wide: { width: 2560, height: 1080, dpr: 1 } };
const SECTIONS = [['hero', '#top', 0], ['stage', '#stage', 0.12], ['see-1', '#see .see-pin', 0.22], ['see-2', '#see .see-pin', 0.62], ['see-3', '#see .see-pin', 0.98], ['trailer', '#trailer', 0], ['os', '#os', 0], ['beat', '#beat', 0], ['phone', '#phone', 0], ['ask', '#ask', 0], ['gpu', '#gpu', 0], ['how', '#how', 0], ['install', '#install', 0], ['faq', '#faq', 0], ['end', '.end', 0]];

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
    if (name === 'wide' && !['hero', 'stage', 'see-2', 'os'].includes(id)) continue;
    const ok = await page.evaluate(([sel, frac]) => {
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
    await page.screenshot({ path: `${OUT}/${name}-${id}.png` });
  }
  if (name === 'desktop' || name === 'mobile') {
    await page.goto(BASE + '404.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${name}-404.png` });
  }
  if (name !== 'reduced' && name !== 'wide') {
    await page.goto(BASE + '?noboot', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // full page: Playwright's fullPage stitching breaks on the sticky pinned section, so scroll one
    // viewport at a time like a visitor, capture each, and stack them with ffmpeg.
    const H = v.height;
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const parts = [];
    for (let y = 0, k = 0; y < total; y += H, k++) {
      await page.evaluate((y) => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, y); }, y);
      await page.waitForTimeout(650);
      const f = `/tmp/shot-${name}-${String(k).padStart(2, '0')}.png`;
      await page.screenshot({ path: f });
      parts.push(f);
    }
    const { execFileSync } = await import('node:child_process');
    const args = ['-v', 'error', '-y', ...parts.flatMap((f) => ['-i', f]), '-filter_complex', `${parts.map((_, i) => `[${i}]`).join('')}vstack=inputs=${parts.length}`, `${OUT}/${name}-full.png`];
    execFileSync('ffmpeg', args);
  }
  console.log(name, errs.length ? errs : 'no errors');
  await ctx.close();
}
await browser.close();

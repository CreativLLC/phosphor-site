// Lighthouse, mobile and desktop, headless, against dist/ served the way GitHub Pages does (under /phosphor-os/).
//   npm run build && node tools/serve-pages.mjs 4176 /phosphor-os/ &   (stop it after)
//   npm run perf                      (or URL=... node tools/perf.mjs)
// Lighthouse is not a dependency of the site: point LIGHTHOUSE at its cli (lighthouse/cli/index.js), or have it
// on PATH. Chrome comes from CHROME_PATH, or the trailer project's Playwright browsers.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const URL_ = process.env.URL || 'http://127.0.0.1:4176/phosphor-os/?noboot';
const chrome = process.env.CHROME_PATH || `${homedir()}/phosphor-site/trailer/.browsers/chromium-1248/chrome-linux64/chrome`;
const cli = process.env.LIGHTHOUSE;
if (!existsSync(chrome)) { console.error(`No Chrome at ${chrome}. Set CHROME_PATH.`); process.exit(1); }
mkdirSync('/tmp/phosphor-perf', { recursive: true });

for (const form of ['mobile', 'desktop']) {
  const out = `/tmp/phosphor-perf/${form}.json`;
  const args = [URL_, '--quiet', '--output=json', `--output-path=${out}`, '--chrome-flags=--headless=new --no-sandbox',
    '--only-categories=performance,accessibility,best-practices,seo', ...(form === 'desktop' ? ['--preset=desktop'] : [])];
  if (cli) execFileSync(process.execPath, [cli, ...args], { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chrome } });
  else execFileSync('lighthouse', args, { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chrome } });
  const r = JSON.parse(readFileSync(out, 'utf8'));
  const c = r.categories, a = r.audits;
  const s = (k) => Math.round(c[k].score * 100);
  console.log(`${form.padEnd(8)} perf ${s('performance')} a11y ${s('accessibility')} bp ${s('best-practices')} seo ${s('seo')} | LCP ${a['largest-contentful-paint'].displayValue} TBT ${a['total-blocking-time'].displayValue} CLS ${a['cumulative-layout-shift'].displayValue} | LCP element: ${a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 80) ?? '?'}`);
}

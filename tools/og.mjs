// Social card (1200x630) from the live hero, headless. Needs `npx vite preview` on 127.0.0.1:5182.
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
const require = createRequire(`${homedir()}/phosphor-site/trailer/package.json`);
process.env.PLAYWRIGHT_BROWSERS_PATH ||= `${homedir()}/phosphor-site/trailer/.browsers`;
const { chromium } = require('playwright');
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto('http://127.0.0.1:5182/?noboot', { waitUntil: 'networkidle' });
await p.evaluate(() => { sessionStorage.setItem('ph-hint', '1'); document.querySelector('.toasts').remove(); document.querySelector('.sbar').style.display = 'none'; document.querySelector('.hero').style.paddingTop = '40px'; });
await p.waitForTimeout(2500);
await p.screenshot({ path: '/tmp/og.png' });
const { execFileSync } = await import('node:child_process');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', '/tmp/og.png', '-q:v', '3', 'public/media/og.jpg']);
await b.close();

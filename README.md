# Phosphor-OS site, direction A: "Ship interface"

The page is a ship computer coming online. Amber phosphor only, static, no tracking, no third-party requests.
Vanilla Vite 7, zero runtime dependencies. Output in `dist/` with `base: '/'`: it is served by GitHub Pages at https://phosphor.creativllc.net (see `DEPLOY.md`).

```
npm ci
npm run dev        # http://127.0.0.1:5181
npm run build      # dist/
npm run preview    # http://127.0.0.1:5182
node tools/serve-pages.mjs 4176                 # dist/ the way GitHub Pages serves it (root path, 404.html)
```

Page order: hero (copy + the live monitor) / 01 See everything (pinned HUD) / 02 Just ask (real capture + simulation)
/ trailer (full bleed) / 03 The whole OS (bell scene + sideways reel; crew, today, docs and dictate live here) /
04 Never miss a beat / 05 Phone (split screen) / 06 How it works (+ bring your own GPU) / 07 Install + 08 FAQ / end card.
About 10,700 px at 1440x900 (12 screens).

## Where things are

| What | Where |
|---|---|
| All copy, and the one repo link `REPO_URL` | `src/content.js` (`SITE_URL` there is the custom domain, used by canonical / og / twitter tags) |
| HTML (rendered at build time from content) | `src/render.js`, filled into `index.html` by `plugins/pages.js` |
| Kernel-panic 404 (standalone, works at any depth; home link = `SITE_URL`) | `src/404.html`, emitted by `plugins/pages.js` |
| Look | `src/styles/main.css` (tokens from the OS `theme.css`) |
| WebGL2 CRT (curvature, bloom, scanlines, persistence) | `src/lib/crt-gl.js` (own shader, MIT) |
| Hero monitor (poster img = LCP, scroll punch-in on the mission panel), trailer player, lazy clips | `src/lib/screens.js` |
| Scroll-pinned HUD assembly + live demo timeline | `src/lib/hud.js` |
| Bell + notifications scene, tabs / AUTO router loops | `src/lib/demos.js` |
| "Just ask" demo (View Transitions) | `src/lib/ask.js` |
| Command line (`/` or Ctrl+K, `help` lists it all), Konami degauss, `sudo` | `src/lib/cmd.js` |
| Boot, sounds (Web Audio, off by default), type effects | `src/lib/boot.js`, `sound.js`, `type.js` |
| Pixel crew | `src/sprites.json` from `tools/sprites.mjs` (reads the app's sprite source, read only) |

## Media

`public/media/` is built by `tools/encode.sh` from the trailer project (`../trailer`, read only; run it inside the
`systemd-run` memory cap). All footage is the app's demo mode with fake data.

- `hero.mp4` 2560x1440: the WHOLE app (tabs, crew, chat, mission panel) from `hero2`, sharp enough for the punch-in.
  `hero-m.mp4` 1280x720: the same, for phones; a tap on the screen swaps in `hero-zoom.mp4` (800x1000, the mission
  panel alone) and a second tap goes back. Their WebP posters are the LCP image.
- `ask.mp4` 1360x720: the real "make my clock 12-hour" capture, 1:1 pixels.
- Reel clips (launcher, calendar, saver, sys, docs, dictate) and the phone: each holds on its last frame and
  crossfades back to its start, so loops run 5 to 9 s with no jump. The launcher is cut while all results show.
- The trailer at 1080p H.264 with audio (11.7 MB). Every file is far under 100 MB; Git LFS is not served by Pages, so keep media in plain git. `media/og.jpg` comes from `tools/og.mjs`.

## Checks (headless only)

- `node tools/shots.mjs desktop mobile reduced wide laptop` writes `shots/` (1440x900, 390x844, reduced motion,
  2560x1080, 1280x720). `BASE=http://127.0.0.1:4176/` to shoot the Pages-style build, `PFX=final2-` to prefix the file names.
- `LIGHTHOUSE=/path/to/lighthouse/cli/index.js npm run perf` (Lighthouse 12, mobile + desktop, against the Pages-style
  server on :4176). On 2026-10-15: mobile 96 / 100 / 100 / 100 (LCP 2.6 s, TBT 10 ms, CLS 0), desktop 100 across the board.

## Known gaps

- The CRT is tuned sharp on purpose (no afterglow, bloom and scanlines light, vignette light); the screen is
  drawn at the layout size so the 3D tilt cannot crop the app. The WebGL CRT was only tested in headless Chromium with SwiftShader (software GL). Test on a real GPU, Safari and Firefox.
  Phones (narrow or coarse pointer) skip the hero's WebGL pass on purpose and show the clip with the CSS glass.
- Firefox is named in the copy but not shown: a demo-mode capture of the amber Firefox theme needs a real display
  (headless Firefox does not draw its own chrome). Capture one and add it to the reel in `content.js`.
- Firefox has no `animation-timeline`; nothing here needs it (the pinned HUD is a sticky element driven by a small scroll handler).
- Install time ("about ten minutes") is an unverified claim carried over from the copy deck. The plan-limit callout (04) matches `server/tab.ts` AUTO-CONTINUE in the app.

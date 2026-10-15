# Phosphor-OS site, direction A: "Ship interface"

The page is a ship computer coming online. Amber phosphor only, static, no tracking, no third-party requests.
Vanilla Vite 7, zero runtime dependencies. Output in `dist/` with `base: './'`, so it works under a GitHub Pages sub-path.

```
npm ci
npm run dev        # http://127.0.0.1:5181
npm run build      # dist/
npm run preview    # http://127.0.0.1:5182 (needed by the tools below)
```

## Where things are

| What | Where |
|---|---|
| All copy, and the one repo link `REPO_URL` | `src/content.js` (the Pages URL for the social card is derived from it) |
| HTML (rendered at build time from content) | `src/render.js`, filled into `index.html` by `plugins/pages.js` |
| Kernel-panic 404 (standalone, works at any depth) | `src/404.html`, emitted by `plugins/pages.js` |
| Look | `src/styles/main.css` (tokens from the OS `theme.css`) |
| WebGL2 CRT (curvature, bloom, scanlines, persistence) | `src/lib/crt-gl.js` (own shader, MIT) |
| Hero monitor, trailer player, lazy clips | `src/lib/screens.js` |
| Scroll-pinned HUD assembly + live demo timeline | `src/lib/hud.js` |
| Tabs / AUTO router / notifications loops | `src/lib/demos.js` |
| "Just ask" demo (View Transitions) | `src/lib/ask.js` |
| Command line (`/` or Ctrl+K), Konami degauss, `sudo` | `src/lib/cmd.js` |
| Boot, sounds (Web Audio, off by default), type effects | `src/lib/boot.js`, `sound.js`, `type.js` |
| Pixel crew | `src/sprites.json` from `tools/sprites.mjs` (reads the app's sprite source, read only) |

## Media

`public/media/` is built by `tools/encode.sh` from the trailer project (`../trailer`, read only):
the trailer at 1080p H.264 with audio (11.7 MB; a VP9 WebM came out the same size, so it is off), and 1280 px or smaller
crops of the demo clips (all under 1.3 MB) with WebP posters. All footage is the app's demo mode with fake data.
`media/og.jpg` comes from `tools/og.mjs`.

## Checks (headless only)

- `node tools/shots.mjs desktop mobile reduced wide` writes `shots/` (1440x900, 390x844, reduced motion, 2560x1080).
- Lighthouse 12, mobile, on `vite preview`: performance 99, accessibility 100, best practices 100, SEO 100
  (LCP 2.0 s, TBT 50 ms, CLS 0.005) on 2026-10-14.

## Known gaps

- The WebGL CRT was only tested in headless Chromium with SwiftShader (software GL). Test on a real GPU, Safari and Firefox.
- Firefox has no `animation-timeline`; nothing here needs it (the pinned HUD is a sticky element driven by a small scroll handler).
- The social card URL assumes GitHub Pages at `owner.github.io/repo/`, derived from `REPO_URL`.
- Install time ("about ten minutes") and auto-continue are unverified claims carried over from the copy deck.

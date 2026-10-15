// Renders the page body from content.js at build time (plugins/pages.js fills <!--slot:body-->).
// Plain template strings. Everything readable ships as HTML; decorative live demos are aria-hidden
// and always have a real-text twin (lists, captions) right next to them.
import * as C from './content.js';

const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = (href) => (/^https?:/.test(href) ? ' rel="noopener" target="_blank"' : '');

const tag = (t, id) => `<p class="tag rv"${id ? ` id="${id}"` : ''}><span class="chip">${e(t)}</span><span class="rule" aria-hidden="true"></span></p>`;
const head = (s, id) => `<header class="sec-head">
  ${tag(s.tag)}
  <h2 class="h2 scr" id="${id}-h">${e(s.heading)}</h2>
  ${s.lead ? `<p class="lead rv">${e(s.lead)}</p>` : ''}
</header>`;

const bell = (cls = 'bell') =>
  `<svg class="${cls}" viewBox="0 0 10 10" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M4 0h2v1h1v1h1v4h1v1H1V6h1V2h1V1h1zM4 8h2v1H4z"/></svg>`;

const monitorIcon = `<svg class="mon-ico" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><rect x="1" y="2" width="14" height="10" fill="currentColor"/><rect x="2" y="3" width="12" height="8" fill="#0b0700"/><rect x="3" y="5" width="1" height="1" fill="currentColor"/><rect x="4" y="6" width="1" height="1" fill="currentColor"/><rect x="3" y="7" width="1" height="1" fill="currentColor"/><rect x="6" y="8" width="4" height="1" fill="currentColor"/><rect x="5" y="13" width="6" height="2" fill="currentColor" opacity=".6"/></svg>`;

const video = (id, w, h, alt, extra = '') =>
  `<video class="lazyv" muted playsinline loop preload="none" width="${w}" height="${h}" data-poster="media/${id}.webp" data-src="media/${id}.mp4" aria-label="${e(alt)}"${extra}></video>`;

function statusBar() {
  return `<header class="sbar" id="sbar">
  <a class="brand" href="#top">${monitorIcon}<span>PHOSPHOR-OS</span><span class="sr"> home</span></a>
  <p class="sector" aria-hidden="true"><span class="sector-n">00</span><span class="sector-l">SYSTEM ONLINE</span></p>
  <div class="sig" aria-hidden="true">${C.nav.map((n) => `<i data-for="${n.id}"></i>`).join('')}</div>
  <div class="sbar-r">
    <a class="sb-btn cmd-open" href="#index" aria-keyshortcuts="/ Control+K" title="Command line (/ or Ctrl+K)"><span class="k">/</span> CMD</a>
    <button class="sb-btn" type="button" id="crt-btn" title="Screen effect: full, low or off">CRT <b>FULL</b></button>
    <button class="sb-btn" type="button" id="snd-btn" title="Sound effects">SND <b>OFF</b></button>
    <span class="clock" aria-hidden="true">--:--</span>
  </div>
</header>`;
}

function hero() {
  const h = C.hero;
  return `<section class="hero" id="top" aria-labelledby="hero-h">
  <div class="hero-sky" aria-hidden="true"><img src="media/wallpaper.webp" alt="" width="1600" height="900" fetchpriority="low" decoding="async"></div>
  <div class="hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${h.eyebrow.map((x) => `<span>${e(x)}</span>`).join('<i aria-hidden="true">//</i>')}</p>
      <h1 id="hero-h"><span class="wordmark" data-text="${e(h.wordmark)}">${e(h.wordmark)}</span><span class="sr"> : </span><span class="tagline"><span class="tl-text" data-alts="${e([h.headline, ...h.alternates].join('|'))}">${e(h.headline)}</span><i class="caret" aria-hidden="true"></i></span></h1>
      <p class="sub">${e(h.sub)}</p>
      <div class="ctas">
        <a class="btn btn-solid" href="${h.primary.href}">${e(h.primary.label)}</a>
        <a class="btn" href="${h.secondary.href}"${ext(h.secondary.href)}>${e(h.secondary.label)} <span aria-hidden="true">&gt;</span></a>
        <a class="btn-link" href="${h.tertiary.href}"><span aria-hidden="true">&#9654;</span> ${e(h.tertiary.label)}</a>
      </div>
      <p class="under">${e(h.under)}</p>
    </div>
    <figure class="monitor mon-hero" id="stage">
      <div class="bezel">
        <div class="screen" data-crt="hero">
          <div class="zoom">
            <picture><source media="(max-width: 899px)" srcset="media/hero-m.webp" width="1280" height="720"><img class="poster" src="media/hero.webp" width="2560" height="1440" alt="${e(h.alt)}" fetchpriority="high" decoding="async"></picture>
            <img class="poster poster-z" data-src="media/hero-zoom.webp" width="800" height="1000" alt="" aria-hidden="true" decoding="async" hidden>
            <video class="crt-src" muted playsinline loop preload="none" data-src="media/hero.mp4" data-src-m="media/hero-m.mp4" data-src-z="media/hero-zoom.mp4" aria-hidden="true"></video>
          </div>
          <span class="glass" aria-hidden="true"></span>
          <button class="zoom-btn" type="button" aria-pressed="false"><span class="zb-on">TAP TO ZOOM</span><span class="zb-off">SEE THE FULL APP</span></button>
        </div>
        <div class="bezel-foot" aria-hidden="true"><span>PHOSPHOR P3 // AMBER</span><span class="leds"><i></i><i></i><i class="on"></i></span></div>
      </div>
      <figcaption><span class="chip chip-s">LIVE</span> ${e(h.monitor)}</figcaption>
    </figure>
  </div>
</section>`;
}

function hudMarkup() {
  const m = C.mission;
  const seg = (n, cls = '') => `<span class="segs ${cls}" style="--n:${n}">${'<i></i>'.repeat(20)}</span>`;
  const n = m.crew.length, run = n - 1, total = m.steps.length, done = 3;
  return `<div class="hud" aria-hidden="true">
  <div class="hud-top"><span class="ht on">MISSION</span><span class="ht">FILES</span><span class="ht">SYS</span><span class="ht-r">${e(m.folder)} <b class="rec">REPLAY</b></span></div>
  <div class="hud-grid">
    <section class="pn" data-k="summary"><span class="pn-tag">THE SUMMARY</span>
      <h4><span class="lbl">TASK</span></h4><p class="task">${e(m.task)}</p>
      <h4><span class="lbl">SUMMARY</span></h4><p class="sum">${e(m.summary)}</p>
    </section>
    <section class="pn" data-k="plan"><span class="pn-tag">PLAN USAGE</span>
      <h4><span class="lbl">PLAN USAGE</span><em>MAX</em></h4>
      <p class="meter"><span>5-HOUR</span>${seg(5, 'm5h')}<b class="v5h">23%</b></p>
      <p class="mini">Resets in 3h 00m</p>
      <p class="meter"><span>WEEK</span>${seg(8, 'mwk')}<b class="vwk">41%</b></p>
      <p class="mini">Resets Sun 8:08 PM</p>
    </section>
    <section class="pn" data-k="now"><span class="pn-tag">WHAT IT IS DOING NOW</span>
      <h4><span class="lbl">NOW</span></h4><p class="now"><span class="now-t">${e(m.now[0])}</span><i class="cur"></i></p>
    </section>
    <section class="pn" data-k="context"><span class="pn-tag">CONTEXT WINDOW</span>
      <h4><span class="lbl">CONTEXT</span><em class="ctx-v">27%</em></h4>
      ${seg(5, 'mctx')}
      <p class="mini"><span class="ctx-t">54K</span> OF 200K TOKENS <span class="btn-x">COMPRESS</span></p>
    </section>
    <section class="pn" data-k="steps"><span class="pn-tag">THE STEPS AHEAD</span>
      <h4><span class="lbl">STEPS</span><em class="st-v">${done}/${total} ${Math.round((done / total) * 100)}%</em></h4>
      <ul class="steps">${m.steps.map((s, i) => `<li class="${i < done ? 'x' : i === done ? 'act' : ''}"><b></b>${e(s)}</li>`).join('')}</ul>
    </section>
    <section class="pn" data-k="model"><span class="pn-tag">MODEL + THINKING LEVEL</span>
      <h4><span class="lbl">STATS</span></h4>
      <p class="dots"><span>AGENTS</span><i></i><b class="ag-v">${run} RUNNING / ${n}</b></p>
      <p class="dots"><span>MODEL</span><i></i><b>claude-opus-5-5</b></p>
      <p class="dots"><span>THINKING</span><i></i><b>HIGH</b></p>
      <p class="dots"><span>MODE</span><i></i><b class="auto">AUTO</b></p>
    </section>
    <section class="pn" data-k="files"><span class="pn-tag">FILES BEING CHANGED</span>
      <h4><span class="lbl">FILES CHANGED</span><em class="fl-v">3</em></h4>
      <ul class="files">${m.files.map((f, i) => `<li class="${i < 3 ? 'on' : ''}"><b>${i === 1 || i === 4 ? 'A' : 'M'}</b>${e(f)}</li>`).join('')}</ul>
    </section>
    <section class="pn" data-k="crew"><span class="pn-tag">SUB-AGENTS RUNNING</span>
      <h4><span class="lbl">CREW</span><em class="crew-v">${run} ACTIVE / ${n}</em></h4>
      <div class="crew">${m.crew.map((c, i) => `<div class="cc${i < done - 2 ? ' done' : ''}"><canvas class="sprite" data-sprite="${c.kind}" width="24" height="24"></canvas><p><b>${e(c.name)}</b><span class="st">${i < done - 2 ? '[DONE]' : '[RUNNING]'}</span><span class="md">${e(c.model)}</span></p></div>`).join('')}</div>
    </section>
  </div>
  <div class="hud-foot"><span class="pct">${Math.round((done / total) * 100)}%</span><span class="prog"><i></i></span><span class="stepchip">${done}/${total} DONE</span><span class="tm">00:05</span><span class="cur-step">&gt; ${e(m.steps[done])}</span></div>
</div>`;
}

function see() {
  const s = C.see;
  return `<section class="see" id="see" aria-labelledby="see-h">
  <div class="see-pin">
    <div class="see-stage">
      <header class="see-head">${tag(s.tag)}<h2 class="h2 scr" id="see-h">${e(s.heading)}</h2><p class="lead rv">${e(s.lead)}</p></header>
      <div class="see-hud">${hudMarkup()}<p class="hud-note">${e(s.note)}</p></div>
      <div class="see-call">
        <p class="call-count" aria-hidden="true"><b class="cc-n">00</b> / 08</p>
        <ol class="call-list">${s.items
          .map(
            (it, i) => `<li data-k="${it.k}" data-i="${i}"><span class="call-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3><span class="chip">${e(it.title)}</span></h3><p class="call-cap">${e(it.cap)}</p><p class="call-more">${e(it.more)}</p></li>`,
          )
          .join('')}</ol>
        <div class="call-ticks" aria-hidden="true">${s.items.map(() => '<i></i>').join('')}</div>
      </div>
    </div>
  </div>
  <div class="wrap"><p class="closer rv"><span class="br">[</span> ${e(s.closer)} <span class="br">]</span></p></div>
</section>`;
}

function askSec() {
  const s = C.ask;
  return `<section class="ask" id="ask" aria-labelledby="ask-h">
  <div class="wrap">
    ${head(s, 'ask')}
    <div class="ask-grid">
      <figure class="ask-cap">
        <div class="cap-screen">${video('ask', s.capture.w, s.capture.h, 'Screen recording, demo mode: a chat asks to make the clock 12-hour, and Claude edits the config and restarts the bar.')}<span class="glass" aria-hidden="true"></span></div>
        <figcaption><span class="chip chip-s">${e(s.capture.label)}</span> ${e(s.capture.cap)}</figcaption>
      </figure>
      <div class="ask-sim">
        <p class="ask-note"><span class="chip chip-s">${e(s.simLabel)}</span> ${e(s.note)}</p>
        <div class="ask-demo" data-twelve="0" data-bell="0" data-notes="0" data-blink="0">
          <div class="ask-chat" aria-hidden="true">
            <p class="you"><span class="who">&gt; YOU</span><span class="ask-p"></span><i class="caret"></i></p>
            <p class="claude"><span class="who">&gt; CLAUDE</span><span class="ask-r"></span></p>
            <p class="ask-f"></p>
          </div>
          <div class="mdesk" aria-hidden="true">
            <span class="mbell-top">${bell()}<b>2</b></span>
            <div class="mwin">
              <p class="mw-h"><span class="chip chip-s">PHOSPHOR-OS</span><span>Plugin system</span></p>
              <p class="mw-l"><span>CONTEXT</span><span class="mctx">${'<i></i>'.repeat(12)}</span><b>92%</b></p>
              <p class="mw-l"><span>NOW</span><span class="dim">Edit: src/plugins/loader.ts</span></p>
              <div class="mlaunch"><p class="ml-h">LAUNCH</p><p>FIREFOX</p><p>FILES</p><p class="ml-new">NOTES <span>~/notes</span></p></div>
            </div>
            <div class="mbar"><span class="ws"><b>1</b>2 3</span><span class="app on">PHOSPHOR-OS</span><span class="app">FIREFOX</span><span class="sp"></span><span class="mbell">${bell()}<b>2</b></span><span class="mclock"><span class="hm">21:41</span><span class="ap"></span></span></div>
          </div>
        </div>
        <p class="sr" aria-live="polite" id="ask-live"></p>
        <div class="ask-chips" role="group" aria-label="Example requests">${s.prompts.map((p) => `<button type="button" class="ask-chip" data-id="${p.id}">&quot;${e(p.p)}&quot;</button>`).join('')}<button type="button" class="ask-chip ask-reset" data-id="reset">RESET</button></div>
      </div>
    </div>
    <p class="small rv">${e(s.small)}</p>
  </div>
</section>`;
}

function trailer() {
  const t = C.trailer;
  return `<section class="trailer" id="trailer" aria-labelledby="trailer-h">
  <div class="wrap">
    <header class="sec-head">
      ${tag(t.tag)}
      <h2 class="h2 scr" id="trailer-h">${e(t.heading)}</h2>
      <p class="lead rv">${e(t.lead)}</p>
    </header>
  </div>
  <figure class="tv-full">
    <div class="screen" data-crt="trailer">
      <video class="crt-src" playsinline preload="none" width="1920" height="1080" data-poster="media/trailer.webp" aria-label="Phosphor-OS trailer, 45 seconds, with music">
        <source src="media/trailer.mp4" type="video/mp4">
      </video>
      <span class="glass" aria-hidden="true"></span>
      <button class="tv-play" type="button"><span class="tv-tri" aria-hidden="true"></span><span>PLAY TRANSMISSION</span><small><span class="sr">The trailer, </span>0:45 // SOUND ON</small></button>
    </div>
    <div class="tv-ctrl" hidden>
      <button type="button" class="tv-b tv-pp">PAUSE</button>
      <button type="button" class="tv-b tv-mute" title="Sound on or off">SND ON</button>
      <div class="tv-bar" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="45" aria-valuenow="0" aria-valuetext="0 seconds"><i></i></div>
      <span class="tv-t" aria-hidden="true">0:00 / 0:45</span>
      <button type="button" class="tv-b tv-fs" title="Full screen">FULL<span class="sr"> screen</span></button>
    </div>
  </figure>
  <div class="wrap"><details class="transcript rv"><summary>READ THE TRAILER INSTEAD</summary><ol>${t.transcript.map((x) => `<li>${e(x)}</li>`).join('')}</ol></details></div>
</section>`;
}

function reelCard(x) {
  if (x.id === 'crew') {
    return `<div class="rc-scr rc-html mi-crew" aria-hidden="true">${['scout', 'architect', 'engineer', 'crew', 'librarian'].map((k) => `<canvas class="sprite" data-sprite="${k}" width="24" height="24"></canvas>`).join('')}</div>`;
  }
  if (x.id === 'today') {
    return `<div class="rc-scr rc-html mi-today" aria-hidden="true"><p class="mt-h">TODAY <span>WED</span></p><p><b>09:30</b> Standup</p><p><b>12:00</b> Lunch</p><p class="hl"><b>16:00</b> Demo</p><p class="mt-h">REMINDERS</p><p><b>18:00</b> Water the plants</p></div>`;
  }
  return `<div class="rc-scr">${video(x.id, x.w, x.h, `${x.t} screen recording, demo mode`)}<span class="glass" aria-hidden="true"></span></div>`;
}

function os() {
  const s = C.os;
  return `<section class="os" id="os" aria-labelledby="os-h">
  <div class="wrap">${head(s, 'os')}</div>
  <div class="wrap">
    <div class="desk">
      <img class="desk-wall" src="media/wallpaper.webp" alt="" width="1600" height="900" loading="lazy" decoding="async">
      <div class="desk-win" aria-hidden="true"><p class="dw-h"><span>PHOSPHOR-OS</span><span>Plugin system</span></p><img src="media/hero.webp" alt="" width="2560" height="1440" loading="lazy" decoding="async"></div>
      <div class="desk-copy"><p class="chip chip-s">NOTIFICATIONS</p><h3>${e(s.bell.t)}</h3><p>${e(s.bell.d)}</p></div>
      <div class="desk-notes" aria-hidden="true"></div>
      <div class="desk-bar" aria-hidden="true"><span class="ws"><b>1</b>2 3 4</span><span class="app on">PHOSPHOR-OS</span><span class="app">TERMINAL</span><span class="app">FIREFOX</span><span class="app needs">FILES</span><span class="sp"></span><span class="cpu">CPU 23%</span><span class="dclock">21:41</span><span class="dbell">${bell()}<b class="dbell-n">0</b></span></div>
    </div>
  </div>
  <div class="reel-wrap">
    <div class="wrap reel-nav"><p class="reel-h">${e(s.reelHead)}</p><span class="reel-btns"><button type="button" class="reel-b" data-dir="-1" aria-label="Scroll the reel left">&lt;</button><button type="button" class="reel-b" data-dir="1" aria-label="Scroll the reel right">&gt;</button></span></div>
    <ul class="reel" tabindex="0" aria-label="Pieces of the Phosphor-OS desktop, scroll sideways">${s.reel
      .map((x) => `<li class="rc rc-${x.id}"${x.w ? ` style="--ar:${(x.w / x.h).toFixed(3)}"` : ''}>${reelCard(x)}<h3>${e(x.t)}</h3><p>${e(x.d)}</p></li>`)
      .join('')}</ul>
  </div>
</section>`;
}

function beat() {
  const s = C.beat;
  return `<section class="beat" id="beat" aria-labelledby="beat-h">
  <div class="wrap">${head(s, 'beat')}</div>
  <div class="wrap beat-grid">
    <div class="comms" aria-hidden="true">
      <div class="c-head"><span class="chip chip-s">COMMS</span><span class="c-title">5 CHATS // 1 OPERATOR</span><span class="c-bell">${bell()}<b class="c-bell-n">0</b></span></div>
      <div class="c-tabs">${s.tabs.map((t, i) => `<span class="ctab busy" data-i="${i}"><i class="st"></i>${e(t)}</span>`).join('')}</div>
      <div class="c-body">
        <div class="c-log"><p class="c-log-h">AUTO ROUTER</p><div class="c-lines"></div></div>
        <div class="c-notes"><p class="c-log-h">NOTIFICATIONS</p><div class="c-stack"></div></div>
      </div>
    </div>
    <ul class="blocks">${s.blocks.map((b, i) => `<li class="rv" style="--d:${i}"><h3><span class="br">[</span>${e(b.t)}<span class="br">]</span></h3><p>${e(b.d)}</p></li>`).join('')}</ul>
  </div>
  <div class="wrap">
    <aside class="wait rv" aria-labelledby="wait-h">
      <div class="wait-copy">
        <p class="wait-tag"><span class="chip chip-s">AUTO</span><span>${e(s.wait.tag)}</span></p>
        <h3 id="wait-h">${e(s.wait.t)}</h3>
        <p>${e(s.wait.d)}</p>
        <p class="small">${e(s.wait.small)}</p>
      </div>
      <ol class="wait-log" aria-hidden="true">${s.wait.log.map((l) => `<li class="l-${l.k}"><b>${l.k === 'auto' ? 'AUTO' : l.k === 'wait' ? 'WAIT' : 'NOTE'}</b>${e(l.t)}</li>`).join('')}</ol>
    </aside>
  </div>
</section>`;
}

function phone() {
  const s = C.phone;
  return `<section class="phone" id="phone" aria-labelledby="phone-h">
  <div class="phone-split">
    <div class="phone-copy">${head(s, 'phone')}
      <ul class="ticks">${s.points.map((p, i) => `<li class="rv" style="--d:${i}">${e(p)}</li>`).join('')}</ul>
      <p class="small rv">${e(s.small)}</p>
    </div>
    <div class="phone-vis">
      <div class="link" aria-hidden="true"><span class="node">YOUR PC</span><span class="wire"><i></i><i></i><i></i><em>TAILNET // PRIVATE</em></span><span class="node">PHONE</span></div>
      <div class="handset">${video('phone', 480, 1038, 'Phosphor-OS on a phone: the same chat and crew cards, reshaped for a small screen. Demo mode.')}<span class="glass" aria-hidden="true"></span></div>
      <p class="no-net" aria-hidden="true">PUBLIC INTERNET <b>[ NO ROUTE ]</b></p>
    </div>
  </div>
</section>`;
}

function howSec() {
  const s = C.how, g = C.gpu;
  return `<section class="how" id="how" aria-labelledby="how-h">
  <div class="wrap">${head(s, 'how')}</div>
  <div class="wrap how-grid">
    <div class="stack" aria-hidden="true"><div class="stack-3d">${s.layers.map((l, i) => `<div class="plate p${i}"><span class="pl-n">${l.n}</span><span class="pl-t">${e(l.t)}</span><span class="pl-r">${e(l.role)}</span></div>`).join('')}</div></div>
    <ol class="layers">${s.layers.map((l, i) => `<li class="rv" style="--d:${i}"><p class="ly-n" aria-hidden="true">${l.n}</p><h3>${e(l.t)} <span>(${e(l.role.toLowerCase())})</span></h3><p>${e(l.d)}</p></li>`).join('')}</ol>
    <div class="vram rv" id="gpu">
      <p class="vr-h"><span class="chip chip-s">${e(g.tag)}</span><span>${e(g.t)}</span></p>
      <p class="vr-d">${e(g.d)}</p>
      <table><caption class="sr">Local models in the picker and the video memory they want</caption>
        <thead><tr><th scope="col">LOCAL MODEL</th><th scope="col">VRAM, APPROX.</th></tr></thead>
        <tbody>${g.models.map((m) => `<tr><th scope="row">${e(m.n)}</th><td><span class="vbar" style="--v:${parseInt(m.v.replace(/\D/g, ''), 10) / 20}" aria-hidden="true"></span>${e(m.v)}</td></tr>`).join('')}</tbody>
      </table>
      <p class="vr-f">${e(g.small)}</p>
    </div>
  </div>
  <div class="wrap how-foot"><p class="strip rv">${e(s.strip)}</p><p class="how-body rv">${e(s.body)}</p></div>
</section>`;
}

// Install and the FAQ share one screen: the questions people have right before they install.
function installSec() {
  const s = C.install;
  return `<section class="install" id="install" aria-labelledby="install-h">
  <div class="wrap install-grid">
    <div class="install-main">
      ${head(s, 'install')}
      <div class="term rv">
        <p class="term-h"><span class="chip chip-s">INSTALL.SH</span><span>~/</span><span class="tdots" aria-hidden="true"><i></i><i></i><i></i></span></p>
        <ol class="isteps">${s.steps
          .map(
            (st, i) => `<li><h3><span class="n">STEP ${i + 1}</span> ${e(st.t)}</h3>${st.cmd
              .map((c) => {
                const [cmd, cmt] = c.split('   #');
                return `<div class="code"><code><span class="ps" aria-hidden="true">$ </span>${e(cmd.trim())}${cmt ? `<span class="cmt">   # ${e(cmt.trim())}</span>` : ''}</code><button type="button" class="copy" data-copy="${e(cmd.trim())}">COPY</button></div>`;
              })
              .join('')}${st.note ? `<p>${e(st.note)}</p>` : ''}</li>`,
          )
          .join('')}</ol>
        <p class="term-f"><a class="btn" href="${s.guide.href}"${ext(s.guide.href)}>${e(s.guide.label)}</a><span class="undo">UNDO: <code>${e(s.undo)}</code></span></p>
      </div>
    </div>
    <aside class="faq" id="faq" aria-labelledby="faq-h">
      <header class="sec-head">${tag('08 // FAQ')}<h2 class="h2 scr" id="faq-h">Questions, answered.</h2></header>
      <div class="qa">${C.faq.map((f) => `<details class="rv"><summary><span class="q-mk" aria-hidden="true"></span>${e(f.q)}</summary><p>${e(f.a)}</p></details>`).join('')}</div>
    </aside>
  </div>
</section>`;
}

function endSec() {
  const f = C.footer;
  return `<section class="end" aria-labelledby="end-h">
  <div class="end-in">
    <h2 class="end-title" id="end-h">${e(f.end.title)}</h2>
    <p class="end-sub">${e(f.end.sub)}</p>
    <p class="end-line">${e(f.end.line)}</p>
    <a class="repo-chip" href="${C.REPO_URL}"${ext(C.REPO_URL)}><span aria-hidden="true">&gt;</span> ${e(C.REPO_SHORT)}<i class="caret" aria-hidden="true"></i></a>
  </div>
</section>`;
}

function footerEl() {
  const f = C.footer;
  return `<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <p class="f1">${e(f.l1)}</p>
      <p>${e(f.l2)}</p>
      <p>Built on <a href="${C.OMARCHY_URL}"${ext(C.OMARCHY_URL)}>Omarchy</a> and Claude Code. Not affiliated with Anthropic.</p>
      <p class="dim">${e(f.last)}</p>
    </div>
    <nav aria-label="Project links"><ul class="f-links">${f.links.map((l) => `<li><a href="${l.href}"${ext(l.href)}>${e(l.label)}</a></li>`).join('')}</ul></nav>
    <nav id="index" aria-label="Sections"><p class="f1">INDEX</p><ol class="f-index">${C.nav.map((n) => `<li><a href="#${n.id}"><span>${n.n}</span> ${e(n.label)}</a></li>`).join('')}</ol></nav>
  </div>
  <p class="wrap credits">VT323 font, SIL Open Font License. Clips and trailer use the app's demo mode with fake data.</p>
</footer>`;
}

function chrome() {
  return `<div class="boot" id="boot" aria-hidden="true">
  <div class="boot-in"><pre class="boot-txt"></pre><p class="boot-skip">PRESS ANY KEY TO SKIP</p></div>
</div>
<dialog class="cmd" id="cmd" aria-label="Command line">
  <form method="dialog" class="cmd-in">
    <label class="cmd-q"><span aria-hidden="true">&gt;</span><span class="sr">Jump to a section or run a command</span><input type="text" id="cmd-input" autocomplete="off" spellcheck="false" placeholder="type a section or command"></label>
    <ul class="cmd-list" id="cmd-list" role="listbox" aria-label="Results"></ul>
    <p class="cmd-f"><span>UP/DOWN MOVE</span><span>ENTER RUN</span><span>ESC CLOSE</span></p>
  </form>
</dialog>
<div class="toasts" aria-live="polite"></div>
<div class="crt-fx" aria-hidden="true"><i class="crt-band"></i></div>`;
}

export function renderBody() {
  return [
    '<a class="skip" href="#main">Skip to content</a>',
    statusBar(),
    '<main id="main" tabindex="-1">',
    hero(),
    see(),
    askSec(),
    trailer(),
    os(),
    beat(),
    phone(),
    howSec(),
    installSec(),
    endSec(),
    '</main>',
    footerEl(),
    chrome(),
  ].join('\n');
}

export function renderHead() {
  const s = C.site;
  return `<title>${e(s.title)}</title>
<meta name="description" content="${e(s.description)}">
<link rel="canonical" href="${C.SITE_URL}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Phosphor-OS">
<meta property="og:title" content="${e(s.title)}">
<meta property="og:description" content="${e(s.description)}">
<meta property="og:image" content="${C.SITE_URL}media/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${C.SITE_URL}">
<meta name="twitter:image" content="${C.SITE_URL}media/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(s.title)}">
<meta name="twitter:description" content="${e(s.description)}">`;
}

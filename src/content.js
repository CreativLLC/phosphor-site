// All site copy lives here. The page HTML is rendered from this file at build time (plugins/pages.js),
// so every word ships as real HTML and JS only adds motion on top.
// Rules: no em-dashes, no personal data, amber only. Change the repo link in ONE place: REPO_URL.

export const REPO_URL = 'https://github.com/CreativLLC/phosphor-os';
// GitHub Pages address derived from REPO_URL (owner.github.io/repo/). Used for the social card image only.
const [, OWNER, REPO] = REPO_URL.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
export const SITE_URL = OWNER ? `https://${OWNER.toLowerCase()}.github.io/${REPO}/` : './';
// GitHub Pages serves 404.html for any missing path, so its links must be absolute (filled in by plugins/pages.js).
export const REPO_SHORT = REPO_URL.replace(/^https?:\/\//, '');
export const CLONE_LINE = `git clone ${REPO_URL}.git ~/phosphor-os`;
export const README_URL = `${REPO_URL}/blob/main/README.md`;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const OMARCHY_URL = 'https://omarchy.org';

export const site = {
  title: 'Phosphor-OS: the agent OS',
  description:
    'An amber-CRT Linux desktop built around Claude Code. The whole screen shows what your agents are doing. Open source, runs on your own Anthropic account.',
  themeColor: '#0b0700',
};

export const nav = [
  { id: 'see', n: '01', label: 'SEE EVERYTHING' },
  { id: 'ask', n: '02', label: 'JUST ASK' },
  { id: 'trailer', n: '--', label: 'TRANSMISSION' },
  { id: 'os', n: '03', label: 'THE WHOLE OS' },
  { id: 'beat', n: '04', label: 'NEVER MISS A BEAT' },
  { id: 'phone', n: '05', label: 'FROM YOUR PHONE' },
  { id: 'how', n: '06', label: 'HOW IT WORKS' },
  { id: 'install', n: '07', label: 'INSTALL' },
  { id: 'faq', n: '08', label: 'FAQ' },
];

export const hero = {
  eyebrow: ['OPEN SOURCE', 'MIT', 'FOR CLAUDE CODE'],
  wordmark: 'PHOSPHOR-OS',
  headline: 'THE AGENT OS.',
  alternates: ['THE APP YOU LIVE IN WHEN YOU WORK WITH AGENTS.', 'SEE EVERYTHING.'],
  sub: 'A whole desktop built around Claude Code. One screen shows what your agent is doing now, the steps ahead, the context window, the crew, the model, your plan and every file it touches.',
  monitor: 'Live session, demo mode: one chat, five crew members, the mission panel on the right.',
  primary: { label: 'INSTALL IT', href: '#install' },
  secondary: { label: 'VIEW ON GITHUB', href: REPO_URL },
  tertiary: { label: 'WATCH THE 45 SECOND TRAILER', href: '#trailer' },
  under: 'Built on Omarchy. Powered by Claude Code. Amber phosphor on black.',
};

export const boot = [
  'PHOSPHOR BIOS 1.0 // AMBER P3 PHOSPHOR',
  'MEMORY TEST ........ 65536K OK',
  'CRT DEGAUSS ........ OK',
  'MOUNTING OMARCHY ... OK',
  'CLAUDE CODE ........ LINKED',
  'CREW ON DECK ....... 5 / 5',
  'MISSION PANEL ...... ONLINE',
];

export const see = {
  tag: '01 // SEE EVERYTHING',
  heading: 'You always know what your agent is doing.',
  lead: 'Agents work for minutes or hours. Most tools show you a spinner. Phosphor-OS shows you the job: what is happening now, what comes next, and what it costs you. All of it sits on one screen, live, next to the chat.',
  items: [
    { k: 'now', title: 'NOW', cap: 'What it is doing this second', more: 'The live line: reading, editing, running, thinking.' },
    { k: 'summary', title: 'SUMMARY', cap: 'The task in plain words', more: 'A two-line brief of the job, written by the agent as it works.' },
    { k: 'steps', title: 'STEPS', cap: 'Every step still ahead', more: 'The plan as a checklist, with a progress bar across the top.' },
    { k: 'context', title: 'CONTEXT', cap: 'How full the window is', more: 'A gauge for the context window. Compress it with one button.' },
    { k: 'crew', title: 'SUB-AGENTS', cap: 'Every helper, running live', more: 'Each helper gets its own pixel-art crew card. Finished ones fold away.' },
    { k: 'model', title: 'MODEL + THINKING', cap: 'Which model, how hard it thinks', more: 'Pick per chat, or let AUTO choose.' },
    { k: 'plan', title: 'PLAN USAGE', cap: 'How much of your plan is used', more: 'See the limit coming before it stops you.' },
    { k: 'files', title: 'FILES', cap: 'Every file being changed', more: 'A list of what the agent touched. Undo from any message.' },
  ],
  closer: 'Every panel here is a panel in the app, fed by the same events Claude Code sends.',
  note: 'Replay of a demo session. Fake data.',
};

// Demo-mode mission (fake data, matches the trailer captures).
export const mission = {
  task: 'ADD A PLUGIN SYSTEM',
  summary: 'Plugins add routes and hooks without touching the core. Five crew members work on it at once.',
  now: ['Read: src/app.ts', 'Grep: registerRoute', 'Edit: src/plugins/loader.ts', 'Bash: npm test', 'Write: docs/PLUGINS.md'],
  steps: ['Map the current routes', 'Design the plugin API', 'Build the plugin loader', 'Write the tests', 'Document it', 'Run the full suite'],
  // five crew members, five cards: the AGENTS and CREW counters always match the cards
  crew: [
    { name: 'MAP EVERY ROUTE', kind: 'scout', model: 'HAIKU 5.5', type: 'Explore' },
    { name: 'DRAFT THE API', kind: 'architect', model: 'OPUS 5.5', type: 'Plan' },
    { name: 'BUILD THE LOADER', kind: 'engineer', model: 'SONNET 5.5', type: 'general-purpose' },
    { name: 'WRITE THE TESTS', kind: 'crew', model: 'SONNET 5.5', type: 'test-writer' },
    { name: 'DOCUMENT IT', kind: 'librarian', model: 'SONNET 5.5', type: 'docs' },
  ],
  files: ['src/plugins/loader.ts', 'src/plugins/types.ts', 'src/app.ts', 'tests/loader.test.ts', 'docs/PLUGINS.md'],
  folder: 'orbit-api',
};

export const trailer = {
  tag: 'INCOMING TRANSMISSION',
  heading: 'Forty-five seconds aboard.',
  lead: 'One live session, the whole desktop, tabs, AUTO, the phone, and a chat that rewrites its own clock. Sound on if you like.',
  transcript: [
    'A chat starts a mission: add a plugin system. The HUD tags every part: plan usage, the summary, what it is doing now, the steps ahead, the sub-agents running, the files being changed, the context window, the model and thinking level.',
    'Title: PHOSPHOR-OS. The agent OS. Built on Omarchy. Powered by Claude Code.',
    'The whole OS: taskbar, notifications, one look. Firefox and the launcher in the same amber. The calendar, the docs editor, the screensaver.',
    'Chat tabs show done and needs-you. AUTO picks the model for each message. The same screen runs on a phone over Tailscale.',
    'Just ask Claude Code: a chat asks for a 12-hour bar clock, and the clock on the bar changes.',
    'End card: PHOSPHOR-OS. The agent OS. Open source. Bring your own Claude Code.',
  ],
};

export const ask = {
  tag: '02 // JUST ASK',
  heading: 'Change anything you want.',
  lead: 'You can just ask Claude Code. Phosphor-OS is plain files on your disk, and the agent in it can read them. Describe the change, watch it happen.',
  capture: {
    label: 'REAL CAPTURE',
    cap: 'The app in demo mode: "make my clock 12-hour". Claude reads the clock config, edits it and restarts the bar.',
    w: 1360,
    h: 720,
  },
  prompts: [
    { id: 'twelve', p: 'Make my clock 12-hour.', r: 'Done. The bar clock is 12-hour now.', file: '~/.config/omarchy/shell.json' },
    { id: 'bell', p: 'Move the bell to the top right.', r: 'Moved. The bell sits top right now.', file: 'os/omarchy/bar/taskbar.qml' },
    { id: 'notes', p: 'Add a launcher command that opens my notes folder.', r: 'Added NOTES to the launcher.', file: 'web/src/launcher.ts' },
    { id: 'blink', p: 'Make the context bar blink when it is almost full.', r: 'Done. Past 90% it blinks.', file: 'web/src/theme.css' },
  ],
  simLabel: 'TRY IT',
  small: 'Changes to the desktop go into a pack with a dry-run mode and an undo. Ask Claude to keep it that way.',
  note: 'Simulation. Press a request.',
};

export const os = {
  tag: '03 // THE WHOLE OS',
  heading: 'Not an app. The whole desktop.',
  lead: 'A themed window looks like a skin. Phosphor-OS restyles the system itself: the bar, the alerts, the launcher, the clock, the screensaver, the terminal and Firefox.',
  bell: {
    t: 'THE BELL KEEPS COUNT',
    d: 'Amber cards stack bottom right. Walk away and they wait: the bell on the bar counts what you have not seen.',
  },
  notes: [
    { t: 'DONE', b: 'Fix flaky tests: 42 tests passing.' },
    { t: 'CLAUDE NEEDS YOU', b: 'Release notes: approve the publish?', need: true },
    { t: 'CREW', b: 'Librarian finished the docs.' },
  ],
  // the reel: real demo-mode captures (clips) plus the small extras, each card at its own aspect ratio
  reel: [
    { id: 'launcher', t: 'THE LAUNCHER', d: 'Super + Space. Apps, chats, files and commands in one search.', w: 1100, h: 620 },
    { id: 'calendar', t: 'CLOCK + CALENDAR', d: 'Click the clock for a month view with your events under each day.', w: 1000, h: 728 },
    { id: 'saver', t: 'THE SCREENSAVER', d: 'Grid flight, a big clock and your crew on patrol. Any key wakes it.', w: 1280, h: 720 },
    { id: 'sys', t: 'SYSTEM', d: 'CPU, memory, GPU, network and drives, live.', w: 480, h: 1002 },
    { id: 'docs', t: 'DOCS', d: 'A Markdown editor in the same look, saved as plain files.', w: 1100, h: 618 },
    { id: 'dictate', t: 'DICTATE', d: 'Press a key and talk. Speech turns to text on your own PC.', w: 1100, h: 386 },
    { id: 'crew', t: 'CREW', d: 'Every sub-agent gets a pixel-art sprite that works while it works.', html: true },
    { id: 'today', t: 'TODAY', d: 'Your calendar and reminders in a side panel, read only.', html: true },
  ],
  reelHead: 'ONE FONT, ONE PALETTE, ONE WALLPAPER: EVERY PIECE',
};

export const beat = {
  tag: '04 // NEVER MISS A BEAT',
  heading: 'Know the second it needs you.',
  lead: 'Run five chats at once and still know which one to open next.',
  blocks: [
    { t: 'DONE VS NEEDS YOU', d: 'Every chat tab shows its state in plain sight. Done is calm. Needs you pulses. You see it from across the room.' },
    { t: 'AUTO MODEL', d: 'Set the picker to AUTO. A small fast model reads each message and picks the model and thinking level for it. Quick questions stay cheap, hard problems get the big model, and every reply shows the choice.' },
    { t: 'KEEPS GOING', d: 'If your plan limit stops a long job, Phosphor-OS waits for the reset and sends one "continue" for you. Cancel it any time.' },
  ],
  tabs: ['Plugin system', 'Fix flaky tests', 'Release notes', 'Landing page', 'Docs pass'],
  route: [
    { msg: 'what does this regex do?', model: 'HAIKU 5.5', think: 'LOW', why: 'quick question' },
    { msg: 'rename the config flag in the docs', model: 'SONNET 5.5', think: 'MEDIUM', why: 'small two-file edit' },
    { msg: 'add a plugin system to the API. split it across the crew', model: 'OPUS 5.5', think: 'HIGH', why: 'multi-file design work' },
  ],
};

export const phone = {
  tag: '05 // FROM YOUR PHONE',
  heading: 'Same desk. In your pocket.',
  lead: 'Open the same screen on your phone. Check the job, answer a question, start the next one. It installs like an app and buzzes when an agent finishes or needs you.',
  points: [
    'Private by design: it travels over Tailscale, inside your own network. Never on the public internet.',
    'Same HUD, same chats, same tabs, reshaped for a small screen.',
    'Fingerprint login and a long-lived session. Dictate by voice.',
  ],
  small: 'Needs a free Tailscale account (optional). The setup script turns on tailscale serve for you. It never turns on Funnel.',
};

export const how = {
  tag: '06 // HOW IT WORKS',
  heading: 'Three layers. All of them open.',
  lead: 'Phosphor-OS adds a look and a cockpit. It does not replace the engine.',
  layers: [
    { n: '03', t: 'PHOSPHOR-OS', role: 'THE COCKPIT', d: 'A small server on your own PC and a desktop app that show everything Claude Code is doing, live.' },
    { n: '02', t: 'CLAUDE CODE', role: 'THE ENGINE', d: 'The same tools, permissions, sessions, CLAUDE.md files and MCP servers you already use. Your agent is the real thing.' },
    { n: '01', t: 'OMARCHY', role: 'THE GROUND', d: 'Arch Linux with the Hyprland window manager. Phosphor-OS ships an add-on pack: theme, bar, notifications, screensaver, keys. Every change is listed and can be undone.' },
  ],
  strip: 'YOUR PC // YOUR ANTHROPIC ACCOUNT // NO MIDDLEMAN',
  body: 'You sign in to Claude Code once, with your own Anthropic account. Phosphor-OS does not ask for a key and has no server of its own. It reaches your agents through the Claude Agent SDK.',
};

// Optional local models: folded into How it works (and the FAQ).
export const gpu = {
  t: 'BRING YOUR OWN GPU',
  tag: 'OPTIONAL',
  d: 'Have a capable graphics card? Pick a local model from the same picker. It answers on your machine, with no plan limit and no network. Tools, edits and permission cards work the same.',
  models: [
    { n: 'QWEN 27B', v: 'about 18 GB' },
    { n: 'QWEN 35B MOE', v: 'about 16 GB' },
    { n: 'GEMMA 26B MOE', v: 'about 16 GB' },
    { n: 'GEMMA E4B', v: 'about 5 GB' },
  ],
  small: 'llama.cpp, written for AMD cards with ROCm. One command sets it up, another frees the GPU. A small model is weaker than Claude on long jobs.',
};

export const install = {
  tag: '07 // INSTALL',
  heading: 'Three steps. About ten minutes.',
  lead: 'On a fresh Omarchy 4 install. Every step has a dry run and an undo.',
  steps: [
    { t: 'SIGN IN TO CLAUDE CODE', cmd: ['claude'], note: 'Log in once, then quit.' },
    { t: 'GET PHOSPHOR-OS', cmd: [CLONE_LINE], note: '' },
    {
      t: 'RUN THE SETUP',
      cmd: ['bash ~/phosphor-os/scripts/setup-linux.sh --dry-run   # see every step first', 'bash ~/phosphor-os/scripts/setup-linux.sh'],
      note: 'It installs the app, the voice engine, the desktop app, the server as a service, and the amber look. It asks before anything that needs sudo, and you can run it again safely. Then log out and in.',
    },
  ],
  guide: { label: 'FULL INSTALL GUIDE >', href: README_URL },
  undo: 'bash ~/phosphor-os/scripts/setup-linux.sh --undo',
};

export const faq = [
  { q: 'What do I need?', a: 'Omarchy 4 (Arch with Hyprland) and a Claude account logged in to Claude Code. The setup script installs Node 24 and the rest. A phone and a free Tailscale account are optional, and so is a GPU for local models.' },
  { q: 'What does it cost?', a: 'Phosphor-OS is free and open source. You pay Anthropic for your own Claude plan, the same as you do today. Phosphor-OS adds no fee and no account of its own.' },
  { q: 'Is it private and safe?', a: 'The server listens on 127.0.0.1 only and sits behind a password. For your phone it uses Tailscale, so only your own devices can reach it. It never uses Tailscale Funnel and never opens a port to the internet. Your chats stay on your PC and go to Anthropic exactly as they do in Claude Code. Phone alerts carry a tab name only, never chat text. Because the agent can run commands on your PC, Claude Code\'s approve and deny cards stay on.' },
  { q: 'Can I run a model on my own GPU?', a: 'Yes, optionally. Four local models sit in the same picker (Qwen and Gemma, on llama.cpp): the large ones want about 16 to 20 GB of video memory, the smallest about 5 GB. The setup is written for AMD cards with ROCm. A small local model is weaker than Claude on long, many-step jobs, so use it for quick work and privacy. Everything else works without it.' },
  { q: 'Does it run on Windows?', a: 'The app runs on Windows 10 and 11, in the browser or as a desktop app. The full operating system look is built on Omarchy, so that part is Linux only. macOS is not tested.' },
  { q: 'Which Claude plan do I need?', a: 'Any plan that includes Claude Code. Agents use a lot of it, so the plan meter on the HUD shows how much you have left, and the app can resume a job after a limit resets.' },
  { q: 'Can I change it?', a: 'Yes, that is the point. It is MIT licensed, plain files, and Claude Code can edit it for you. Ask for a new launcher command, a different bar or a bigger clock, and keep the undo script close.' },
];

export const footer = {
  end: { title: 'PHOSPHOR-OS', sub: 'THE AGENT OS.', line: 'OPEN SOURCE. BRING YOUR OWN CLAUDE CODE.' },
  l1: 'PHOSPHOR-OS // THE AGENT OS',
  l2: 'MIT licensed. Free to use, change and share.',
  l3: 'Built on Omarchy and Claude Code. Not affiliated with Anthropic.',
  last: 'Your own Anthropic account. Your own machine.',
  links: [
    { label: 'GITHUB', href: REPO_URL },
    { label: 'INSTALL GUIDE', href: README_URL },
    { label: 'LICENSE', href: LICENSE_URL },
  ],
};

// All site copy lives here. The page HTML is rendered from this file at build time (plugins/pages.js),
// so every word ships as real HTML and JS only adds motion on top.
// Rules: no em-dashes, no personal data, amber only. Change the repo link in ONE place: REPO_URL.

export const REPO_URL = 'https://github.com/CreativLLC/phosphor-os';
// GitHub Pages address derived from REPO_URL (owner.github.io/repo/). Used for the social card image only.
const [, OWNER, REPO] = REPO_URL.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
export const SITE_URL = OWNER ? `https://${OWNER.toLowerCase()}.github.io/${REPO}/` : './';
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
  { id: 'trailer', n: '--', label: 'TRANSMISSION' },
  { id: 'os', n: '02', label: 'THE WHOLE OS' },
  { id: 'beat', n: '03', label: 'NEVER MISS A BEAT' },
  { id: 'phone', n: '04', label: 'FROM YOUR PHONE' },
  { id: 'ask', n: '05', label: 'JUST ASK' },
  { id: 'gpu', n: '06', label: 'BRING YOUR OWN GPU' },
  { id: 'how', n: '07', label: 'HOW IT WORKS' },
  { id: 'install', n: '08', label: 'INSTALL' },
  { id: 'faq', n: '09', label: 'FAQ' },
];

export const hero = {
  eyebrow: 'PHOSPHOR-OS // OPEN SOURCE // MIT',
  wordmark: 'PHOSPHOR-OS',
  headline: 'THE AGENT OS.',
  alternates: ['LIVE IN YOUR AGENTS.', 'SEE EVERYTHING. ASK ANYTHING.'],
  sub: 'A full desktop built around Claude Code. Every screen, bar and notification shows what your agents are doing. Runs on your own machine and your own Anthropic account.',
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
  closer: 'Nothing here is a mock-up. It reads the same event stream Claude Code runs on.',
  note: 'Replay of a demo session. Fake data.',
};

// Demo-mode mission (fake data, matches the trailer captures).
export const mission = {
  task: 'ADD A PLUGIN SYSTEM',
  summary: 'Plugins add routes and hooks without touching the core. Five crew members work on it at once.',
  now: ['Read: src/app.ts', 'Grep: registerRoute', 'Edit: src/plugins/loader.ts', 'Bash: npm test', 'Write: docs/PLUGINS.md'],
  steps: ['Map the current routes', 'Design the plugin API', 'Build the plugin loader', 'Write the tests', 'Document it', 'Run the full suite'],
  crew: [
    { name: 'MAP EVERY ROUTE', kind: 'scout', model: 'HAIKU 5.5', type: 'Explore' },
    { name: 'DRAFT THE PLUGIN API', kind: 'architect', model: 'OPUS 5.5', type: 'Plan' },
    { name: 'BUILD THE LOADER', kind: 'engineer', model: 'SONNET 5.5', type: 'general-purpose' },
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

export const os = {
  tag: '02 // THE WHOLE OS',
  heading: 'Not an app. The whole desktop.',
  lead: 'A themed window on top of a normal desktop looks like a skin. Phosphor-OS changes the system itself, so nothing breaks the spell and nothing looks borrowed.',
  items: [
    { t: 'NOTIFICATIONS', d: 'Amber cards, stacked bottom right. A bell with a counter keeps what you have not dismissed.' },
    { t: 'THE BAR', d: 'Bottom taskbar with one button per window. A marker shows which app needs you.' },
    { t: 'THE LAUNCHER', d: 'Super + Space opens apps in the same look. Inside the app, one key searches apps, chats, files and commands.' },
    { t: 'FIREFOX', d: 'Tabs, address bar and menus in amber. The web matches the desktop.' },
    { t: 'THE SCREENSAVER', d: 'Grid flight, stars, a big clock and your crew on patrol. Any key wakes it.' },
    { t: 'THE CLOCK', d: 'Hover for quick toggles. Click for a calendar with your events under each day.' },
    { t: 'TERMINAL, FONT, WALLPAPER', d: 'One monospace font, one palette, one wallpaper, set once for everything.' },
  ],
  screens: [
    { id: 'saver', label: 'SCREENSAVER', w: 1280, h: 720 },
    { id: 'launcher', label: 'LAUNCHER', w: 960, h: 540 },
    { id: 'calendar', label: 'CLOCK + CALENDAR', w: 960, h: 698 },
    { id: 'sys', label: 'SYSTEM', w: 480, h: 1002 },
  ],
  footer: 'Amber only. One look, done properly.',
};

export const beat = {
  tag: '03 // NEVER MISS A BEAT',
  heading: 'Know the second it needs you.',
  lead: 'Run five chats at once and still know which one to open next.',
  blocks: [
    { t: 'DONE VS NEEDS YOU', d: 'Every chat tab shows its state in plain sight. Done is calm. Needs you pulses. You see it from across the room.' },
    { t: 'NOTIFICATIONS THAT WAIT', d: 'A finished job or a permission question becomes a notification. If you were away, it is still there, counted on the bell.' },
    { t: 'AUTO MODEL', d: 'Switch the picker to AUTO. A small fast model reads each message and picks the right model and thinking level for it. Quick questions stay cheap. Hard problems get the big model. You can see its choice on every reply.' },
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
  tag: '04 // FROM YOUR PHONE',
  heading: 'Same desk. In your pocket.',
  lead: 'Open the same screen on your phone. Check the job, answer a question, start the next one. It installs like an app and buzzes when an agent finishes or needs you.',
  points: [
    'Private by design: it travels over Tailscale, inside your own network. Never on the public internet.',
    'Same HUD, same chats, same tabs. The layout reshapes for a small screen.',
    'Fingerprint login. A long-lived session, so you are not typing a password on the bus.',
    'Dictate by voice. Speech turns to text on your own PC.',
  ],
  small: 'Needs a free Tailscale account (optional). The setup script turns on tailscale serve for you. It never turns on Funnel.',
};

export const ask = {
  tag: '05 // JUST ASK',
  heading: 'Want it different? Ask Claude Code.',
  lead: 'Phosphor-OS is plain files on your disk, and the agent in it can read them. Do not hunt for a settings page. Describe the change and watch it happen.',
  prompts: [
    { id: 'seconds', p: 'Make the clock on the bar show seconds.', r: 'Done. The bar clock now shows seconds.', file: 'os/omarchy/clock/Clock.qml' },
    { id: 'bell', p: 'Move the bell to the top right.', r: 'Moved. The bell sits top right now.', file: 'os/omarchy/bar/taskbar.qml' },
    { id: 'notes', p: 'Add a launcher command that opens my notes folder.', r: 'Added NOTES to the launcher.', file: 'web/src/launcher.ts' },
    { id: 'blink', p: 'Make the context bar blink when it is almost full.', r: 'Done. Past 90% it blinks.', file: 'web/src/theme.css' },
  ],
  closer: 'Your OS, written in the same language you already use to talk to it.',
  small: 'Changes to the desktop go into a pack with a dry-run mode and an undo. Ask Claude to keep it that way.',
  note: 'Illustrative prompts. Try one.',
};

export const gpu = {
  tag: '06 // BRING YOUR OWN GPU',
  heading: 'Run the model on your own card.',
  lead: 'Optional. If you have a capable GPU, pick a local model from the same picker. It answers on your machine, with no plan limit and no network.',
  points: [
    'Four local models in the picker (Qwen and Gemma), on llama.cpp.',
    'Tools, edits and permission cards work the same as with Claude.',
    'One command sets it up. Another turns it off and frees the GPU.',
    'Honest note: a small model is weaker than Claude on long, many-step jobs. Use it for quick work and privacy.',
  ],
  models: [
    { n: 'QWEN 27B', v: 'about 18 GB' },
    { n: 'QWEN 35B MOE', v: 'about 16 GB' },
    { n: 'GEMMA 26B MOE', v: 'about 16 GB' },
    { n: 'GEMMA E4B', v: 'about 5 GB' },
  ],
  small: 'Written for AMD cards with ROCm. The large models want about 16 to 20 GB of VRAM; the smallest needs about 5 GB. Everything works without it.',
};

export const how = {
  tag: '07 // HOW IT WORKS',
  heading: 'Three layers. All of them open.',
  lead: 'Phosphor-OS adds a look and a cockpit. It does not replace the engine.',
  layers: [
    { n: '03', t: 'PHOSPHOR-OS', role: 'THE COCKPIT', d: 'A small server on your own PC and a desktop app that show everything Claude Code is doing, live.' },
    { n: '02', t: 'CLAUDE CODE', role: 'THE ENGINE', d: 'The same tools, permissions, sessions, CLAUDE.md files and MCP servers you already use. Your agent is the real thing.' },
    { n: '01', t: 'OMARCHY', role: 'THE GROUND', d: 'Arch Linux with the Hyprland window manager, set up for people who like their desktop fast. Phosphor-OS ships an add-on pack: theme, bar, notifications, screensaver, keys. Every change is listed and can be undone.' },
  ],
  strip: 'YOUR PC // YOUR ANTHROPIC ACCOUNT // NO MIDDLEMAN',
  body: 'You sign in to Claude Code once, with your own Anthropic account. Phosphor-OS does not ask for a key and has no server of its own. It runs on your machine and reaches your agents through the Claude Agent SDK.',
};

export const install = {
  tag: '08 // INSTALL',
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

export const minor = [
  { t: 'CREW', d: 'Pixel-art sprites for every sub-agent, animated while they work.' },
  { t: 'TODAY', d: 'Your calendar and reminders in a side panel, read only.' },
  { t: 'DOCS', d: 'A Markdown editor in the same look, saved as plain files.' },
  { t: 'DICTATE', d: 'Press a key and talk. Speech to text on your own PC.' },
];

export const faq = [
  { q: 'What do I need?', a: 'Omarchy 4 (Arch with Hyprland) and a Claude account logged in to Claude Code. The setup script installs Node 24 and the rest. A phone and a free Tailscale account are optional, and so is a GPU for local models.' },
  { q: 'What does it cost?', a: 'Phosphor-OS is free and open source. You pay Anthropic for your own Claude plan, the same as you do today. Phosphor-OS adds no fee and no account of its own.' },
  { q: 'Is it private and safe?', a: 'The server listens on 127.0.0.1 only and sits behind a password. For your phone it uses Tailscale, so only your own devices can reach it. It never uses Tailscale Funnel and never opens a port to the internet. Your chats stay on your PC and go to Anthropic exactly as they do in Claude Code. Phone alerts carry a tab name only, never chat text. Because the agent can run commands on your PC, Claude Code\'s approve and deny cards stay on.' },
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

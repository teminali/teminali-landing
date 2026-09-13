/**
 * Every string on the page. Copy lives here so it can be reviewed as prose
 * rather than hunted through JSX.
 *
 * The page tells one story, top to bottom:
 *
 *   1. Hero         the promise: the whole loop, on your machine.
 *   2. Laptop rail  the loop shown: task → take → gateway → verified.
 *   3. Platform     each stage, argued.
 *   4. Studio hub   what is actually in the window.
 *   5. Demo CTA     go and try it.
 *   6. Process      four steps from install to release.
 *   7. Compare      against the stack of subscriptions it replaces.
 *   8. Mid CTA      tonight.
 *   9. About        why it exists.
 *  10. Mission      the one principle everything follows from.
 *  11. Roadmap CTA  the honest test.
 *  12. Stats        what ships today, measured.
 *  13. Contact      talk to us.
 *
 * Every figure quoted is read off the product's own README on the date noted
 * beside it. Nothing here is rounded up.
 */

import { shotUrl } from '@/lib/shots'

export const site = {
  name: 'Teminali OS',
  tagline: 'An autonomous studio, screen recorder and video editor that runs on your machine.',
  releaseUrl: 'https://github.com/teminali/releases/releases',
  version: 'v0.0.14',
  email: 'teminali@dukabotai.com',
}

export const nav = [
  { id: 'platform', label: 'Platform' },
  { id: 'studio', label: 'Studio' },
  { id: 'process', label: 'How it works' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export const hero = {
  title: 'Write the code, prove it works and film the demo. All of it on your machine.',
  body: [
    'Teminali OS is an autonomous studio, a screen recorder and a video editor in one desktop app. It plans and edits across your repository, runs the real tests, and cuts the walkthrough, with local models, local speech and nothing leaving the machine unless you send it.',
    'Hosted providers are one setting away when you want them. They are never required.',
  ],
}

/** The four scenes composited onto the laptop screen, in the order they play. */
export const scenes = [
  {
    id: 'agent',
    shot: 'copilot',
    icon: 'play',
    caption: 'Give it the task. Watch every step land in your repository.',
    alt: 'The video editor docked beside the chat, its program monitor playing a take over camera, cursor and screen tracks on the timeline.',
    float: {
      status: 'live',
      kicker: 'Agent running',
      title: 'Plan · edit · run · verify',
      sub: 'Project analysis',
      chips: ['2 steps', 'Frontier Auto'],
      slot: 'bottom-right',
    },
  },
  {
    id: 'video',
    shot: 'take',
    icon: 'video',
    caption: 'Stop recording and the take is already on a cut timeline.',
    alt: 'The recorder right after a take: the display and camera saved at 30 fps, the preview ready, and one click to open it on the timeline.',
    float: {
      status: 'ok',
      kicker: 'Take saved',
      title: 'Display + camera · 30 fps',
      sub: 'Its own sound · open on the timeline',
      slot: 'top-right',
    },
  },
  {
    id: 'route',
    shot: 'settings',
    icon: 'route',
    caption: 'Every request goes through one gateway you can read.',
    alt: 'Settings on the General pane: restore last session, the turn-complete and turn-failed notifications, and a note on where your code goes for each engine.',
    float: {
      status: 'ok',
      kicker: 'Privacy',
      title: 'Local lane over the loopback gateway',
      sub: 'Prompts and edits reach Ollama only',
      slot: 'top-right',
    },
  },
  {
    id: 'demo',
    shot: 'demo-poster',
    icon: 'play',
    /** The last scene is a player: the demo plays on the laptop screen and in
        the full-screen dialog. The shot is the studio's home screen. */
    video: { id: 'SNaN6GNDVlM', title: 'Teminali OS demo', start: 35 },
    caption: 'Watch it run, start to finish.',
    alt: 'The studio at rest: the mark, the composer set to Frontier Auto, and the recent projects, ready for the demo to start.',
    float: {
      status: 'ok',
      kicker: 'Demo video',
      title: 'Teminali OS demo · 4:17',
      sub: 'Plays on this screen or full screen',
      slot: 'bottom-right',
    },
  },
]

export const platform = {
  badge: 'What it does',
  title: 'One app for the loop you already run: write, record, cut, verify.',
  body: 'Most tools stop at the suggestion. Teminali OS keeps going, through the tests, the screen recording and the export, and shows its work at every step.',
  rows: [
    {
      tagline: 'The autonomous agent',
      title: 'It edits the repository, not a chat window',
      body: 'Point it at a project directory. The agent inspects, plans, edits across files, runs the terminal, and repairs what it broke, every step visible while it happens.',
      points: [
        { icon: 'git', text: 'Edits only the paths it declared, and refuses to report success until real verification passes.' },
        { icon: 'term', text: 'A real PTY terminal you and the agent both drive: dev servers, package managers, test suites.' },
        { icon: 'stack', text: 'Claude Code and Codex run as your own CLIs in the real workspace, with their own auth and sessions.' },
      ],
      cta: { label: 'See it run', href: '#studio' },
      figure: 'run',
    },
    {
      tagline: 'Screen recorder and video editor',
      title: 'Stop recording and the timeline is already cut',
      body: 'Press ⇧⌘8, record the screen, the camera and your voice. The take lands on a multi-track timeline with the zooms placed, the pointer drawn and the camera choreographed.',
      points: [
        { icon: 'scissors', text: 'Zoom moments detected from real clicks and keystrokes; the camera dodges the pointer and takes the frame while you explain.' },
        { icon: 'wave', text: 'The Video Copilot detects beats, places captions and cuts on silence, and is served over MCP to the same agent that wrote the code.' },
        { icon: 'film', text: 'Export H.264, HEVC or ProRes with the GPU encoder, at the resolution the preset names, straight to a file.' },
      ],
      cta: { label: 'Explore the editor', href: '#studio' },
      figure: 'editor',
    },
    {
      tagline: 'The routing gateway',
      title: 'Every request goes through one gateway you can read',
      body: 'A loopback gateway on 127.0.0.1 is the only thing the app talks to. Modes, lanes and adapters decide what answers; a run budget decides what it may cost.',
      points: [
        { icon: 'route', text: 'Flash, Auto and Max trade latency against depth without changing your prompt. Local models are the default lane.' },
        { icon: 'coins', text: 'An append-only usage ledger records every turn. A cost the provider did not report is null, never $0.00.' },
        { icon: 'lock', text: 'Keys are stored server-side at mode 0600 and never reach the renderer. No provider’s flagship is ever selected for you.' },
      ],
      cta: { label: 'How routing works', href: '#process' },
      figure: 'settings',
    },
    {
      tagline: 'Verification',
      title: 'Done means the real tests passed',
      body: 'An agent that writes code you cannot trust has saved you nothing. Every run ends against five runtimes, not a self-assessment, and a red run comes back red.',
      points: [
        { icon: 'check', text: 'Typecheck, unit, integration, build and browser checks. A missing runner is “unmeasured”, which cannot pass.' },
        { icon: 'eye', text: 'Visual diffs are exact pixel counts and colour deltas. Measurements, not a score.' },
        { icon: 'chart', text: 'Benchmarks run from fresh isolated workspaces with preregistered oracles; the sandbox’s git diff is the ground truth.' },
      ],
      cta: { label: 'See the four steps', href: '#process' },
      figure: 'verify',
    },
  ],
}

export const studio = {
  badge: 'Inside the studio',
  title: 'Thirteen panel kinds, one window, one loopback gateway.',
  body: 'Click a module. Everything below ships in the same desktop app and talks to the same local gateway on 127.0.0.1.',
  stats: ['13 panel kinds', '1 gateway', '127.0.0.1'],
  modules: [
    {
      id: 'agent-runner',
      label: 'Agent runner',
      icon: 'play',
      group: 'left',
      title: 'Agent runner',
      sub: 'Inspect → plan → edit → verify → repair → review → report',
      desc: 'Point the studio at any repository on disk. The agent plans, edits across files, runs commands in a real terminal and repairs its own mistakes, then hands back a diff you can read.',
      points: [
        'Edits only caller-declared paths and refuses to report success until verification passes',
        'Claude Code and Codex spawn as your own CLIs, in the real workspace, never at their most permissive rung',
        'Every tool call is a card in the conversation, with its arguments and its result',
      ],
    },
    {
      id: 'video-editor',
      label: 'Video editor',
      icon: 'video',
      group: 'right',
      title: 'Video editor',
      sub: 'A full timeline editor in a workspace panel',
      desc: 'Media library, program monitor, inspector and a multi-track timeline that keeps all twelve tools at every width. Save a project as a folder, export straight to a file.',
      points: [
        'Video, audio, kinetic text, LUT grading and keyframed transforms on any number of tracks',
        'Keyboard transport: play, step a frame, drop a marker, set in and out, loop',
        'Six editing tools served over MCP, so the agent that wrote the code can cut the take',
      ],
    },
    {
      id: 'screen-studio',
      label: 'Screen recorder',
      icon: 'screen',
      group: 'left',
      title: 'Screen recorder',
      sub: 'A dialog, not a panel. Press ⇧⌘8',
      desc: 'Screen, camera and microphone, written to disk in chunks so a twenty-minute take never lives in memory. Global stop, pause and mark shortcuts while it runs.',
      points: [
        'A 30Hz cursor track and keystroke timing, sealed with AES-GCM beside the take',
        'Zooms, pointer, cinematic frame, click ticks and markers assembled in one undoable step',
        'The camera dodges the pointer and takes the whole frame while you explain',
      ],
    },
    {
      id: 'routing-gateway',
      label: 'Routing gateway',
      icon: 'route',
      group: 'left',
      title: 'Routing gateway',
      sub: 'Bound to 127.0.0.1. Refuses any other host.',
      desc: 'Roughly sixty routes behind one bearer token. Local models through Ollama, your agent CLIs, hosted providers with light and heavy lanes, and a budget that stops a loop from quietly costing you.',
      points: [
        'Flash, Auto and Max modes; the heavy lane ranks by parameter count and refuses anything under 10 tok/s',
        'Anthropic, OpenAI and Google available; no flagship is ever selected automatically',
        'An audit log of metadata only: never prompts, never transcripts',
      ],
    },
    {
      id: 'guardian-security',
      label: 'Guardian',
      icon: 'shield',
      group: 'left',
      title: 'Guardian',
      sub: 'What the machine is holding, right now',
      desc: 'Resident models, real unified-memory footprint and pressure. Every number is measured or it is null. A metric that could not be read is never drawn as a plausible zero.',
      points: [
        'Auto-unload evicts an idle or superseded model. Reversible; destroys no work',
        'The governor quits applications gracefully only, never with a signal, never the one you are using',
        'Media imports are grants: a denied path never becomes a prompt',
      ],
    },
    {
      id: 'verification',
      label: 'Verification',
      icon: 'check',
      group: 'right',
      title: 'Five verification runtimes',
      sub: 'Fail closed. A missing runner cannot pass.',
      desc: 'Typecheck, unit, integration, build and browser commands, run for real. Visual comparison reports exact differing-pixel counts. Performance records what Ollama actually measured.',
      points: [
        'Agent, quality, visual, performance and MCP runtimes, each dependency-free Node',
        'Failures come back with the output attached. A red run is reported red',
        'The benchmark arena judges from the sandbox’s git diff, not the transcript',
      ],
    },
    {
      id: 'browser-devtools',
      label: 'Browser',
      icon: 'browser',
      group: 'right',
      title: 'Browser and canvas',
      sub: 'The page you are building, beside the agent building it',
      desc: 'A browser panel and a canvas panel in the same tab strip as the terminal, so the loop closes without leaving the window.',
      points: [
        'Open the dev server in a tab the agent can see',
        'Screen understanding runs locally on a 2B vision model; positions come from the accessibility tree, never a guess',
        'Drop files of any kind: video is transcribed, PDFs are read, images are described',
      ],
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: 'term',
      group: 'right',
      title: 'Terminal',
      sub: 'A real PTY, shared with the agent',
      desc: 'zsh or bash with truecolor, in a panel you can split, so the same shell that runs your dev server runs the agent’s tests.',
      points: [
        'Background processes with streaming logs and task control',
        'Works fully offline with local models when the network is gone',
        'Every command the agent runs is visible before it lands',
      ],
    },
    {
      id: 'voice-speech',
      label: 'Voice & screen',
      icon: 'mic',
      group: 'right',
      title: 'Voice and the screen assistant',
      sub: 'Hold the hotkey. It looks, it listens, it acts.',
      desc: 'whisper.cpp for recognition, the system voice for synthesis, all local. Dictate into the composer, talk it through what is on screen, or let it click, type and open apps.',
      points: [
        'Every utterance passes a repair step you see before it sends',
        'Dictate, talk or agent: three modes and three autonomy rungs, one switch apart',
        'Actions are re-checked against the observation they name; a changed window is refused',
      ],
    },
    {
      id: 'skills-mcp',
      label: 'Skills & MCP',
      icon: 'stack',
      group: 'left',
      title: 'Skills and MCP',
      sub: 'Teach it your stack',
      desc: 'Mount specialist skills into the runner, and wire MCP servers into the tab that spawned the agent, including the studio’s own video editor.',
      points: [
        'A skills sidebar view, with website-builder and the video copilot shipped',
        'A cut server that gives Claude Code and Codex six editing tools',
        'An MCP proxy route through the same gateway, under the same token',
      ],
    },
  ],
}

export const demoCta = {
  title: 'Take it for a run on a repository you know',
  body: 'Install it, give it a task you could grade yourself, and read the diff. Then record the walkthrough without opening anything else.',
  placeholder: 'you@company.com',
  action: 'Get the build',
}

export const process = {
  badge: 'How it works',
  title: 'From install to a shipped release, without leaving the window',
  body: 'No account to create, no repository to upload, no queue to wait on. One download and the loop runs on the hardware in front of you.',
  steps: [
    {
      n: '01',
      title: 'Install it and open a project',
      body: [
        'One desktop app for macOS, Windows and Linux. It brings its own gateway, video engine and verification runtimes.',
        'Point it at any directory on disk. Nothing is uploaded to start, and nothing has to be configured before it runs.',
      ],
    },
    {
      n: '02',
      title: 'Give it the task and watch',
      body: [
        'Pick Flash for speed, Auto for balance or Max for depth. Local models take the first lane.',
        'The agent plans, edits across files and runs the terminal, each step shown as it happens.',
      ],
    },
    {
      n: '03',
      title: 'Record the walkthrough',
      body: [
        'Press ⇧⌘8. Screen, camera and voice land on a timeline already cut: zooms placed, pointer drawn, camera choreographed.',
        'Let the Copilot match beats and place captions, or hand the timeline to the same agent over MCP.',
      ],
    },
    {
      n: '04',
      title: 'Verify, export and ship',
      body: [
        'Types, tests, build and lint run against the real project. A red run is reported red, with the output attached.',
        'Export the demo with the GPU encoder and merge the change in one sitting.',
      ],
    },
  ],
}

export const compare = {
  badge: 'The difference',
  title: 'Why one local studio beats four subscriptions',
  sub: 'Teminali OS against the stack you are juggling now',
  body: 'A hosted assistant, a screen recorder, a video editor and somewhere to keep it all. Each one good at its piece; none of them knows about the others, and every one of them wants your source.',
  ours: [
    'Studio, screen recorder and timeline editor in one window, on one loopback gateway.',
    'Your source stays on the machine. Local models and local speech are the first lane, not a fallback.',
    'The take lands already cut. Beats matched, captions placed, camera choreographed, export ready.',
    'Verification runs against your real toolchain and reports the actual output, failures included.',
    'Every request and its cost is in a ledger you can open. Unreported is null, never $0.00.',
    'Runs offline. Hosted providers are opt-in per run and never selected for you.',
  ],
  theirs: [
    'Four subscriptions, four logins, four places the work has to be moved between.',
    'Your repository and your recordings uploaded before a single token comes back.',
    'Manual zooms, manual captions, manual exports, and a plugin that broke on the last update.',
    'A green tick that means the model believes it worked.',
    'Costs discovered at the end of the month, in someone else’s dashboard.',
    'Nothing works on the plane.',
  ],
}

export const midCta = {
  title: 'Put it on your machine tonight.',
  body: 'The current release is free to download, runs offline, and sends nothing anywhere by default.',
  placeholder: 'you@company.com',
  action: 'Get the build',
}

export const about = {
  badge: 'About',
  title: 'Built by people who were tired of the gap',
  body: 'Teminali OS came out of years of using developer and creator tools that were each excellent at their piece and useless at the seams between them.',
  rows: [
    {
      title: 'The gap we kept hitting',
      body: [
        'Assistants got very good at writing code and stayed bad at three things that matter more: knowing whether the code works, running where the code already lives, and being honest when a run fails.',
        'Turning that code into a demo meant leaving the editor: a recording app, an editing suite, subtitles typed by hand, and a separate invoice for each.',
      ],
      bullets: [
        'Suggestions you still had to verify by hand',
        'Source uploaded before a single token came back',
        'Four tools switched between to demo one feature',
        'Costs discovered at the end of the month',
        'A model choice you could neither see nor change',
      ],
      cta: { label: 'Read the principle', href: '#mission' },
      figure: 'verify',
    },
    {
      title: 'What we built instead',
      body: [
        'One desktop app: an agent that edits and tests the code, a recorder that hands its take to a timeline already cut, and an editor that exports it. All behind a gateway that never binds off 127.0.0.1.',
        'Local is the default because it is the honest default. Hosted providers are one setting away when a task genuinely needs them.',
        'It is versioned, released in the open, and updates itself from a public repository with no credential.',
      ],
      cta: { label: 'View releases', href: 'https://github.com/teminali/releases/releases' },
      figure: 'copilot',
    },
  ],
}

export const mission = {
  badge: 'The principle',
  title: 'An agent you cannot verify is an agent you cannot use.',
  lead: 'Everything in the product follows from that one line.',
  cols: [
    'Verification is not a feature added at the end. It is why the five runtimes exist, why benchmarks ship with preregistrations and oracles, and why a failing run comes back with its output attached rather than a summary of it.',
    'Running locally follows from the same idea. You cannot audit what you cannot see, and you cannot see a request made on someone else’s machine on your behalf. So the gateway binds to loopback, the ledger is append-only, and a number that could not be measured is null.',
  ],
  cards: [
    {
      icon: 'check',
      title: 'Report what happened',
      body: 'If tests fail, the run says so and shows the output. A skipped step is reported as skipped. A missing runner is unmeasured. There is no partial credit.',
    },
    {
      icon: 'shield',
      title: 'Local is the default',
      body: 'Local models, local speech, local screen understanding, local video. Hosted providers are available, opt-in per run, and never required to get work done.',
    },
    {
      icon: 'film',
      title: 'One loop, one window',
      body: 'Write, record, cut and verify in the same app, so the demo is made by the same hands and the same gateway that made the change.',
    },
  ],
}

export const roadmapCta = {
  title: 'Not sure it fits your stack?',
  sub: 'Try it on one repository',
  body: 'Install it, point it at a project you know well, and give it a task or a cut you can grade yourself. That is the fastest honest answer, and it takes an evening.',
  placeholder: 'you@company.com',
  action: 'Get the build',
}

/** SNAPSHOT: read off the product READMEs on 2026-09-11. */
export const stats = {
  title: 'What ships today',
  figures: [
    { value: '3,097', label: 'tests green on every build: 2,954 in the studio, 143 in the gateway and runner. No skips.' },
    { value: '13', label: 'workspace panel kinds: file, terminal, browser, canvas, guardian, video editor, agent CLIs and more.' },
    { value: '5', label: 'verification runtimes: agent, quality, visual, performance and MCP. Each one dependency-free.' },
    { value: '127.0.0.1', label: 'is the only host the gateway will bind to. It refuses every other one.' },
    { value: '$0.00', label: 'for local models, local voice, beat detection and on-device transcription. A cost it cannot read is null.' },
    { value: '3 platforms', label: 'macOS on Apple Silicon and Intel, Windows, and Linux. One release, three installers.' },
  ],
}

export const contact = {
  title: 'Contact Us',
  body: 'Questions about running it in your environment, or something that broke. Both welcome.',
  quickTitle: 'Quick Contact',
  quick: [
    { kind: 'mail', label: 'teminali@dukabotai.com', href: 'mailto:teminali@dukabotai.com' },
    { kind: 'github', label: 'github.com/teminali/releases', href: 'https://github.com/teminali/releases' },
  ],
  fields: [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'company', label: 'Company', type: 'text', required: false },
    { name: 'role', label: 'Position', type: 'text', required: false },
  ],
  message: 'Your Message',
  send: 'Send',
  sending: 'Sending',
  sent: 'Thank you. Your message is on its way, and a reply will come to the address you gave.',
  failed: 'That did not send. Try again, or write to teminali@dukabotai.com directly.',
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Licence', href: '#' },
  ],
}

export const downloads = {
  kicker: 'Downloads',
  title: 'Download Teminali OS',
  body: 'The full studio, video editor, routing gateway, and all five verification runtimes. One install, no cloud account, nothing to configure before it runs.',
  secondary: { label: 'All releases on GitHub', href: site.releaseUrl },

  /* Indicative sizes only: they were measured on the last pre-0.0.1 build, and
     the live release's real asset sizes overwrite them on load. A platform the
     live release has no asset for says so instead — see `absent` in
     sections/downloads.tsx. These numbers are a placeholder for a build that
     has not been READ yet, never a claim that one exists. */
  platforms: [
    { id: 'mac-arm', name: 'macOS', arch: 'Apple Silicon', ext: '.dmg', size: '193 MB', asset: /(arm64|aarch64|apple.?silicon).*\.dmg$/i },
    { id: 'mac-x64', name: 'macOS', arch: 'Intel', ext: '.dmg', size: '201 MB', asset: /(x64|x86_64|intel).*\.dmg$/i },
    { id: 'win', name: 'Windows', arch: 'x64', ext: '.exe', size: '161 MB', asset: /\.exe$/i },
    { id: 'linux', name: 'Linux', arch: 'x86_64', ext: '.AppImage', size: '386 MB', asset: /\.AppImage$/i },
  ],

  recommended: {
    kicker: 'Recommended for this computer',
    note: 'Read from your browser. Not this machine? Every build is below.',
  },

  mac: {
    kicker: 'First launch on macOS',
    title: 'The first time you open it, macOS will ask',
    body: 'Teminali OS is not notarized by Apple yet, so the first time you open it macOS shows a dialog saying it cannot verify the developer. The only buttons it offers are Done and Move to Bin. That is expected, the app is safe, and clearing it takes about thirty seconds.',
    once: 'This happens once, ever. Every launch after it is normal.',
    steps: [
      {
        n: '01',
        title: 'Open the app once, then click Done',
        body: 'Double-click Teminali OS in Applications. When the dialog appears, click Done. Do not click Move to Bin — that deletes the app and you would have to download it again.',
        figure: 'The first-launch dialog. Done, not Move to Bin.',
        image: shotUrl('mac-01-blocked'),
      },
      {
        n: '02',
        title: 'Open System Settings, then Privacy & Security',
        body: 'Scroll down to the Security heading. You will see a line reading “Teminali OS was blocked to protect your Mac.” Click Open Anyway next to it.',
        figure: 'Privacy & Security, Security section, with Open Anyway',
        image: shotUrl('mac-02-open-anyway'),
      },
      {
        n: '03',
        title: 'Click Open Anyway again — the middle button',
        body: 'macOS asks a second time, and this dialog is the one to read carefully: Move to Bin is the highlighted blue button, so pressing Return here deletes the app. Click Open Anyway, the second button down.',
        figure: 'The second dialog. Move to Bin is the default — do not press Return.',
        image: shotUrl('mac-03-confirm'),
      },
      {
        n: '04',
        title: 'Confirm with Touch ID or your password',
        body: 'macOS asks an administrator to authorise it. Use Touch ID, or click Use Password and enter your login password. The app opens straight away, and it will keep opening normally from then on.',
        figure: 'The administrator confirmation prompt',
        image: shotUrl('mac-04-authorise'),
      },
    ],
    note: 'Right-click → Open does not work on macOS 15 and later. Use the steps above.',
    closing: 'This goes away in an upcoming release, once the app is signed with an Apple Developer ID.',
  },

  terminal: {
    summary: 'Advanced: install from the terminal',
    body: 'Installs to /Applications without the first-launch dialog.',
    command: 'curl -fsSL https://<your-domain>/install.sh | sh',
    pending: 'install.sh is not published yet. The domain above is a placeholder until it is.',
  },

  verify: {
    kicker: 'Verify your download',
    body: 'Every release publishes a sha256 for each asset. Compare it against the file you downloaded:',
    command: 'shasum -a 256 <file>',
    empty: 'Checksums are published with each release on GitHub.',
  },

  requirements: {
    kicker: 'System requirements',
    rows: [
      { k: 'macOS', v: 'macOS 11 Big Sur or later. Apple Silicon and Intel.' },
      { k: 'Windows', v: 'Windows 10 or later, 64-bit.' },
      { k: 'Linux', v: 'A modern 64-bit distribution with FUSE for AppImage (libfuse2 on Ubuntu 22.04 and later).' },
      { k: 'Disk', v: 'About 1 GB for the app. Local models are downloaded separately and sized by you.' },
      { k: 'Network', v: 'Only to download the app and any models. The studio itself runs offline.' },
    ],
  },
}

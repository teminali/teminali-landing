/**
 * Every string on the page. Copy lives here so it can be reviewed as prose
 * rather than hunted through JSX.
 *
 * Claims are grounded in frontier/README.md and the verification run recorded
 * in the 2026-09-02 handover. Anything numeric is marked SNAPSHOT — those were
 * true when measured and must be re-confirmed before the site goes public.
 */

export const site = {
  name: 'Teminali Code',
  tagline: 'An autonomous AI code studio that runs on your machine.',
  releaseUrl: 'https://github.com/teminali/teminalicode/releases',
  version: 'v1.1.6',
  email: 'hello@teminali.com',
}

export const nav = [
  { id: 'platform', label: 'Platform' },
  { id: 'studio', label: 'Studio' },
  { id: 'process', label: 'How it works' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export const hero = {
  title: 'An autonomous code studio that runs where your code already lives',
  body: [
    'Teminali Code plans, writes and verifies changes on your own machine. Local models, local speech, local screen understanding.',
    'Hosted providers are available the moment you want them, and required at no point. Nothing leaves the machine unless you send it.',
  ],
}

/** The three scene groups composited onto the laptop screen. */
export const scenes = [
  {
    id: 'scene-1',
    caption: 'Watch the agent work, step by step',
    kicker: 'The studio',
    detail: { title: 'Run', rows: ['Plan drafted', 'Editing 4 files', 'Tests queued'] },
  },
  {
    id: 'scene-2',
    caption: 'Route every task to the right model',
    kicker: 'The gateway',
    detail: { title: 'Route', rows: ['Flash · local', 'Auto · balanced', 'Max · deep'] },
  },
  {
    id: 'scene-3',
    caption: 'Verify the work before you merge it',
    kicker: 'Verification',
    detail: { title: 'Verify', rows: ['Types clean', 'Tests 610/610', 'Build passed'] },
  },
]

export const platform = {
  badge: 'The platform',
  title: 'Everything the agent needs to do real work, running under your own roof',
  body: 'A desktop studio, a routing gateway and five verification runtimes. One install, no cloud account, no telemetry you did not opt into.',
  rows: [
    {
      kicker: 'Local first',
      title: 'Your code never has to leave the machine',
      body: 'The studio ships as a desktop application with its own gateway. Models, speech and screen understanding all run locally by default.',
      points: [
        'Local models do the work by default. Hosted providers are available and never required.',
        'Speech and screen understanding run on-device, so a voice instruction is not a network request.',
        'The gateway is yours. It runs beside the app, on a port you control.',
      ],
      cta: { label: 'Download for macOS', href: '/downloads' },
      figure: 'studio',
    },
    {
      kicker: 'The routing gateway',
      title: 'One gateway in front of every model',
      body: 'Profiles, lane files and provider adapters decide what runs where. A quota pool and a run budget stop a long agent loop from quietly costing you money.',
      points: [
        'Three modes — Flash, Auto and Max — trade latency against depth without changing your prompt.',
        'Provider adapters put local and hosted models behind one interface, so switching is a config change.',
        'A run budget caps spend per task; the quota pool shares headroom across concurrent runs.',
      ],
      cta: { label: 'Read the gateway design', href: '#process' },
      figure: 'gateway',
    },
    {
      kicker: 'Verification',
      title: 'Five runtimes that check the work before you do',
      body: 'An agent that writes code you cannot trust has not saved you anything. Every run ends against real runtimes, not a self-assessment.',
      points: [
        'Types, tests, build and lint run for real. The agent reports what happened, not what it hoped.',
        'Seven benchmark fixtures ship with preregistrations and oracles, so a score cannot be tuned after the fact.',
        'Failures come back with the output attached. A red run is reported red.',
      ],
      cta: { label: 'See how it works', href: '#process' },
      figure: 'verify',
    },
  ],
}

export const studio = {
  badge: 'The studio',
  title: 'One window for the whole loop — plan, edit, run, verify.',
  body: 'Every module below ships in the desktop app. Nothing here is a separate purchase.',
  modules: [
    { label: 'Agent runner', icon: 'play' },
    { label: 'Routing gateway', icon: 'route' },
    { label: 'Verification', icon: 'check' },
    { label: 'Skills', icon: 'stack' },
    { label: 'Benchmarks', icon: 'chart' },
    { label: 'Voice', icon: 'mic' },
    { label: 'Screen', icon: 'eye' },
    { label: 'Terminal', icon: 'term' },
  ],
}

export const demoCta = {
  title: 'Take Teminali Code for a run',
  body: 'Install it, point it at a repository you already know, and give it something you would otherwise do by hand.',
  placeholder: 'you@company.com',
  action: 'Get the build',
}

export const process = {
  badge: 'How it works',
  title: 'Four steps to a verified change',
  body: 'No account to create, no repository to upload, no waiting on a queue.',
  steps: [
    {
      n: '01',
      title: 'Install the studio',
      body: [
        'One desktop application. It brings its own gateway and its own runtimes.',
        'Point it at a project directory on disk. Nothing is uploaded to start.',
      ],
    },
    {
      n: '02',
      title: 'Choose what runs where',
      body: [
        'Pick a mode — Flash for speed, Auto for balance, Max for depth.',
        'Add hosted providers if you want them. Local models are the default and stay the default.',
      ],
    },
    {
      n: '03',
      title: 'Give it the task',
      body: [
        'Describe the change in a sentence, by keyboard or by voice.',
        'The agent plans, edits across files, and runs commands while you watch each step.',
      ],
    },
    {
      n: '04',
      title: 'Verify, then merge',
      body: [
        'Types, tests and the build run against your real project before the work is handed back.',
        'You get the diff and the run output together, so the decision to merge is yours.',
      ],
    },
  ],
}

export const compare = {
  badge: 'The difference',
  title: 'Why run it locally?',
  sub: 'Teminali Code against a cloud-only assistant',
  body: 'Both write code. Only one of them does it without shipping your repository somewhere else first.',
  ours: [
    'Your source stays on the machine. Local models are the default path, not a fallback.',
    'The gateway runs beside the app on a port you control, so you can see every call it makes.',
    'Voice and screen understanding are on-device. An instruction is not a request to a third party.',
    'Verification runs against your real toolchain and reports the actual output, failures included.',
    'A run budget and quota pool cap what a long agent loop can spend.',
  ],
  theirs: [
    'Your repository is uploaded before the first suggestion arrives.',
    'The routing is opaque. You cannot see which model answered or what it was sent.',
    'Audio and screen capture leave the device to be processed.',
    'Self-reported success. The model grades its own work and you find out at review.',
    'Usage is metered by someone else, and a runaway loop is billed after the fact.',
  ],
}

export const midCta = {
  title: 'Put it on your machine tonight',
  body: 'The current release is free to download and runs offline.',
  placeholder: 'you@company.com',
  action: 'Get the build',
}

export const about = {
  badge: 'About',
  title: 'Built by people who wanted this to exist',
  body: 'Teminali Code came out of using every other option and finding the same gap in each.',
  rows: [
    {
      title: 'The gap we kept hitting',
      body: [
        'Assistants got very good at writing code and stayed bad at three things that matter more: knowing whether the code works, running where the code already lives, and being honest when a run fails.',
      ],
      bullets: [
        'Suggestions you still have to verify by hand',
        'Source uploaded before a single token comes back',
        'Green reported on a red run',
        'Costs discovered at the end of the month',
        'A model choice you cannot see or change',
      ],
      figure: 'left',
    },
    {
      title: 'What we built instead',
      body: [
        'A studio that runs on the machine, a gateway you can point anywhere, and verification that runs for real before anything is handed back.',
        'Local is the default because it is the honest default. Hosted providers are one setting away when a task genuinely needs them.',
        'The whole thing ships as one desktop application, versioned and released in the open.',
      ],
      cta: { label: 'Read the source', href: 'https://github.com/teminali/teminalicode' },
      figure: 'right',
    },
  ],
}

export const mission = {
  badge: 'The principle',
  title: 'An agent you cannot verify is an agent you cannot use.',
  lead: 'Everything here follows from that one line.',
  cols: [
    'Verification is not a feature we added at the end. It is the reason the runtimes exist, why benchmarks ship with preregistrations and oracles, and why a failing run comes back with its output attached rather than a summary.',
    'Running locally follows from the same idea. You cannot audit what you cannot see, and you cannot see a request that was made on someone else’s machine on your behalf.',
  ],
  cards: [
    {
      title: 'Report what happened',
      body: 'If tests fail, the run says so and shows the output. A skipped step is reported as skipped. There is no partial credit.',
      icon: 'check',
    },
    {
      title: 'Local is the default',
      body: 'Local models, local speech, local screen understanding. Hosted providers are available and never required to get work done.',
      icon: 'shield',
    },
    {
      title: 'Nothing hidden',
      body: 'The gateway, the routing, the budget and the runtimes are all inspectable. The source is public and the releases are versioned.',
      icon: 'eye',
    },
  ],
}

export const roadmapCta = {
  title: 'Not sure it fits your stack?',
  sub: 'Try it on one repository',
  body: 'Install it, point it at a project you know well, and give it a task you can grade yourself. That is the fastest honest answer.',
  placeholder: 'you@company.com',
  action: 'Get the build',
}

/** SNAPSHOT — measured 2026-09-02. Re-confirm before publishing. */
export const stats = {
  title: 'What ships today',
  figures: [
    { value: '610', label: 'tests green across the studio and the core, run on every build.' },
    { value: '62', label: 'gateway routes, each documented against the dispatcher that serves it.' },
    { value: '5', label: 'verification runtimes. Types, tests, build, lint and the benchmark harness.' },
    { value: '7', label: 'benchmark fixtures with preregistrations and oracles, so scores cannot be tuned after the fact.' },
    { value: '3', label: 'model modes — Flash, Auto and Max — switchable without touching your prompt.' },
    { value: 'Zero', label: 'code sent anywhere by default. Hosted providers are opt-in, per run.' },
  ],
}

export const contact = {
  title: 'Contact',
  body: 'Questions about running it in your environment, or something that broke. Both welcome.',
  quick: [
    { kind: 'mail', label: 'hello@teminali.com', href: 'mailto:hello@teminali.com' },
    { kind: 'github', label: 'github.com/teminali', href: 'https://github.com/teminali' },
  ],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'company', label: 'Company', type: 'text', required: false },
    { name: 'role', label: 'Role', type: 'text', required: false },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Licence', href: '#' },
  ],
}

/**
 * The Downloads page. Version, sizes and checksums are filled in at runtime
 * from the GitHub releases API (see `useRelease`), so nothing here goes stale
 * on a release; the values below are the fallback shown when that call cannot
 * be made — an offline visitor, a rate limit, or the repo still being private.
 */
export const downloads = {
  kicker: 'Downloads',
  title: 'Download Teminali Code',
  body: 'The full studio, the routing gateway and all five verification runtimes. One install, no cloud account, nothing to configure before it runs.',
  secondary: { label: 'All releases on GitHub', href: site.releaseUrl },

  /** `match` is tested against the platform we detect, `asset` against the
   *  release asset filenames. Sizes are the fallback only. */
  platforms: [
    { id: 'mac-arm', name: 'macOS', arch: 'Apple Silicon', ext: '.dmg', size: '118 MB', match: 'mac-arm', asset: /(arm64|aarch64|apple.?silicon).*\.dmg$/i },
    { id: 'mac-x64', name: 'macOS', arch: 'Intel', ext: '.dmg', size: '124 MB', match: 'mac-x64', asset: /(x64|x86_64|intel).*\.dmg$/i },
    { id: 'win', name: 'Windows', arch: 'x64', ext: '.exe', size: '96 MB', match: 'win', asset: /\.exe$/i },
    { id: 'linux', name: 'Linux', arch: 'x86_64', ext: '.AppImage', size: '132 MB', match: 'linux', asset: /\.AppImage$/i },
  ],

  /** The most important section on the page. Calm, not a warning. */
  mac: {
    kicker: 'First launch on macOS',
    title: 'The first time you open it, macOS will ask',
    body: 'Teminali Code is not notarized by Apple yet, so the first time you open it macOS shows a dialog saying it cannot verify the developer. The only buttons it offers are Done and Move to Bin. That is expected, the app is safe, and clearing it takes about ten seconds.',
    once: 'This happens once, ever. Every launch after it is normal.',
    steps: [
      {
        n: '01',
        title: 'Open the app once, then click Done',
        body: 'Double-click Teminali Code in Applications. When the dialog appears, click Done. Do not click Move to Bin — that deletes the app and you would have to download it again.',
        figure: 'The macOS dialog, with Done and Move to Bin',
      },
      {
        n: '02',
        title: 'Open System Settings, then Privacy & Security',
        body: 'Scroll down to the Security heading. You will see a line reading “Teminali Code was blocked to protect your Mac.” Click Open Anyway next to it.',
        figure: 'Privacy & Security, showing Open Anyway',
      },
      {
        n: '03',
        title: 'Confirm with Touch ID or your password',
        body: 'macOS asks you to confirm. The app opens straight away, and it will keep opening normally from then on.',
        figure: 'The Touch ID confirmation prompt',
      },
    ],
    note: 'Right-click → Open does not work on macOS 15 and later. Use the steps above.',
    closing: 'This goes away in an upcoming release, once the app is signed with an Apple Developer ID.',
  },

  terminal: {
    summary: 'Advanced: install from the terminal',
    body: 'Installs to /Applications without the first-launch dialog.',
    command: 'curl -fsSL https://<your-domain>/install.sh | sh',
    pending: 'install.sh is not published yet — the domain above is a placeholder until it is.',
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
      { k: 'Linux', v: 'A modern 64-bit distribution with FUSE for AppImage.' },
      { k: 'Disk', v: 'About 1 GB for the app. Local models are downloaded separately and sized by you.' },
      { k: 'Network', v: 'Only to download the app and any models. The studio itself runs offline.' },
    ],
  },
}

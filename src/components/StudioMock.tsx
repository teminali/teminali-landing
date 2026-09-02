/**
 * The Teminali Code studio, drawn in DOM.
 *
 * The reference composites real product screenshots onto the laptop screen. We
 * draw ours instead: it stays sharp at every scale the dolly passes through,
 * weighs nothing, and cannot go stale against a build. Every size below is in
 * `em`, and the overlay sets 1em = 1% of the screen width, so the whole mock
 * scales with the laptop rather than being re-laid-out.
 */

const rail = [
  { icon: 'M3 4h10M3 8h10M3 12h6', label: 'Session' },
  { icon: 'M8 2v12M2 8h12', label: 'New' },
  { icon: 'M2 8h4l2-4 3 8 2-4h1', label: 'Runs' },
  { icon: 'M3 3h10v10H3z', label: 'Files' },
]

function Chrome({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-[1.2em] border-b border-[#262626] bg-[#181818] px-[1.6em] py-[1.1em]">
      <div className="flex gap-[0.6em]">
        {['#3a3a3a', '#313131', '#2a2a2a'].map((c) => (
          <span key={c} className="h-[0.85em] w-[0.85em] rounded-full" style={{ background: c }} />
        ))}
      </div>
      <div className="ml-[1em] flex-1 truncate rounded-[0.4em] border border-[#262626] bg-[#151515] px-[1.2em] py-[0.5em] text-[1.15em] text-[#6b6b6b]">
        {title}
      </div>
    </div>
  )
}

function Rail() {
  return (
    <div className="flex w-[7em] shrink-0 flex-col items-center gap-[1.6em] border-r border-[#262626] bg-[#181818] py-[1.8em]">
      {/* The app wears its own mark, same three paths as `public/favicon.svg`. */}
      <div className="flex w-full flex-col items-center gap-[1.6em]">
        <svg
          viewBox="0 0 32 32"
          className="h-[3.2em] w-[3.2em]"
          fill="none"
          stroke="#65c466"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6.56 12.13 10.06 16 6.56 19.88" />
          <path d="M12.25 19.88h7.5" />
          <path d="M25.44 12.13 21.94 16 25.44 19.88" />
        </svg>
        <span className="h-px w-[3.4em] bg-[#262626]" />
      </div>
      {rail.map((r, i) => (
        <div key={r.label} className="flex flex-col items-center gap-[0.4em]">
          <span
            className="grid h-[3em] w-[3em] place-items-center rounded-[0.6em] border"
            style={{
              borderColor: i === 0 ? '#313131' : 'transparent',
              background: i === 0 ? '#262626' : 'transparent',
              color: i === 0 ? '#ededed' : '#6b6b6b',
            }}
          >
            <svg viewBox="0 0 16 16" className="h-[1.6em] w-[1.6em]" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round">
              <path d={r.icon} />
            </svg>
          </span>
          <span className="text-[0.85em] text-[#5a5a5a]">{r.label}</span>
        </div>
      ))}
    </div>
  )
}

function Bar({ w, tone = '#262626' }: { w: string; tone?: string }) {
  return <span className="block h-[0.7em] rounded-full" style={{ width: w, background: tone }} />
}

/* ---------------------------------------------------------------- scene 1 ---
   The agent working: a plan on the left, a live diff on the right. */
function SceneRun() {
  const steps = [
    { s: 'done', t: 'Read the failing spec' },
    { s: 'done', t: 'Locate the dispatcher' },
    { s: 'run', t: 'Edit 4 files' },
    { s: 'wait', t: 'Run the test suite' },
    { s: 'wait', t: 'Report the diff' },
  ]
  return (
    <div className="flex h-full">
      <div className="flex w-[38%] shrink-0 flex-col border-r border-[#262626] p-[1.8em]">
        <div className="text-[1em] uppercase tracking-[0.16em] text-[#6b6b6b]">Plan</div>
        <div className="mt-[1.4em] flex flex-col gap-[1.15em]">
          {steps.map((s) => (
            <div key={s.t} className="flex items-start gap-[0.9em]">
              <span
                className="mt-[0.25em] grid h-[1.5em] w-[1.5em] shrink-0 place-items-center rounded-full border"
                style={{
                  borderColor: s.s === 'wait' ? '#313131' : '#65c466',
                  background: s.s === 'done' ? '#65c466' : 'transparent',
                }}
              >
                {s.s === 'run' && <span className="h-[0.5em] w-[0.5em] rounded-full bg-[#65c466]" />}
              </span>
              <span
                className="text-[1.15em] leading-[1.4]"
                style={{ color: s.s === 'wait' ? '#6b6b6b' : '#e0e0e0' }}
              >
                {s.t}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <div className="mt-[1.8em] border-t border-[#262626] pt-[1.4em]">
          <div className="text-[1em] uppercase tracking-[0.16em] text-[#6b6b6b]">Context</div>
          <div className="mt-[1.1em] flex flex-col gap-[0.9em]">
            {[
              ['gateway/router.ts', '4.1 kB'],
              ['gateway/lanes.ts', '2.7 kB'],
              ['tests/router.spec.ts', '6.3 kB'],
            ].map(([f, w]) => (
              <div key={f} className="flex items-center justify-between font-mono text-[1em]">
                <span className="truncate text-[#9f9f9f]">{f}</span>
                <span className="shrink-0 pl-[1em] text-[#5a5a5a]">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-[1.8em] font-mono">
        <div className="text-[1em] uppercase tracking-[0.16em] text-[#6b6b6b]">
          gateway/router.ts
        </div>
        <div className="mt-[1.4em] flex flex-col gap-[0.55em] text-[1.05em] leading-[1.5]">
          {[
            ['', 'import { laneFor } from \'./lanes\''],
            ['', ''],
            ['', 'export function route(task: Task) {'],
            ['-', '  return providers[0]'],
            ['+', '  const lane = laneFor(task)'],
            ['+', '  if (!lane.local && !task.allowHosted) {'],
            ['+', '    throw new LaneError(task.id, lane)'],
            ['+', '  }'],
            ['+', '  return pool.acquire(lane, budget)'],
            ['', '}'],
          ].map(([mark, line], i) => (
            <div
              key={i}
              className="flex gap-[0.9em] rounded-[0.3em] px-[0.6em] py-[0.15em]"
              style={{
                background:
                  mark === '+' ? 'rgba(101,196,102,0.08)' : mark === '-' ? 'rgba(236,103,101,0.08)' : 'transparent',
              }}
            >
              <span style={{ color: mark === '+' ? '#65c466' : mark === '-' ? '#ec6765' : '#3a3a3a' }}>
                {mark || ' '}
              </span>
              <span style={{ color: mark ? '#e0e0e0' : '#9f9f9f' }}>{line}</span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <div className="mt-[1.8em] rounded-[0.6em] border border-[#262626] bg-[#181818] p-[1.2em] text-[1.05em] leading-[1.6]">
          <div className="text-[#6b6b6b]">$ teminali verify --changed</div>
          <div className="text-[#9f9f9f]">typecheck  0 errors</div>
          <div className="text-[#65c466]">unit       501 / 501 passing</div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- scene 2 ---
   The gateway: lanes, providers and the budget. */
function SceneRoute() {
  const lanes = [
    { n: 'Flash', d: 'local · 7B', pct: 62, tone: '#65c466' },
    { n: 'Auto', d: 'local · 32B', pct: 31, tone: '#e8e8e8' },
    { n: 'Max', d: 'hosted · opt-in', pct: 7, tone: '#f2ca44' },
  ]
  const providers = [
    ['llama · 7B', 'local', 'ready'],
    ['qwen · 32B', 'local', 'ready'],
    ['whisper · small', 'local', 'ready'],
    ['hosted · opt-in', 'remote', 'idle'],
  ]
  return (
    <div className="flex h-full flex-col p-[2.2em]">
      <div className="text-[1em] uppercase tracking-[0.16em] text-[#6b6b6b]">Routing</div>
      <div className="mt-[1.8em] grid grid-cols-3 gap-[1.4em]">
        {lanes.map((l) => (
          <div key={l.n} className="rounded-[0.6em] border border-[#262626] bg-[#181818] p-[1.4em]">
            <div className="flex items-baseline justify-between">
              <span className="text-[1.5em] text-[#ededed]">{l.n}</span>
              <span className="text-[1.4em] font-mono" style={{ color: l.tone }}>
                {l.pct}%
              </span>
            </div>
            <div className="mt-[0.5em] text-[1em] text-[#6b6b6b]">{l.d}</div>
            <div className="mt-[1.2em] h-[0.5em] w-full rounded-full bg-[#262626]">
              <div className="h-full rounded-full" style={{ width: `${l.pct}%`, background: l.tone }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[1.8em] rounded-[0.6em] border border-[#262626] bg-[#181818] p-[1.4em]">
        <div className="flex items-center justify-between">
          <span className="text-[1.2em] text-[#c4c4c4]">Run budget</span>
          <span className="font-mono text-[1.2em] text-[#9f9f9f]">04:12 · 18k tokens</span>
        </div>
        <div className="mt-[1.2em] flex flex-col gap-[0.8em]">
          {['Plan', 'Edit', 'Verify'].map((s, i) => (
            <div key={s} className="flex items-center gap-[1em]">
              <span className="w-[5em] text-[1.05em] text-[#6b6b6b]">{s}</span>
              <Bar w={`${[34, 58, 22][i]}%`} tone="#313131" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[1.8em] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[0.6em] border border-[#262626]">
        <div className="border-b border-[#262626] bg-[#181818] px-[1.4em] py-[0.9em] text-[1em] uppercase tracking-[0.16em] text-[#6b6b6b]">
          Providers
        </div>
        {providers.map(([n, where, state], i) => (
          <div
            key={n}
            className="flex items-center gap-[1.2em] px-[1.4em] py-[0.95em]"
            style={{ borderTop: i ? '1px solid #262626' : 'none' }}
          >
            <span
              className="h-[0.6em] w-[0.6em] shrink-0 rounded-full"
              style={{ background: state === 'ready' ? '#65c466' : '#3a3a3a' }}
            />
            <span className="w-[12em] font-mono text-[1.1em] text-[#e0e0e0]">{n}</span>
            <span className="flex-1 font-mono text-[1.05em] text-[#6b6b6b]">{where}</span>
            <span className="font-mono text-[1.05em] text-[#6b6b6b]">{state}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- scene 3 ---
   Verification: five runtimes, real output. */
function SceneVerify() {
  const runs = [
    { n: 'typecheck', s: 'pass', d: '0 errors' },
    { n: 'unit', s: 'pass', d: '501 / 501' },
    { n: 'core', s: 'pass', d: '109 / 109' },
    { n: 'build', s: 'pass', d: '12.4s' },
    { n: 'lint', s: 'warn', d: '3 warnings' },
  ]
  return (
    <div className="flex h-full flex-col p-[2.2em]">
      <div className="flex items-center justify-between">
        <div className="text-[1em] uppercase tracking-[0.16em] text-[#6b6b6b]">Verification</div>
        <span className="rounded-full border border-[#65c466] px-[1em] py-[0.25em] font-mono text-[1em] text-[#65c466]">
          ready to merge
        </span>
      </div>
      <div className="mt-[1.8em] overflow-hidden rounded-[0.6em] border border-[#262626]">
        {runs.map((r, i) => (
          <div
            key={r.n}
            className="flex items-center gap-[1.2em] px-[1.4em] py-[1.05em]"
            style={{
              background: i % 2 ? '#181818' : 'transparent',
              borderTop: i ? '1px solid #262626' : 'none',
            }}
          >
            <span
              className="h-[0.7em] w-[0.7em] rounded-full"
              style={{ background: r.s === 'pass' ? '#65c466' : '#f2ca44' }}
            />
            <span className="w-[9em] font-mono text-[1.2em] text-[#e0e0e0]">{r.n}</span>
            <span className="flex-1 font-mono text-[1.1em] text-[#6b6b6b]">{r.d}</span>
            <span
              className="font-mono text-[1.05em]"
              style={{ color: r.s === 'pass' ? '#65c466' : '#f2ca44' }}
            >
              {r.s}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-[1.8em] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[0.6em] border border-[#262626] bg-[#181818]">
        <div className="border-b border-[#262626] px-[1.4em] py-[0.9em] text-[1em] uppercase tracking-[0.16em] text-[#6b6b6b]">
          Output · lint
        </div>
        <div className="flex flex-col gap-[0.55em] p-[1.4em] font-mono text-[1.05em] leading-[1.5]">
          {[
            ['#f2ca44', 'warn  gateway/lanes.ts:44  prefer-const'],
            ['#f2ca44', 'warn  gateway/pool.ts:12   no-unused-vars'],
            ['#f2ca44', 'warn  studio/main.ts:208   exhaustive-deps'],
            ['#6b6b6b', ''],
            ['#9f9f9f', '5 runtimes · 12.4s · 0 failures'],
          ].map(([c, line], i) => (
            <div key={i} style={{ color: c }}>
              {line || '\u00a0'}
            </div>
          ))}
        </div>
        <div className="flex-1" />
      </div>
    </div>
  )
}

const bodies = { run: SceneRun, route: SceneRoute, verify: SceneVerify }

export function StudioMock({ variant }: { variant: keyof typeof bodies }) {
  const Body = bodies[variant]
  const title = {
    run: 'teminali · frontier — session 5f2a',
    route: 'teminali · gateway — routing',
    verify: 'teminali · verify — run 218',
  }[variant]
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#151515] text-[#ededed]">
      <Chrome title={title} />
      <div className="flex min-h-0 flex-1">
        <Rail />
        <div className="min-w-0 flex-1">
          <Body />
        </div>
      </div>
    </div>
  )
}

/** The element that leaves the screen plane — the reference's signature move. */
export function BreakoutCard({
  title,
  rows,
}: {
  title: string
  rows: string[]
}) {
  return (
    <div className="w-[26em] overflow-hidden rounded-[0.7em] border border-[#3a3a3a] bg-[#212121] shadow-[0_1.5em_4em_rgba(0,0,0,0.6)]">
      <div className="border-b border-[#313131] px-[1.4em] py-[1em] text-[1.3em] text-[#f0f0f0]">
        {title}
      </div>
      <div className="flex flex-col">
        {rows.map((r, i) => (
          <div
            key={r}
            className="flex items-center justify-between px-[1.4em] py-[0.95em] text-[1.15em] text-[#c4c4c4]"
            style={{ borderTop: i ? '1px solid #262626' : 'none' }}
          >
            <span>{r}</span>
            <span className="h-[0.6em] w-[0.6em] rounded-full bg-[#65c466]" />
          </div>
        ))}
      </div>
    </div>
  )
}

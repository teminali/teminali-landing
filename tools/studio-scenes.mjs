// Capture the REAL teminaliCode studio, seeded with representative session
// content, at high DPR. Everything on screen is the product's own UI, CSS and
// components — only the session content is authored, the way any product
// screenshot is staged. Replaces the hand-drawn DOM mocks.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const OUT = process.env.OUT ?? './shots-studio'
const DPR = Number(process.env.DPR ?? 3)
const W = Number(process.env.W ?? 1280)
const H = Number(process.env.H ?? 800)
mkdirSync(OUT, { recursive: true })

const now = new Date().toISOString()
const tc = (id, name, args, extra = {}) => ({ id, name, arguments: args, status: 'completed', ...extra })

const DIFF = `@@ -18,7 +18,11 @@ export function route(task: Task) {
-  return providers[0]
+  const lane = laneFor(task)
+  if (!lane.local && !task.allowHosted) {
+    throw new LaneError(task.id, lane)
+  }
+  return pool.acquire(lane, budget)
 }`

const SCENES = {
  run: {
    title: 'Route every task through a lane',
    messages: [
      { id: 'u1', role: 'user', content: 'The dispatcher always picks the first provider. Make it pick a lane, and refuse hosted work unless the task opted in.', timestamp: now },
      { id: 'a1', role: 'assistant', timestamp: now, engineUsed: 'Frontier Auto', mode: 'auto', costUsd: 0, costLabel: '$0.0000', durationSec: 41, tokensCount: 3184,
        content: 'The dispatcher returned `providers[0]` regardless of the task, so a local-only task could still land on a hosted provider. I moved the choice behind `laneFor(task)` and made the hosted path explicit — a task that has not opted in now raises `LaneError` instead of silently leaving the machine.\n\nAll five verification runtimes are green.',
        toolCalls: [
          tc('t1', 'read_file', { path: 'gateway/router.ts' }, { result: '182 lines' }),
          tc('t2', 'edit_file', { path: 'gateway/router.ts' }, { diff: { file: 'gateway/router.ts', additions: 5, deletions: 1, diffText: DIFF } }),
          tc('t3', 'run_tests', { suite: 'gateway' }, { result: '501 / 501 passed · 12.4s' }),
        ] },
      { id: 'u1b', role: 'user', content: 'Good. Does anything still reach a hosted provider without asking first?', timestamp: now },
      { id: 'a1b', role: 'assistant', timestamp: now, engineUsed: 'Frontier Auto', mode: 'auto', costUsd: 0, costLabel: '$0.0000', durationSec: 9, tokensCount: 947,
        content: 'No. `laneFor` resolves to the local lane unless the task sets `allowHosted`, and the two callers that used to bypass the dispatcher now go through it.\n\nI checked the remaining call sites — nothing else constructs a provider directly.',
        toolCalls: [
          tc('t3b', 'grep', { pattern: 'providers\\[' }, { result: '0 matches outside router.ts' }),
          tc('t3c', 'typecheck', {}, { result: '0 errors' }),
        ] },
    ],
  },
  route: {
    title: 'Which model answered, and why',
    messages: [
      { id: 'u2', role: 'user', content: 'Which engine handled that last change, and what did it cost?', timestamp: now },
      { id: 'a2', role: 'assistant', timestamp: now, engineUsed: 'Frontier Auto', mode: 'auto', costUsd: 0, costLabel: '$0.0000', durationSec: 3, tokensCount: 612,
        routeReason: 'Local lane available · qwen3-coder on this Mac · hosted providers not required',
        content: 'It ran entirely on this Mac. `Frontier Auto` resolved the task to the local coding lane, so nothing was sent to a hosted provider and the run cost nothing.\n\nEvery route is recorded with the engine, the reason and the token counts, so you can see exactly which model answered and what it was given.',
        telemetry: { requestId: 'req_5f2a91', model: 'qwen3-coder:30b', startedAt: now, completedAt: now, totalDurationMs: 3120, loadDurationMs: 210, timeToFirstTokenMs: 180, promptTokens: 1904, outputTokens: 612, promptTokensPerSec: 842.5, outputTokensPerSec: 196.2, source: 'ollama' },
        toolCalls: [tc('t4', 'inspect_route', { task: 'gateway/router.ts' }, { result: 'lane=local · engine=qwen3-coder:30b · hosted=false' })] },
      { id: 'u2b', role: 'user', content: 'What would it have cost on a hosted provider?', timestamp: now },
      { id: 'a2b', role: 'assistant', timestamp: now, engineUsed: 'Frontier Auto', mode: 'auto', costUsd: 0, costLabel: '$0.0000', durationSec: 2, tokensCount: 240,
        content: 'For the 1,904 prompt and 612 output tokens above, a hosted frontier model would have been a fraction of a cent — but it would also have meant sending `gateway/router.ts` off the machine.\n\nThe run stays local by default; hosted providers are opt-in, per run.',
        toolCalls: [tc('t4b', 'compare_lanes', { tokens: 2516 }, { result: 'local $0.0000 · hosted (est.) $0.0094' })] },
    ],
  },
  verify: {
    title: 'Verify before it merges',
    messages: [
      { id: 'u3', role: 'user', content: 'Run the full verification and show me anything that is not green.', timestamp: now },
      { id: 'a3', role: 'assistant', timestamp: now, engineUsed: 'Frontier Auto', mode: 'auto', costUsd: 0, costLabel: '$0.0000', durationSec: 12, tokensCount: 1120,
        content: 'Five runtimes ran against your real toolchain. Types, unit, core and build are green; lint reports three warnings and no failures.\n\nNothing here is self-reported — these are the same commands your CI runs, executed on this machine.',
        toolCalls: [
          tc('t5', 'typecheck', {}, { result: '0 errors' }),
          tc('t6', 'unit', {}, { result: '501 / 501 passed' }),
          tc('t7', 'core', {}, { result: '109 / 109 passed' }),
          tc('t8', 'build', {}, { result: 'built in 12.4s' }),
          tc('t9', 'lint', {}, { result: '3 warnings · 0 errors' }),
        ] },
      { id: 'u3b', role: 'user', content: 'Show me the three warnings.', timestamp: now },
      { id: 'a3b', role: 'assistant', timestamp: now, engineUsed: 'Frontier Auto', mode: 'auto', costUsd: 0, costLabel: '$0.0000', durationSec: 4, tokensCount: 388,
        content: 'All three are style-level and none block the build:\n\n- `gateway/lanes.ts:44` — prefer-const\n- `gateway/pool.ts:12` — no-unused-vars\n- `studio/main.ts:208` — exhaustive-deps\n\nSay the word and I will clear them in the same branch.',
        toolCalls: [tc('t9b', 'read_report', { runtime: 'lint' }, { result: '3 warnings · 0 failures' })] },
    ],
  },
}

const b = await chromium.launch({ executablePath: EXE, args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] })
const errs = []
for (const [slug, scene] of Object.entries(SCENES)) {
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR })
  p.on('pageerror', (e) => errs.push(`${slug}: ${e}`))
  await p.goto('http://localhost:3000/', { waitUntil: 'load' })
  await p.evaluate(([key, sc]) => {
    const sid = 'sess-' + Math.random().toString(36).slice(2, 8)
    localStorage.setItem(key, JSON.stringify({
      version: 0,
      state: {
        chatSessions: [{ id: sid, title: sc.title, workspace: 'teminali', timestamp: new Date().toISOString(), messages: sc.messages }],
        activeSessionId: sid,
        frontierMessages: sc.messages,
        antigravityMessages: [], claudeMessages: [], codexMessages: [],
        budgetUsd: 0, spentUsd: 0,
        currentProfile: 'auto', agentSelection: 'frontier', agentPermission: 'auto',
        tabs: [], activeTabId: null,
      },
    }))
  }, ['teminali-studio-sessions-cache-v3', scene])
  await p.reload({ waitUntil: 'load' })
  await p.waitForTimeout(3500)
  await p.screenshot({ path: `${OUT}/${slug}.png` })
  const seen = await p.evaluate(() => (document.body.innerText || '').length)
  console.log(`${slug} chars=${seen}`)
  await p.close()
}
console.log('errors', errs.slice(0, 5))
await b.close()

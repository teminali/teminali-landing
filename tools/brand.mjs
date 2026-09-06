// Renders the brand mark to the raster sizes the HTML head needs: an
// apple-touch-icon and the og/twitter card.
//
// `public/favicon.svg` is hand-authored and is the canonical geometry; the
// paths below are that file's 1024 grid divided by 32, and the same three paths
// appear in Nav and the footer. Re-run this after any change to the mark or to
// --accent so the raster assets cannot drift from the SVG.
import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'

// playwright-core ships no browser of its own, and the pinned build under the
// Playwright cache is only there once `playwright install` has run. A system
// Chrome or Edge renders this card identically — it is a wordmark, a stroke
// mark and one webfont — so the pinned build is preferred and either is
// accepted rather than failing on a machine that never ran the installer.
const CANDIDATES = [
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
]
const EXE = CANDIDATES.find(existsSync)
if (!EXE) {
  console.error('No Chromium found. Run `npx playwright install chromium`, or install Google Chrome.')
  process.exit(1)
}

const GROUND = '#151515'
const ACCENT = '#65c466'
const MARK = (size, sw = 2.4) => `<svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none"
  stroke="${ACCENT}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6.56 12.13 10.06 16 6.56 19.88"/><path d="M12.25 19.88h7.5"/><path d="M25.44 12.13 21.94 16 25.44 19.88"/></svg>`

// Same webfont the site loads, so the card's wordmark is not a system fallback.
const plate = (size, body) => `<!doctype html><meta charset="utf-8">
<style>*{margin:0;padding:0}body{background:#000;display:grid;place-items:center;
  height:100vh;border-radius:${Math.round(size * 0.18)}px}</style>${body}`

const page = (body) => `<!doctype html><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:${GROUND};color:#e8e8e8;display:grid;place-items:center;height:100vh;
       font-family:Inter,-apple-system,system-ui,sans-serif}
</style>${body}`

const jobs = [
  // Black plate with the favicon's 18% corner radius, so the two icons match.
  { out: 'public/apple-touch-icon.png', w: 180, h: 180, body: plate(180, MARK(180, 2.4)) },
  {
    out: 'public/og.png', w: 1200, h: 630,
    body: page(`<div style="display:flex;flex-direction:column;align-items:center;gap:44px">
      ${MARK(200, 2.4)}
      <div style="font-size:64px;font-weight:500;letter-spacing:-0.02em">Teminali OS</div>
      <div style="font-size:28px;font-weight:300;color:#9f9f9f;text-align:center;max-width:760px;line-height:1.5">
        An autonomous studio that runs where your code already lives
      </div>
    </div>`),
  },
]

const b = await chromium.launch({ executablePath: EXE })
for (const j of jobs) {
  const p = await b.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 })
  await p.setContent(j.body, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({ path: j.out })
  console.log(j.out, `${j.w}x${j.h}`)
  await p.close()
}
await b.close()

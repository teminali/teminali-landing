// Walk the page section by section and capture viewport-sized frames.
// STOPS is a list of [name, selector] or [name, selector, extraFrames].
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const URL = process.env.URL ?? 'http://localhost:4173/'
const OUT = process.env.OUT ?? './shots'
const W = Number(process.env.W ?? 1440)
const H = Number(process.env.H ?? 900)
mkdirSync(OUT, { recursive: true })

const stops = JSON.parse(process.env.STOPS ?? '[]')

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: Number(process.env.DPR ?? 1),
  // RM=1 exercises the prefers-reduced-motion path (Lenis off, rail replaced
  // by the static frame) at whatever W/H is set.
  ...(process.env.RM ? { reducedMotion: 'reduce' } : {}),
})
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

// `networkidle` never settles against the dev server — its HMR websocket stays
// open forever — so wait on `load` and give the scene a fixed beat instead.
await page.goto(URL, { waitUntil: 'load' })
await page.waitForTimeout(1800)

const scrollTo = async (y) =>
  page.evaluate((yy) => {
    const l = window.__lenis
    if (l) l.scrollTo(yy, { immediate: true })
    else window.scrollTo(0, yy)
  }, y)

for (const [name, sel, extra = 0] of stops) {
  const box = await page.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top + window.scrollY, height: r.height }
  }, sel)
  if (!box) { console.log(name, 'MISSING', sel); continue }
  const frames = 1 + extra
  for (let i = 0; i < frames; i++) {
    const y = Math.round(box.top + i * (H - 60))
    await scrollTo(y)
    await page.waitForTimeout(900)
    // reveal animations are scroll-triggered; give them a beat
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${OUT}/${name}${frames > 1 ? '-' + (i + 1) : ''}.png` })
  }
  console.log(name, 'top=' + Math.round(box.top), 'h=' + Math.round(box.height), 'frames=' + frames)
}

console.log('page_height', await page.evaluate(() => document.body.scrollHeight))
console.log('errors', errors.length ? errors.slice(0, 8) : 'none')
await browser.close()

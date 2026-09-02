import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const OUT = process.env.OUT ?? './shots'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ executablePath: EXE, args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] })
for (const [W, H] of JSON.parse(process.env.VPS)) {
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await p.goto(process.env.URL, { waitUntil: 'load' })
  await p.waitForTimeout(2200)
  await p.screenshot({ path: `${OUT}/${W}x${H}.png`, fullPage: process.env.FULL === '1' })
  const m = await p.evaluate(() => ({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    h: document.body.scrollHeight,
  }))
  console.log(`${W}x${H} scrollW=${m.sw} clientW=${m.cw} ${m.sw <= m.cw ? 'ok' : 'OVERFLOW'} pageH=${m.h}`)
  if (errs.length) console.log('  errors:', errs.slice(0, 3))
  await p.close()
}
await b.close()

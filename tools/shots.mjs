import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const URL = process.env.URL ?? 'http://localhost:4173/'
const OUT = process.env.OUT ?? './shots'
mkdirSync(OUT, { recursive: true })

// Fractions of total page height. The first six walk the laptop rail.
const stops = JSON.parse(process.env.STOPS ?? '[]')

const browser = await chromium.launch({
  executablePath: EXE,
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const W = Number(process.env.W ?? 1440)
const H = Number(process.env.H ?? 900)
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight)

for (const [name, frac] of stops) {
  // A negative fraction means "rail progress" — resolve it against the hero
  // trigger's own start/end so a stop lands where the timeline actually is.
  const y = await page.evaluate((f) => {
    const st = window.__rail
    const target =
      f < 0 && st ? st.start + (st.end - st.start) * -f
                  : (document.body.scrollHeight - window.innerHeight) * f
    const yy = Math.round(target)
    const l = window.__lenis
    if (l) l.scrollTo(yy, { immediate: true })
    else window.scrollTo(0, yy)
    return yy
  }, frac)
  // scrub: 2 means the timeline is still catching up for ~2s after the jump.
  await page.waitForTimeout(2600)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(name, 'y=' + y, 'p=' + (await page.evaluate(() => window.__rail?.progress?.toFixed(3) ?? 'n/a')))
}

console.log('total_scroll', total)
console.log('errors', errors.length ? errors.slice(0, 8) : 'none')
await browser.close()

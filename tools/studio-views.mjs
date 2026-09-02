import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const OUT = process.env.OUT ?? './shots-studio'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ executablePath: EXE, args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: Number(process.env.DPR ?? 3) })
await p.goto('http://localhost:3000/', { waitUntil: 'load' })
await p.waitForTimeout(2500)
for (const name of JSON.parse(process.env.VIEWS)) {
  try {
    const el = p.getByRole('button', { name, exact: false }).first()
    await el.click({ timeout: 4000 })
    await p.waitForTimeout(2200)
    await p.screenshot({ path: `${OUT}/${name.toLowerCase().replace(/\W+/g,'-')}.png` })
    const txt = await p.evaluate(() => (document.body.innerText||'').slice(0,260).replace(/\n+/g,' | '))
    console.log(`[${name}] ${txt}`)
  } catch (e) { console.log(`[${name}] FAILED ${String(e).slice(0,90)}`) }
}
await b.close()

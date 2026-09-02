import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const OUT = process.env.OUT ?? './shots-studio'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ executablePath: EXE, args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: Number(process.env.DPR ?? 3) })
await p.goto('http://localhost:3000/', { waitUntil: 'load' })
await p.waitForTimeout(2500)
for (const [slug, name] of JSON.parse(process.env.SESSIONS)) {
  try {
    await p.getByText(name, { exact: false }).first().click({ timeout: 5000 })
    await p.waitForTimeout(3000)
    await p.screenshot({ path: `${OUT}/${slug}.png` })
    const info = await p.evaluate(() => {
      const main = document.querySelector('main') || document.body
      return { len: (main.innerText||'').length, txt: (main.innerText||'').slice(0,400).replace(/\n+/g,' | ') }
    })
    console.log(`[${slug}] chars=${info.len} :: ${info.txt}`)
  } catch (e) { console.log(`[${slug}] FAILED ${String(e).slice(0,80)}`) }
}
await b.close()

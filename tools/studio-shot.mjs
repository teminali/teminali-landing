// Capture the real teminaliCode studio for use as landing-page figures.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const OUT = process.env.OUT ?? './shots-studio'
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ executablePath: EXE, args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] })
const p = await b.newPage({
  viewport: { width: Number(process.env.W ?? 1280), height: Number(process.env.H ?? 800) },
  deviceScaleFactor: Number(process.env.DPR ?? 3),
})
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
await p.goto('http://localhost:3000/', { waitUntil: 'load' })
await p.waitForTimeout(3000)
await p.screenshot({ path: `${OUT}/app.png` })
// what is actually on screen, so the landing figures can mirror real UI
const map = await p.evaluate(() => {
  const pick = (el) => ({
    tag: el.tagName, cls: (el.className||'').toString().slice(0,70),
    txt: (el.innerText||'').trim().slice(0,60).replace(/\n/g,' | '),
  })
  return {
    title: document.title,
    buttons: [...document.querySelectorAll('button')].slice(0,30).map(b=>(b.innerText||'').trim().slice(0,28)).filter(Boolean),
    headings: [...document.querySelectorAll('h1,h2,h3,[role=heading]')].slice(0,20).map(pick),
    body: (document.body.innerText||'').slice(0, 1200),
  }
})
console.log(JSON.stringify(map, null, 1))
console.log('errors', errs.slice(0,4))
await b.close()

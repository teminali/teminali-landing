import { chromium } from 'playwright-core'
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const b = await chromium.launch({ executablePath: EXE, args:['--use-gl=angle','--enable-unsafe-swiftshader'] })
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 })
await p.goto('http://localhost:5173/', { waitUntil:'load' })
await p.waitForTimeout(1500)
const rows = await p.evaluate(() => {
  const out = []
  for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    const c = getComputedStyle(el)
    out.push({
      sec: el.closest('section')?.id || '?',
      tag: el.tagName,
      fs: c.fontSize, w: c.fontWeight, lh: c.lineHeight, ls: c.letterSpacing,
      txt: (el.textContent||'').trim().slice(0,28),
    })
  }
  const body = getComputedStyle(document.body)
  return { rows: out, body: { fs: body.fontSize, lh: body.lineHeight } }
})
console.log('body', JSON.stringify(rows.body))
for (const r of rows.rows) console.log(`${r.tag} ${r.fs.padStart(5)} w${r.w} lh${r.lh.padStart(6)} ls${r.ls.padStart(9)}  [${r.sec}] ${r.txt}`)
await b.close()

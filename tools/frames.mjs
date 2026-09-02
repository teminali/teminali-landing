import { chromium } from 'playwright-core'
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const b = await chromium.launch({ executablePath: EXE, args:['--use-gl=angle','--enable-unsafe-swiftshader'] })
for (const [W,H] of JSON.parse(process.env.VPS)) {
  const p = await b.newPage({ viewport:{width:W,height:H}, deviceScaleFactor:1 })
  await p.goto('http://localhost:4173/', { waitUntil:'networkidle' })
  await p.waitForTimeout(700)
  const rows = await p.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('div')) {
      const cs = getComputedStyle(el)
      const fs = parseFloat(cs.fontSize)
      const r = el.getBoundingClientRect()
      if (!(fs > 0 && fs < 9 && r.width > 60)) continue
      if (parseFloat(getComputedStyle(el.parentElement).fontSize) < 9) continue // only the frame root
      // deepest painted content inside
      let maxB = r.top
      for (const c of el.querySelectorAll('*')) {
        const cr = c.getBoundingClientRect()
        if (cr.height && cr.width && cr.bottom > maxB) maxB = cr.bottom
      }
      out.push({
        sec: el.closest('section')?.id || '?',
        w: Math.round(r.width), h: Math.round(r.height),
        fs: fs.toFixed(2), ideal: (r.width/100).toFixed(2),
        fill: r.height ? Math.round(((maxB - r.top)/r.height)*100) : 0,
      })
    }
    return out
  })
  console.log(`\n=== ${W}x${H}`)
  for (const r of rows) console.log(`  [${r.sec}] ${r.w}x${r.h} fs=${r.fs} ideal=${r.ideal} vfill=${r.fill}%`)
  await p.close()
}
await b.close()

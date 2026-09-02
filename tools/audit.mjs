import { chromium } from 'playwright-core'
const EXE = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
const URL = process.env.URL ?? 'http://localhost:4173/'
const browser = await chromium.launch({ executablePath: EXE, args: ['--use-gl=angle','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] })
for (const wh of JSON.parse(process.env.VPS)) {
  const [W,H] = wh
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0,140)))
  page.on('console', m => m.type()==='error' && errors.push(m.text().slice(0,140)))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  // force all reveal animations visible + kill sticky so we measure real layout
  const res = await page.evaluate((W) => {
    const doc = document.documentElement
    const out = { scrollW: doc.scrollWidth, clientW: doc.clientWidth, over: [], tiny: [] }
    const els = document.querySelectorAll('body *')
    const seen = new Set()
    for (const el of els) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const cs = getComputedStyle(el)
      if (cs.position === 'fixed') continue
      const right = r.right, left = r.left
      if (right > W + 1 || left < -1) {
        // only report if not intentionally hidden by an overflow-hidden ancestor
        let anc = el.parentElement, clipped = false
        while (anc && anc !== document.body) {
          const acs = getComputedStyle(anc)
          if (acs.overflow !== 'visible' && acs.overflowX !== 'visible') { clipped = true; break }
          anc = anc.parentElement
        }
        if (clipped) continue
        const sec = el.closest('section')?.id || el.closest('nav') && 'nav' || el.closest('footer') && 'footer' || '?'
        const key = sec + '|' + el.tagName + '|' + (el.className?.toString().slice(0,60) || '')
        if (seen.has(key)) continue
        seen.add(key)
        out.over.push({ sec, tag: el.tagName, cls: (el.className?.toString()||'').slice(0,90), l: Math.round(left), r: Math.round(right) })
      }
      // unreadably small text
      const fs = parseFloat(cs.fontSize)
      if (fs > 0 && fs < 7 && el.childElementCount === 0 && el.textContent.trim()) {
        const key2 = 'T'+(el.closest('section')?.id||'?')+Math.round(fs*10)
        if (!seen.has(key2)) { seen.add(key2); out.tiny.push({ sec: el.closest('section')?.id||'?', fs: fs.toFixed(1), txt: el.textContent.trim().slice(0,24) }) }
      }
    }
    return out
  }, W)
  console.log(`\n=== ${W}x${H} scrollW=${res.scrollW} clientW=${res.clientW} ${res.scrollW>res.clientW?'*** H-OVERFLOW ***':'ok'}`)
  console.log('overflow els:', res.over.length)
  for (const o of res.over.slice(0,25)) console.log(`  [${o.sec}] ${o.tag} l=${o.l} r=${o.r} .${o.cls}`)
  if (res.tiny.length) console.log('tiny text:', JSON.stringify(res.tiny.slice(0,12)))
  if (errors.length) console.log('ERRORS', errors.slice(0,5))
  await page.close()
}
await browser.close()

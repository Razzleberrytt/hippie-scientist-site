/**
 * Contrast audit — walks a route set in both themes and reports the worst
 * text-contrast ratio for eyebrows, body copy, and headings, compositing
 * translucent and oklab backgrounds through a canvas so the numbers reflect
 * what is actually rendered.
 *
 * Run it before and after a colour change and compare: the useful signal is
 * which rows moved, not the absolute floor. Text over photographs reads low
 * here because the image is invisible to the compositing walk.
 *
 *   npm run dev
 *   npm i --no-save playwright && node scripts/dev/contrast-audit.mjs
 */
import { chromium } from 'playwright'
const ROUTES = ['/', '/herbs/ashwagandha/', '/compounds/l-theanine/', '/guides/', '/guides/compare/',
  '/library/', '/goals/sleep/', '/articles/', '/safety-checker/', '/info/about/', '/learn/', '/evidence/evidence-report/']
const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) })
const rows = []
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: theme })
  await ctx.addInitScript((t) => { try { localStorage.setItem('theme', t) } catch {} }, theme)
  const page = await ctx.newPage()
  for (const r of ROUTES) {
    const resp = await page.goto(`http://localhost:3000${r}`, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => null)
    if (!resp || !resp.ok()) continue
    await page.waitForTimeout(450)
    const out = await page.evaluate(() => {
      // Composite any CSS colour (oklab, alpha, hsl...) onto a base via canvas.
      const cv = document.createElement('canvas'); cv.width = cv.height = 1
      const c2 = cv.getContext('2d', { willReadFrequently: true })
      const paint = (colors) => {
        c2.clearRect(0, 0, 1, 1)
        c2.fillStyle = '#ffffff'; c2.fillRect(0, 0, 1, 1)
        for (const col of colors) { c2.fillStyle = col; c2.fillRect(0, 0, 1, 1) }
        const d = c2.getImageData(0, 0, 1, 1).data
        return [d[0], d[1], d[2]]
      }
      const lum = ([r, g, b]) => { const f = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
      const bgStack = (el) => { const st = []; for (let n = el; n; n = n.parentElement) { const bg = getComputedStyle(n).backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)') st.unshift(bg) } return st }
      const ratio = (fg, bgs) => { const b = paint(bgs); const f = paint([...bgs, fg]); const l1 = lum(f), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) }
      const check = (sel) => {
        let worst = 99, n = 0, worstText = ''
        for (const el of [...document.querySelectorAll(sel)].slice(0, 30)) {
          if (!el.textContent.trim()) continue
          const cr = ratio(getComputedStyle(el).color, bgStack(el))
          if (cr < worst) { worst = cr; worstText = el.textContent.trim().slice(0, 24) }
          n++
        }
        return { n, worst: n ? Number(worst.toFixed(2)) : null, worstText }
      }
      return { eyebrow: check('.eyebrow-label, .section-label'), body: check('main p'), heads: check('main h2, main h3') }
    })
    rows.push({ r, theme, ...out })
  }
  await page.close(); await ctx.close()
}
await browser.close()
let fails = 0
for (const x of rows) {
  const bad = [x.eyebrow, x.body, x.heads].some((m) => m.worst !== null && m.worst < 4.5)
  if (bad) fails++
  console.log(`${bad ? 'FAIL' : ' ok '} ${x.theme.padEnd(5)} ${x.r.padEnd(30)} eyebrow=${x.eyebrow.worst ?? '-'} body=${x.body.worst ?? '-'} heads=${x.heads.worst ?? '-'}${bad ? '  <- ' + [x.eyebrow, x.body, x.heads].filter((m) => m.worst !== null && m.worst < 4.5).map((m) => `"${m.worstText}"`).join(' ') : ''}`)
}
console.log(`\nrows below 4.5:1 -> ${fails}`)

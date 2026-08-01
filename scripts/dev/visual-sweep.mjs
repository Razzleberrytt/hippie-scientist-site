/**
 * Visual sweep — loads a representative route set at three widths in both
 * themes and reports failed loads, horizontal overflow, and a screenshot per
 * route. Used to check design changes that touch shared surfaces.
 *
 * Not wired into CI: it needs a browser, and this repo already runs a
 * production build, fast-ui-check, and Lighthouse per PR. Run it on demand.
 *
 *   npm run dev
 *   npm i --no-save playwright && node scripts/dev/visual-sweep.mjs before
 *   ...make changes...
 *   node scripts/dev/visual-sweep.mjs after
 *
 * Screenshots and report.json land in .visual-sweep/<tag>/.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const ROUTES = [
  '/', '/herbs/', '/herbs/ashwagandha/', '/compounds/', '/compounds/l-theanine/',
  '/guides/', '/guides/compare/', '/guides/compare/rhodiola-vs-ashwagandha/',
  '/guides/sleep/', '/goals/sleep/', '/library/', '/articles/', '/learn/',
  '/safety-checker/', '/evidence/evidence-report/', '/search/',
  '/info/about/', '/info/faq/', '/info/methodology/', '/info/privacy/',
  '/guides/mental-health/', '/guides/anxiety/', '/novel-psychoactive-substances/',
  '/guides/other/', '/evidence/evidence-checker/',
]
const WIDTHS = [390, 768, 1280]
const tag = process.argv[2] || 'base'
const dir = `${process.cwd()}/.visual-sweep/${tag}`
mkdirSync(dir, { recursive: true })

const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) })
const report = []
for (const theme of ['light', 'dark']) {
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: theme })
    for (const route of ROUTES) {
      const resp = await page.goto(`http://localhost:3000${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => null)
      if (!resp || !resp.ok()) { report.push({ route, w, theme, status: resp ? resp.status() : 'ERR' }); continue }
      await page.waitForTimeout(350)
      const m = await page.evaluate(() => {
        const de = document.documentElement
        const body = document.body
        const bodyBg = getComputedStyle(body).backgroundColor
        const p = document.querySelector('main p, p')
        return {
          overflow: de.scrollWidth - de.clientWidth,
          bodyBg,
          textColor: p ? getComputedStyle(p).color : null,
          h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 40),
        }
      })
      report.push({ route, w, theme, ...m })
      if (w === 1280 && theme === 'light') {
        await page.screenshot({ path: `${dir}/${route.replace(/\//g, '_') || 'home'}.png` })
      }
    }
    await page.close()
  }
}
await browser.close()
writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 1))
const over = report.filter((r) => r.overflow > 0)
const errs = report.filter((r) => r.status)
console.log(`routes=${ROUTES.length} widths=${WIDTHS.length} themes=2 checks=${report.length}`)
console.log(`failed loads: ${errs.length}`, errs.slice(0, 8).map((e) => `${e.route}@${e.status}`).join(', '))
console.log(`horizontal overflow: ${over.length}`)
for (const o of over.slice(0, 12)) console.log(`  ${o.route} @${o.w} ${o.theme}: +${o.overflow}px`)

/**
 * Visual sweep — loads a representative route set at three widths in both
 * themes and reports failed loads and horizontal overflow for every state.
 * It retains desktop-light screenshots for every route and mobile light/dark
 * screenshots for the representative P0 journey below.
 *
 * Hosted visual proof runs this exact sweep through
 * .github/workflows/visual-proof.yml using a transient pinned Playwright
 * install. It remains directly runnable for local before/after review.
 *
 *   npm run dev
 *   npm i --no-save playwright && node scripts/dev/visual-sweep.mjs before
 *   ...make changes...
 *   node scripts/dev/visual-sweep.mjs after
 *
 * Screenshots and report.json land in .visual-sweep/<tag>/. Each report row's
 * screenshot field names its captured file, or is null when none was saved.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const ROUTES = [
  '/', '/start/', '/explore/', '/library/', '/goals/',
  '/goals/sleep/', '/goals/stress/', '/goals/anxiety/', '/goals/focus/',
  '/herbs/', '/herbs/ashwagandha/', '/compounds/', '/compounds/l-theanine/',
  '/guides/', '/guides/compare/', '/guides/compare/rhodiola-vs-ashwagandha/',
  '/guides/mental-health/', '/guides/metabolic-health/', '/guides/other/',
  '/articles/', '/learn/', '/research/', '/safety-checker/', '/evidence/evidence-report/',
  '/evidence/evidence-checker/', '/search/', '/info/about/', '/info/faq/',
  '/info/methodology/', '/info/privacy/', '/novel-psychoactive-substances/',
]
const WIDTHS = [390, 768, 1280]
const MOBILE_PROOF_ROUTES = new Set([
  '/', '/start/', '/explore/', '/guides/', '/herbs/', '/herbs/ashwagandha/',
  '/compounds/', '/compounds/l-theanine/', '/research/',
])
const tag = process.argv[2] || 'base'
const dir = `${process.cwd()}/.visual-sweep/${tag}`
mkdirSync(dir, { recursive: true })

const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) })
const report = []
for (const theme of ['light', 'dark']) {
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: theme })
    // The app's theme source of truth is localStorage, not the browser preference.
    await page.addInitScript((selectedTheme) => localStorage.setItem('theme', selectedTheme), theme)
    for (const [routeIndex, route] of ROUTES.entries()) {
      const resp = await page.goto(`http://localhost:3000${route}`, { waitUntil: 'domcontentloaded', timeout: 120000 }).catch(() => null)
      if (!resp || !resp.ok()) { report.push({ route, w, theme, status: resp ? resp.status() : 'ERR', screenshot: null }); continue }
      await page.waitForTimeout(350)
      const m = await page.evaluate(() => {
        const de = document.documentElement
        const body = document.body
        const bodyBg = getComputedStyle(body).backgroundColor
        const p = document.querySelector('main p, p')
        return {
          overflow: de.scrollWidth - de.clientWidth,
          bodyBg,
          appliedTheme: de.dataset.theme,
          textColor: p ? getComputedStyle(p).color : null,
          h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 40),
        }
      })
      const capture = (w === 1280 && theme === 'light') || (w === 390 && MOBILE_PROOF_ROUTES.has(route))
      const screenshot = capture
        ? `${String(routeIndex).padStart(2, '0')}-${route.split('/').filter(Boolean).join('-') || 'home'}-${w}-${theme}.png`
        : null
      if (screenshot) {
        await page.screenshot({ path: `${dir}/${screenshot}` })
      }
      report.push({ route, w, theme, ...m, screenshot })
    }
    await page.close()
  }
}
await browser.close()
writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 1))
const over = report.filter((r) => r.overflow > 0)
const errs = report.filter((r) => r.status)
const themeMismatches = report.filter((r) => !r.status && r.appliedTheme !== r.theme)
console.log(`routes=${ROUTES.length} widths=${WIDTHS.length} themes=2 checks=${report.length}`)
console.log(`failed loads: ${errs.length}`, errs.slice(0, 8).map((e) => `${e.route}@${e.status}`).join(', '))
console.log(`horizontal overflow: ${over.length}`)
console.log(`theme mismatches: ${themeMismatches.length}`)
console.log(`screenshots: ${report.filter((r) => r.screenshot).length}`)
for (const o of over.slice(0, 12)) console.log(`  ${o.route} @${o.w} ${o.theme}: +${o.overflow}px`)
if (errs.length || over.length || themeMismatches.length) process.exitCode = 1

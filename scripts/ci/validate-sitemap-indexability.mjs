#!/usr/bin/env node
/**
 * THS-178 — sitemap.xml must not advertise a page that renders `noindex`.
 *
 * The sitemap and the page both decide indexability through
 * `shouldIndexRoute()`, but they feed it records loaded by different paths:
 * `app/sitemap.ts` uses its own data load, while the profile templates use the
 * runtime metadata cache. When those two records differ the two answers differ,
 * and the result is a URL Google is told to crawl attached to a page telling it
 * to go away.
 *
 * 75 URLs are in that state today. Removing them from the sitemap and fixing
 * the divergent record load are different jobs, and the second is the real one;
 * this measures the gap so it cannot silently grow while that work is pending.
 *
 * Checked against built HTML rather than source, because the contradiction only
 * exists after rendering — a source scan is exactly what misses it.
 *
 * Usage: node scripts/ci/validate-sitemap-indexability.mjs [--max <n>]
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'out')
const SITEMAP = path.join(OUT_DIR, 'sitemap.xml')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'sitemap-indexability.json')

/**
 * Remaining known offenders. Both are comparison pages that call `notFound()`
 * at render time while their static metadata still declares `index, follow`,
 * so they emit two contradictory robots tags. That is a different defect from
 * the governance mismatch this number used to cover, which is now fixed.
 */
const BASELINE_MAX = 2

const args = process.argv.slice(2)
const maxIndex = args.indexOf('--max')
const MAX = maxIndex === -1 ? BASELINE_MAX : Number(args[maxIndex + 1] ?? BASELINE_MAX)

function pageFileFor(urlPath) {
  const relative = urlPath.replace(/^\/+|\/+$/g, '')
  return relative ? path.join(OUT_DIR, relative, 'index.html') : path.join(OUT_DIR, 'index.html')
}

function main() {
  // The sitemap is the whole subject of this check; without it there is
  // nothing to validate, and returning quietly reported a pass.
  if (!fs.existsSync(SITEMAP)) {
    if (process.argv.includes('--optional')) {
      console.log('[sitemap-indexability] SKIPPED: no out/sitemap.xml and a skip was explicitly allowed.')
      return
    }
    console.error('[sitemap-indexability] FAILED: no out/sitemap.xml, so no URL was inspected.')
    console.error('Run `npm run build` first, or pass --optional if a skip is genuinely intended.')
    process.exit(1)
  }

  const xml = fs.readFileSync(SITEMAP, 'utf8')
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/')

  const noindexed = []
  const missing = []
  let ok = 0

  for (const urlPath of urls) {
    const file = pageFileFor(urlPath)
    if (!fs.existsSync(file)) {
      missing.push(urlPath)
      continue
    }
    const html = fs.readFileSync(file, 'utf8')
    const robots = [...html.matchAll(/<meta[^>]*name="robots"[^>]*content="([^"]*)"/gi)].map((m) => m[1])
    // Any noindex directive wins, which is also how search engines resolve two
    // conflicting tags on one page.
    if (robots.some((value) => /noindex/i.test(value))) {
      noindexed.push({ url: urlPath, robots, contradictory: robots.length > 1 && robots.some((v) => /^index/i.test(v)) })
      continue
    }
    ok += 1
  }

  const contradictory = noindexed.filter((n) => n.contradictory)

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(
      { generatedAt: new Date().toISOString(), sitemapUrls: urls.length, indexable: ok, noindexed: noindexed.length, missing, contradictory, entries: noindexed },
      null,
      2,
    )}\n`,
  )

  console.log('\nSitemap indexability')
  console.log('='.repeat(66))
  console.log(`URLs in sitemap.xml            ${urls.length}`)
  console.log(`  render an indexable page     ${ok}`)
  console.log(`  render noindex               ${noindexed.length}  (allowed: ${MAX})`)
  console.log(`  of those, self-contradictory ${contradictory.length}`)
  console.log(`  no built page                ${missing.length}`)
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (contradictory.length) {
    console.log('\nPages emitting both index and noindex (search engines take noindex):')
    for (const c of contradictory) console.log(`  ${c.url}  [${c.robots.join(' || ')}]`)
  }

  // A sitemap URL with no page at all is always wrong and has no baseline.
  if (missing.length) {
    console.error(`\n[sitemap-indexability] FAILED — ${missing.length} sitemap URL(s) have no built page.`)
    for (const m of missing.slice(0, 20)) console.error(`  ${m}`)
    process.exit(1)
  }

  if (noindexed.length > MAX) {
    console.error(`\n[sitemap-indexability] FAILED — ${noindexed.length} noindexed URLs in the sitemap, above the allowed ${MAX}.`)
    for (const n of noindexed.slice(0, 20)) console.error(`  ${n.url}`)
    console.error('\nA sitemap entry asks a crawler to index a page that refuses. Either the')
    console.error('route should not be listed, or its page should not be noindex.')
    process.exit(1)
  }

  console.log('\nNo growth in noindexed sitemap entries.')
}

main()

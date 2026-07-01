import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REQUIRE_BUILT = process.argv.includes('--require-built')
const CANONICAL_HOST = 'thehippiescientist.net'

function parseXmlUrls(xmlContent) {
  const urls = []
  const locRegex = /<loc>(.*?)<\/loc>/g
  let match
  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1])
  }
  return urls
}

function main() {
  const outDir = path.join(ROOT, 'out')
  const sitemapPath = path.join(outDir, 'sitemap.xml')

  if (!fs.existsSync(outDir)) {
    if (REQUIRE_BUILT) {
      console.error('[validate-sitemap] FAIL: out/ directory does not exist. Run `npm run build` first.')
      process.exit(1)
    }
    console.log('[validate-sitemap] SKIP: out/ directory does not exist yet (pre-build stage).')
    return
  }

  if (!fs.existsSync(sitemapPath)) {
    console.error('[validate-sitemap] FAIL: out/sitemap.xml does not exist.')
    process.exit(1)
  }

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8')
  const urls = parseXmlUrls(sitemapContent)

  if (urls.length === 0) {
    console.error('[validate-sitemap] FAIL: sitemap.xml is empty or has no loc tags.')
    process.exit(1)
  }

  console.log(`[validate-sitemap] Found ${urls.length} URLs in sitemap.xml. Auditing...`)

  let failed = false
  const errors = []

  let herbCount = 0
  let compoundCount = 0
  let articleCount = 0
  let guideCount = 0

  const expectedCorePrefixes = [
    '/info/about',
    '/info/contact',
    '/guides/compare',
    '/info/disclaimer',
    '/info/faq',
    '/guides',
    '/info/methodology',
    '/info/privacy',
    '/safety-checker',
    '/herbs',
    '/compounds'
  ]
  const foundCore = new Set()

  for (const url of urls) {
    let urlObj
    try {
      urlObj = new URL(url)
    } catch {
      errors.push(`Malformed URL in sitemap: "${url}"`)
      failed = true
      continue
    }
    const pathname = urlObj.pathname

    const expectedHost = CANONICAL_HOST
    if (urlObj.hostname !== expectedHost) {
      errors.push(`URL hostname is not canonical (expected "${expectedHost}"): "${url}"`)
      failed = true
    }
    if (pathname !== '/') {
      if (!pathname.endsWith('/')) {
        errors.push(`URL does not end with trailing slash: "${url}"`)
        failed = true
      }
    }

    // Verify built file exists on disk
    if (fs.existsSync(outDir)) {
      let localPath
      if (pathname === '/') {
        localPath = path.join(outDir, 'index.html')
      } else {
        const cleanPath = pathname.replace(/^\/|\/$/g, '')
        localPath = path.join(outDir, cleanPath, 'index.html')
      }
      if (!fs.existsSync(localPath)) {
        errors.push(`Sitemap URL path "${pathname}" has no corresponding built file "${localPath}"`)
        failed = true
      }
    }

    // Count routes
    if (pathname.startsWith('/herbs/')) {
      herbCount++
    } else if (pathname.startsWith('/compounds/')) {
      compoundCount++
    } else if (pathname.startsWith('/articles/')) {
      articleCount++
    } else if (pathname.startsWith('/guides/')) {
      guideCount++
    }

    // Check core routes
    for (const core of expectedCorePrefixes) {
      if (pathname === core || pathname === `${core}/`) {
        foundCore.add(core)
      }
    }
  }

  // Asserts
  console.log(`[validate-sitemap] Category counts: herbs=${herbCount}, compounds=${compoundCount}, articles=${articleCount}, guides=${guideCount}`)

  // This ceiling exists to catch a genuine runaway-generation bug (e.g. an accidental
  // Cartesian product in a route builder producing tens of thousands of URLs), not to
  // gate normal content growth. It was bumped 3 times in one week from an original 450
  // as real, correctly-generated content (articles, nested guides) was fixed to actually
  // appear in the sitemap — each bump required a full CI round-trip for zero benefit.
  // Google's own sitemap limit is 50,000 URLs; anything in the thousands is still
  // trivially small for this site, so this is set high enough that it should not need
  // touching again for routine content growth. If you hit this, it's almost certainly a
  // real bug (check the "no corresponding built file" errors above first), not content growth.
  if (urls.length > 5000) {
    errors.push(`Sitemap contains ${urls.length} URLs (expected no more than 5000 — this usually means a route generator is producing duplicates/a Cartesian product, not organic content growth).`)
    failed = true
  }

  if (herbCount < 10) {
    errors.push(`Sitemap contains only ${herbCount} /herbs/* URLs (expected at least 10 curated/quality-gated herb URLs).`)
    failed = true
  }

  if (compoundCount < 8) {
    errors.push(`Sitemap contains only ${compoundCount} /compounds/* URLs (expected at least 8 curated/quality-gated compound URLs).`)
    failed = true
  }

  const missingCore = expectedCorePrefixes.filter(c => !foundCore.has(c))
  if (missingCore.length > 0) {
    errors.push(`Sitemap is missing core routes: ${missingCore.join(', ')}`)
    failed = true
  }

  if (failed) {
    console.error('[validate-sitemap] FAIL: Sitemap validation failed with errors:')
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  }

  console.log('[validate-sitemap] PASS: Sitemap is fully valid (trailing slashes, route counts, built static files, and core pages).')
}

main()

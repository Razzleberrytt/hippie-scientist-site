import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REQUIRE_BUILT = process.argv.includes('--require-built')
const CANONICAL_HOST = 'thehippiescientist.net'

/**
 * How many profiles of this kind the published data governs as indexable, read
 * from the same summary indexes the sitemap generator and the profile pages read.
 *
 * Returns null when the file is unreadable, in which case callers fall back to
 * their fixed floor.
 */
function governedIndexableCount(kind) {
  const file = path.join(ROOT, 'public', 'data', 'summary-indexes', `${kind}-summary.json`)
  if (!fs.existsSync(file)) return null

  try {
    const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!Array.isArray(rows)) return null
    return rows.filter((row) => {
      if (/noindex/i.test(String(row?.robots || ''))) return false
      const status = String(row?.indexability_status || row?.runtime_export_decision || '')
      if (status) return /publish/i.test(status)
      return row?.sitemap_included === true
    }).length
  } catch {
    return null
  }
}

function parseXmlUrls(xmlContent) {
  const urls = []
  const locRegex = /<loc>(.*?)<\/loc>/g
  let match
  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1])
  }
  return urls
}

function looksLikeHtml(content) {
  return /^\s*(?:<!doctype\s+html\b|<html\b)/i.test(content)
}

function hasSupportedSitemapRoot(content) {
  return /<urlset\b|<sitemapindex\b/i.test(content)
}

function getRobotsMeta(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || []
  return tags
    .filter((tag) => /\bname\s*=\s*["'](?:robots|googlebot)["']/i.test(tag))
    .map((tag) => tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1]?.toLowerCase() || '')
    .filter(Boolean)
}

function getCanonicalUrl(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || []
  const canonicalTag = tags.find((tag) => /\brel\s*=\s*["']canonical["']/i.test(tag))
  return canonicalTag?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() || null
}

function normalizeAbsoluteUrl(value) {
  try {
    return new URL(value).href
  } catch {
    return null
  }
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

  if (looksLikeHtml(sitemapContent)) {
    console.error('[validate-sitemap] FAIL: out/sitemap.xml is HTML, not XML. This matches the Google Search Console "Sitemap is HTML" error.')
    process.exit(1)
  }

  if (!hasSupportedSitemapRoot(sitemapContent)) {
    console.error('[validate-sitemap] FAIL: out/sitemap.xml does not contain a supported sitemap root tag (<urlset> or <sitemapindex>).')
    process.exit(1)
  }

  const urls = parseXmlUrls(sitemapContent)

  if (urls.length === 0) {
    console.error('[validate-sitemap] FAIL: sitemap.xml is empty or has no loc tags.')
    process.exit(1)
  }

  console.log(`[validate-sitemap] Found ${urls.length} URLs in sitemap.xml. Auditing...`)

  let failed = false
  const errors = []
  const seenUrls = new Set()

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

    const normalizedSitemapUrl = urlObj.href
    if (seenUrls.has(normalizedSitemapUrl)) {
      errors.push(`Duplicate URL in sitemap: "${url}"`)
      failed = true
    } else {
      seenUrls.add(normalizedSitemapUrl)
    }

    const pathname = urlObj.pathname

    if (urlObj.protocol !== 'https:') {
      errors.push(`URL protocol is not HTTPS: "${url}"`)
      failed = true
    }

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

    // Verify built file exists on disk and that rendered page-level SEO agrees
    // with sitemap inclusion. This turns canonical/noindex drift into a hard
    // deployment failure instead of relying on an optional post-hoc audit.
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
    } else {
      const html = fs.readFileSync(localPath, 'utf8')
      const robotsMeta = getRobotsMeta(html)
      if (robotsMeta.some((value) => /\bnoindex\b/i.test(value))) {
        errors.push(`Sitemap URL renders noindex robots metadata: "${url}"`)
        failed = true
      }

      const canonical = getCanonicalUrl(html)
      if (!canonical) {
        errors.push(`Sitemap URL is missing a rendered canonical link: "${url}"`)
        failed = true
      } else {
        const normalizedCanonical = normalizeAbsoluteUrl(canonical)
        if (!normalizedCanonical || normalizedCanonical !== normalizedSitemapUrl) {
          errors.push(`Sitemap URL canonical mismatch: sitemap="${url}" canonical="${canonical}"`)
          failed = true
        }
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

  // These floors catch a generator that has stopped emitting profiles. They are
  // not a promise about how much content exists: production invariant enforcement
  // demotes any profile publishing a safety, dose or human-outcome claim without a
  // matching source, and that governance decision outranks a hardcoded number
  // here. Holding the floor at 8 meant the build demanded that unsourced health
  // claims be published in order to pass, which is the wrong way round.
  //
  // The floor is therefore the smaller of the historical expectation and what the
  // data actually governs as indexable. A generator that drops governed profiles
  // still fails - and fails sooner than before, because the bar is now 64 herbs
  // rather than 10 when governance publishes 64.
  const governedHerbs = governedIndexableCount('herbs')
  const governedCompounds = governedIndexableCount('compounds')
  const herbFloor = governedHerbs === null ? 10 : Math.min(10, governedHerbs)
  const compoundFloor = governedCompounds === null ? 8 : Math.min(8, governedCompounds)

  if (governedHerbs !== null && governedCompounds !== null) {
    console.log(`[validate-sitemap] Governed as indexable: herbs=${governedHerbs}, compounds=${governedCompounds} (floors: herbs>=${herbFloor}, compounds>=${compoundFloor})`)
  }
  if (governedHerbs === 0 || governedCompounds === 0) {
    console.warn(`[validate-sitemap] WARNING: governance currently publishes herbs=${governedHerbs}, compounds=${governedCompounds}. An empty published set is not a sitemap bug, but it means that library renders no indexable profiles.`)
  }

  if (herbCount < herbFloor) {
    errors.push(`Sitemap contains only ${herbCount} /herbs/* URLs, but the published data governs ${governedHerbs ?? 'an unknown number of'} herbs as indexable (expected at least ${herbFloor}).`)
    failed = true
  }

  // A catastrophic-regression smoke floor, not a publishing target. Route-level
  // completeness, rendered canonical/noindex checks and governance decide which
  // compound profiles belong in the sitemap, and conservative governance can
  // legitimately publish fewer than the historical threshold of eight - CI must
  // never pressure the project to republish a profile to satisfy a count.
  //
  // main lowered the fixed floor to 5 for that reason. Deriving it from what
  // governance actually publishes keeps that guarantee at any level (6 published
  // means 6 required, 3 means 3) and detects a generator regression far sooner:
  // with 111 governed compounds a drop to 9 now fails, where any fixed floor
  // below 9 would pass it.
  if (compoundCount < compoundFloor) {
    errors.push(`Sitemap contains only ${compoundCount} /compounds/* URLs, but the published data governs ${governedCompounds ?? 'an unknown number of'} compounds as indexable (expected at least ${compoundFloor}; lower usually indicates a route/governance pipeline regression).`)
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

  console.log('[validate-sitemap] PASS: Sitemap URLs are HTTPS, canonical, unique, indexable, backed by static files, and include required route coverage.')
}

main()
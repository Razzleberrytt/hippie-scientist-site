import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

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
  let blogCount = 0
  let guideCount = 0
  
  const expectedCorePrefixes = [
    '/about',
    '/contact',
    '/compare',
    '/disclaimer',
    '/faq',
    '/guides',
    '/learn',
    '/methodology',
    '/privacy',
    '/safety-checker',
    '/herbs',
    '/compounds',
    '/stacks',
    '/blog'
  ]
  const foundCore = new Set()

  for (const url of urls) {
    // 1. Confirm trailing slash (exclude default root and domain-only URLs if needed, but since it is e.g. https://thehippiescientist.net/about/ it should end with /)
    const urlObj = new URL(url)
    const pathname = urlObj.pathname

    if (pathname !== '/') {
      if (!pathname.endsWith('/')) {
        errors.push(`URL does not end with trailing slash: "${url}"`)
        failed = true
      }
    }

    // 2. Count routes
    if (pathname.startsWith('/herbs/')) {
      herbCount++
    } else if (pathname.startsWith('/compounds/')) {
      compoundCount++
    } else if (pathname.startsWith('/blog/')) {
      blogCount++
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
  console.log(`[validate-sitemap] Category counts: herbs=${herbCount}, compounds=${compoundCount}, blog=${blogCount}, guides=${guideCount}`)

  if (herbCount < 280) {
    errors.push(`Sitemap contains only ${herbCount} /herbs/* URLs (expected at least 280).`)
    failed = true
  }

  if (compoundCount < 550) {
    errors.push(`Sitemap contains only ${compoundCount} /compounds/* URLs (expected at least 550).`)
    failed = true;
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

  console.log('[validate-sitemap] PASS: Sitemap is fully valid (trailing slashes, route counts, and core pages).')
}

main()

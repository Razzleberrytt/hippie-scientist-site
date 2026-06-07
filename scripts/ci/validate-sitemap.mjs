import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REQUIRE_BUILT = process.argv.includes('--require-built')
const BAD_HOST = 'www.thehippiescientist.net'

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
  const requireBuilt = process.argv.includes('--require-built')

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
  let researchNotesCount = 0
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
    '/research-notes'
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

    if (urlObj.hostname !== 'thehippiescientist.net') {
      errors.push(`URL hostname is not canonical (expected "thehippiescientist.net"): "${url}"`)
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
    // 4. Count routes
    if (pathname.startsWith('/herbs/')) {
      herbCount++
    } else if (pathname.startsWith('/compounds/')) {
      compoundCount++
    } else if (pathname.startsWith('/research-notes/')) {
      researchNotesCount++
    } else if (pathname.startsWith('/guides/')) {
      guideCount++
    }

    // 5. Check core routes
    for (const core of expectedCorePrefixes) {
      if (pathname === core || pathname === `${core}/`) {
        foundCore.add(core)
      }
    }
  }

  // Asserts
  console.log(`[validate-sitemap] Category counts: herbs=${herbCount}, compounds=${compoundCount}, research-notes=${researchNotesCount}, guides=${guideCount}`)

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

  console.log('[validate-sitemap] PASS: Sitemap is fully valid (trailing slashes, route counts, built static files, and core pages).')
}

main()

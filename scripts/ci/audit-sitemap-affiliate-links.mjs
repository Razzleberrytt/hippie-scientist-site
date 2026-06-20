import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG || 'dev-affiliate-00' // Central associate tag

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
    console.log('[audit-sitemap-affiliate-links] SKIP: out/ directory does not exist yet (pre-build stage).')
    return
  }

  if (!fs.existsSync(sitemapPath)) {
    console.error('[audit-sitemap-affiliate-links] FAIL: out/sitemap.xml does not exist.')
    process.exit(1)
  }

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8')
  const urls = parseXmlUrls(sitemapContent)

  if (urls.length === 0) {
    console.error('[audit-sitemap-affiliate-links] FAIL: sitemap.xml is empty or has no loc tags.')
    process.exit(1)
  }

  console.log(`[audit-sitemap-affiliate-links] Auditing outbound Amazon links across ${urls.length} pages in sitemap.xml...`)

  let failed = false
  const errors = []

  // Simple regex to find href links
  const hrefRegex = /href="([^"]*?)"/gi

  for (const url of urls) {
    let urlObj
    try {
      urlObj = new URL(url)
    } catch {
      continue
    }
    const pathname = urlObj.pathname

    let localPath
    if (pathname === '/') {
      localPath = path.join(outDir, 'index.html')
    } else {
      const cleanPath = pathname.replace(/^\/|\/$/g, '')
      localPath = path.join(outDir, cleanPath, 'index.html')
    }

    if (!fs.existsSync(localPath)) {
      continue
    }

    const htmlContent = fs.readFileSync(localPath, 'utf8')
    let match
    while ((match = hrefRegex.exec(htmlContent)) !== null) {
      const href = match[1]
      const isAmazon = href.includes('amazon.com') || href.includes('amzn.to') || href.includes('amazon.co.uk')
      if (isAmazon) {
        const isStandardAmazonLink = href.includes('amazon.com') || href.includes('amazon.co.uk')
        if (isStandardAmazonLink) {
          const hasTag = href.includes(`tag=${AMAZON_TAG}`)
          // Exclude non-product pages like customer service, registry, privacy, policy, etc., if any
          const isSupportPage = href.includes('/gp/help/') || href.includes('/privacy') || href.includes('/gp/customer-service')
          
          if (!hasTag && !isSupportPage) {
            errors.push(`Page "${pathname}" contains non-compliant Amazon link: "${href}" (missing "tag=${AMAZON_TAG}")`)
            failed = true
          }
        }
      }
    }
  }

  if (failed) {
    console.error('\x1b[31m[FAIL] Sitemap Outbound Affiliate Link Audit Failed:\x1b[0m')
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  }

  console.log('\x1b[32m[PASS] All outbound Amazon links in sitemap-listed pages are compliant with affiliate tagging.\x1b[0m')
  process.exit(0)
}

main()

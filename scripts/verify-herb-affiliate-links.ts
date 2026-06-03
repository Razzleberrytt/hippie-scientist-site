import { herbProducts } from '../src/data/herbProducts'
import { DEFAULT_AMAZON_AFFILIATE_TAG } from '../src/data/curatedProducts'
import { isAmazonAffiliateUrl, normalizeAmazonAffiliateUrl } from '../src/utils/affiliateUrls'

type AffiliateRow = {
  herbSlug: string
  productName: string
  enabled: boolean
  sourceUrl: string
  normalizedUrl: string
  usesExpectedTrackingId: boolean
}

function main() {
  const rows: AffiliateRow[] = herbProducts.flatMap(entry =>
    entry.products.map(product => {
      const sourceUrl = product.affiliateUrl?.trim() ?? ''
      const normalizedUrl = normalizeAmazonAffiliateUrl(sourceUrl, DEFAULT_AMAZON_AFFILIATE_TAG)
      return {
        herbSlug: entry.herbSlug,
        productName: product.name,
        enabled: Boolean(sourceUrl),
        sourceUrl,
        normalizedUrl,
        usesExpectedTrackingId: isAmazonAffiliateUrl(normalizedUrl, DEFAULT_AMAZON_AFFILIATE_TAG),
      }
    }),
  )

  const enabledRows = rows.filter(row => row.enabled)
  const failures = enabledRows.filter(row => !row.usesExpectedTrackingId || !row.normalizedUrl)

  console.log('[verify-herb-affiliate-links] enabled product entries:')
  enabledRows.forEach(row => {
    const status = row.usesExpectedTrackingId ? 'OK' : 'FAIL'
    console.log(
      ` - ${status} ${row.herbSlug} :: ${row.productName} :: ${row.normalizedUrl || '(invalid link)'}`,
    )
  })

  if (failures.length > 0) {
    console.error(
      `[verify-herb-affiliate-links] FAIL ${failures.length}/${enabledRows.length} enabled product links are missing/invalid tracking tags.`,
    )
    process.exit(1)
  }

  console.log(
    `[verify-herb-affiliate-links] OK ${enabledRows.length} enabled links include tag=${DEFAULT_AMAZON_AFFILIATE_TAG}`,
  )
}

main()

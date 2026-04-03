import assert from 'node:assert/strict'
import { curatedProductRecommendations } from '@/data/curatedProducts'
import {
  assessCuratedProductReadiness,
  getRenderableCuratedProducts,
  getReviewRecencyState,
  hasGenericAffiliateLink,
  isMalformedAmazonProductUrl,
  resolveAffiliateUrl,
} from '@/lib/curatedProducts'
import { ANALYTICS_STORAGE_KEY } from '@/utils/analytics/eventStorage'

function installAnalyticsWindow(events: unknown[]) {
  const storage = new Map<string, string>()
  storage.set(ANALYTICS_STORAGE_KEY, JSON.stringify(events))

  ;(globalThis as typeof globalThis & { window?: unknown }).window = {
    localStorage: {
      getItem(key: string) {
        return storage.get(key) ?? null
      },
      setItem(key: string, value: string) {
        storage.set(key, value)
      },
      removeItem(key: string) {
        storage.delete(key)
      },
    },
    dispatchEvent() {
      return true
    },
  }
}

async function run() {
  const base = curatedProductRecommendations[0]

  const herbRows = getRenderableCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  })
  assert.equal(herbRows.length > 0, true)
  assert.equal(herbRows.every(row => row.researchStatus === 'approved' && row.active), true)
  assert.equal(herbRows.every(row => Boolean(row.rationaleShort) && Boolean(row.rationaleLong)), true)
  assert.equal(herbRows.every(row => Boolean(row.affiliateDisclosure)), true)
  assert.equal(herbRows.every(row => row.affiliateUrl.includes('tag=razzleberry02-20')), true)

  const noSources = getRenderableCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'high',
    sourceCount: 0,
  })
  assert.equal(noSources.length, 0)

  const lowConfidenceCompound = getRenderableCuratedProducts({
    entityType: 'compound',
    entitySlug: 'luteolin',
    confidence: 'low',
    sourceCount: 5,
  })
  assert.equal(lowConfidenceCompound.length > 0, true)

  const unknownEntity = getRenderableCuratedProducts({
    entityType: 'herb',
    entitySlug: 'unknown-herb',
    confidence: 'high',
    sourceCount: 3,
  })
  assert.equal(unknownEntity.length, 0)

  const rankedInput = curatedProductRecommendations
    .filter(product => product.entityType === 'herb' && product.entitySlug === 'ashwagandha')
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
  const candidateA = rankedInput[1]
  const candidateB = rankedInput[2]
  assert.ok(candidateA)
  assert.ok(candidateB)

  installAnalyticsWindow([
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712000001000 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712000000000 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateA.productId, timestamp: 1712000002000 },
  ])

  const boostedRows = getRenderableCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  })
  const boostedAlternativeRows = boostedRows.filter(product => !product.featured)
  assert.equal(boostedAlternativeRows[0]?.productId, candidateB.productId)

  assert.match(resolveAffiliateUrl(herbRows[0]), /tag=razzleberry02-20/)
  assert.equal(hasGenericAffiliateLink('https://www.amazon.com/s?k=ashwagandha'), true)
  assert.equal(isMalformedAmazonProductUrl('https://www.amazon.com/s?k=ashwagandha'), true)
  assert.equal(isMalformedAmazonProductUrl('https://www.amazon.com/dp/B07N7S35N5'), false)
  assert.equal(getReviewRecencyState(base, new Date('2026-03-30T00:00:00.000Z')), 'fresh')

  const invalid = {
    ...base,
    affiliateDisclosure: '',
    reviewedAt: '',
  }

  const readiness = assessCuratedProductReadiness({
    product: invalid,
    pageContext: {
      entityType: base.entityType,
      entitySlug: base.entitySlug,
      confidence: 'high',
      sourceCount: 2,
    },
  })

  assert.equal(readiness.renderEligible, false)
  assert.equal(readiness.failureReasons.includes('missing_disclosure'), true)
  assert.equal(readiness.failureReasons.includes('missing_reviewed_at'), true)
  assert.equal(readiness.reviewRecencyState, 'missing_reviewed_at')

  delete (globalThis as typeof globalThis & { window?: unknown }).window
}

run()

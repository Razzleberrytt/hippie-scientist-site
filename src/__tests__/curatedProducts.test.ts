import assert from 'node:assert/strict'
import { curatedProductRecommendations } from '@/data/curatedProducts'
import {
  assessCuratedProductReadiness,
  getTimeDecayWeight,
  getRenderableCuratedProducts,
  getReviewRecencyState,
  hasGenericAffiliateLink,
  isMalformedAmazonProductUrl,
  resolveAffiliateUrl,
} from '@/lib/curatedProducts'
import { ANALYTICS_STORAGE_KEY } from '@/utils/analytics/eventStorage'
import type { StoredAnalyticsEvent } from '@/utils/analytics/eventStorage'

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
  const TEST_NOW_MS = 1711965000000
  const renderCuratedProducts = (context: Parameters<typeof getRenderableCuratedProducts>[0]) =>
    getRenderableCuratedProducts(context, { nowMs: TEST_NOW_MS })
  const base = curatedProductRecommendations[0]

  const herbRows = renderCuratedProducts({
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

  const noSources = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'high',
    sourceCount: 0,
  })
  assert.equal(noSources.length, 0)

  const lowConfidenceCompound = renderCuratedProducts({
    entityType: 'compound',
    entitySlug: 'luteolin',
    confidence: 'low',
    sourceCount: 5,
  })
  assert.equal(lowConfidenceCompound.length > 0, true)

  const unknownEntity = renderCuratedProducts({
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
    ...Array.from({ length: 4 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateA.productId,
      position: 6,
      dwellTimeMs: 1000,
      timestamp: 1711950000000 + index,
    })),
    ...Array.from({ length: 4 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      position: 6,
      dwellTimeMs: 12000,
      timestamp: 1711950000100 + index,
    })),
  ])
  const dwellWeightedRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(dwellWeightedRows[0]?.productId, candidateB.productId)

  installAnalyticsWindow([
    ...Array.from({ length: 3 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateA.productId,
      position: 6,
      dwellTimeMs: 12000,
      timestamp: 1711960000000 + index,
    })),
    ...Array.from({ length: 6 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      position: 1,
      dwellTimeMs: 1000,
      timestamp: 1711960000100 + index,
    })),
  ])
  const positionWeightedRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(positionWeightedRows[0]?.productId, candidateA.productId)

  installAnalyticsWindow([
    ...Array.from({ length: 5 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateA.productId,
      position: 6,
      dwellTimeMs: 8000,
      timestamp: 1711970000000 + index,
    })),
    ...Array.from({ length: 5 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      position: 6,
      dwellTimeMs: 1000,
      timestamp: 1711970000100 + index,
    })),
  ])
  const shortDwellPenaltyRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(shortDwellPenaltyRows[0]?.productId, candidateA.productId)

  installAnalyticsWindow([
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712000001000 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712000000000 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateA.productId, timestamp: 1712000002000 },
  ])

  const boostedRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  })
  const boostedAlternativeRows = boostedRows.filter(product => !product.featured)
  // Minimum exposure safeguard: low-click alternatives still get promoted for exploration.
  assert.equal(boostedAlternativeRows[0]?.productId, candidateA.productId)

  const sixClickBurst = Array.from({ length: 6 }, (_, index) => ({
    type: 'curated_product_click',
    slug: 'herb:ashwagandha',
    item: candidateB.productId,
    timestamp: 1712100000000 + index,
  }))
  installAnalyticsWindow(sixClickBurst)
  const clickCapBaselineRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  })
  const clickCapBaselineAlternativeRows = clickCapBaselineRows.filter(product => !product.featured)

  installAnalyticsWindow(
    Array.from({ length: 12 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      timestamp: 1712100000000 + index,
    })),
  )
  const clickCappedRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  })
  const clickCappedAlternativeRows = clickCappedRows.filter(product => !product.featured)
  // Click cap: once the cap is hit, extra clicks do not further entrench rank order.
  assert.equal(clickCappedAlternativeRows[0]?.productId, clickCapBaselineAlternativeRows[0]?.productId)

  installAnalyticsWindow([
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateA.productId, timestamp: 1712200000000 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712200000001 },
  ])
  const closeScoreRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  })
  const closeScoreAlternativeRows = closeScoreRows.filter(product => !product.featured)
  // With close scores, deterministic jitter can reorder alternatives instead of strict click-only lock-in.
  assert.equal([candidateA.productId, candidateB.productId].includes(closeScoreAlternativeRows[0]?.productId || ''), true)

  installAnalyticsWindow([
    ...Array.from({ length: 2 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      useCaseAnchor: 'sleep',
      timestamp: 1712300000000 + index,
    })),
    ...Array.from({ length: 2 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateA.productId,
      useCaseAnchor: 'focus',
      timestamp: 1712300000100 + index,
    })),
  ])
  const sleepAnchorRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
    useCaseAnchor: 'sleep',
  }).filter(product => !product.featured)
  const focusAnchorRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
    useCaseAnchor: 'focus',
  }).filter(product => !product.featured)
  assert.equal(sleepAnchorRows[0]?.productId, candidateA.productId)
  assert.equal(focusAnchorRows[0]?.productId, candidateB.productId)

  installAnalyticsWindow([
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateA.productId, timestamp: 1712400000000 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712400000001 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712400000002 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712400000003 },
    { type: 'curated_product_click', slug: 'herb:ashwagandha', item: candidateB.productId, timestamp: 1712400000004 },
  ])
  const fallbackToGlobalRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
    useCaseAnchor: 'anxiety',
  }).filter(product => !product.featured)
  const globalRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(fallbackToGlobalRows[0]?.productId, globalRows[0]?.productId)

  installAnalyticsWindow([
    ...Array.from({ length: 2 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateA.productId,
      timestamp: 1712500000000 + index,
    })),
    ...Array.from({ length: 2 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      useCaseAnchor: 'sleep',
      timestamp: 1712500000100 + index,
    })),
  ])
  const anchorOverridesGlobalRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
    useCaseAnchor: 'sleep',
  }).filter(product => !product.featured)
  const globalWithAnchorDataRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.notEqual(anchorOverridesGlobalRows[0]?.productId, globalWithAnchorDataRows[0]?.productId)

  const oneDayMs = 24 * 60 * 60 * 1000
  const recentTimestamp = TEST_NOW_MS - oneDayMs
  const oldTimestamp = TEST_NOW_MS - oneDayMs * 20

  const recentOnlyEvents = [
    {
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      position: 6,
      dwellTimeMs: 12000,
      timestamp: TEST_NOW_MS - 2 * oneDayMs,
    },
  ] satisfies StoredAnalyticsEvent[]
  installAnalyticsWindow(recentOnlyEvents)
  const recentOnlyRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)

  installAnalyticsWindow([
    {
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateA.productId,
      position: 6,
      dwellTimeMs: 8000,
      timestamp: oldTimestamp,
    },
    {
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      position: 6,
      dwellTimeMs: 8000,
      timestamp: recentTimestamp,
    },
  ])
  const recencyRankRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(recencyRankRows[0]?.productId, candidateB.productId)

  installAnalyticsWindow([
    ...Array.from({ length: 5 }, (_, index) => ({
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateA.productId,
      timestamp: TEST_NOW_MS - 3 * oneDayMs + index,
    })),
    {
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateB.productId,
      timestamp: TEST_NOW_MS - 3 * oneDayMs,
    },
    {
      type: 'affiliate_conversion',
      herbSlug: 'ashwagandha',
      productId: candidateB.productId,
      timestamp: TEST_NOW_MS - 2 * oneDayMs,
    },
  ])
  const conversionDominatesClickRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(conversionDominatesClickRows[0]?.productId, candidateB.productId)

  installAnalyticsWindow([
    {
      type: 'affiliate_conversion',
      herbSlug: 'ashwagandha',
      productId: candidateA.productId,
      timestamp: TEST_NOW_MS - oneDayMs,
      valueUsd: 10,
    },
    {
      type: 'affiliate_conversion',
      herbSlug: 'ashwagandha',
      productId: candidateB.productId,
      timestamp: TEST_NOW_MS - oneDayMs,
      valueUsd: 120,
    },
  ])
  const highValueConversionRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(highValueConversionRows[0]?.productId, candidateB.productId)

  installAnalyticsWindow([
    {
      type: 'affiliate_conversion',
      herbSlug: 'ashwagandha',
      productId: candidateA.productId,
      timestamp: TEST_NOW_MS - 20 * oneDayMs,
      valueUsd: 200,
    },
    {
      type: 'affiliate_conversion',
      herbSlug: 'ashwagandha',
      productId: candidateB.productId,
      timestamp: TEST_NOW_MS - oneDayMs,
      valueUsd: 20,
    },
  ])
  const conversionRecencyRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(conversionRecencyRows[0]?.productId, candidateB.productId)

  const decayRecent = getTimeDecayWeight(recentTimestamp, TEST_NOW_MS)
  const decayOld = getTimeDecayWeight(oldTimestamp, TEST_NOW_MS)
  assert.equal(decayRecent > decayOld, true)

  const nearZeroTimestamp = TEST_NOW_MS - 59 * oneDayMs
  assert.equal(getTimeDecayWeight(nearZeroTimestamp, TEST_NOW_MS) < 0.01, true)

  installAnalyticsWindow([
    {
      type: 'curated_product_click',
      slug: 'herb:ashwagandha',
      item: candidateA.productId,
      position: 6,
      dwellTimeMs: 12000,
      timestamp: TEST_NOW_MS - 70 * oneDayMs,
    },
    ...recentOnlyEvents,
  ])
  const oldEventSkippedRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(oldEventSkippedRows[0]?.productId, recentOnlyRows[0]?.productId)

  const missingTimestampEvent = {
    type: 'curated_product_click',
    slug: 'herb:ashwagandha',
    item: candidateA.productId,
    position: 6,
    dwellTimeMs: 12000,
  } satisfies Omit<StoredAnalyticsEvent, 'timestamp'> & { timestamp?: number }
  assert.equal(getTimeDecayWeight(undefined, TEST_NOW_MS), 1)
  const explicitTimestampEvent = {
    ...missingTimestampEvent,
    timestamp: TEST_NOW_MS,
  } satisfies StoredAnalyticsEvent
  installAnalyticsWindow([explicitTimestampEvent])
  const explicitTimestampRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  installAnalyticsWindow([missingTimestampEvent])
  const missingTimestampRows = renderCuratedProducts({
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    confidence: 'medium',
    sourceCount: 3,
  }).filter(product => !product.featured)
  assert.equal(missingTimestampRows[0]?.productId, explicitTimestampRows[0]?.productId)

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

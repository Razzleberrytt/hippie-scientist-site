import { describe, expect, it } from 'vitest'
import { CURATED_PRODUCT_STALE_REVIEW_DAYS } from '@/data/curatedProducts'
import { assessCuratedProductReadiness, getReviewRecencyState } from '../curatedProducts'

const NOW = new Date('2026-08-15T12:00:00.000Z')

function productWithReviewedAt(reviewedAt: string) {
  return {
    entityType: 'herb',
    entitySlug: 'test-herb',
    productId: 'test-product',
    productTitle: 'Test Product',
    amazonUrl: 'https://www.amazon.com/dp/B000000001',
    active: true,
    featured: false,
    sortOrder: 1,
    confidenceTierRequired: 'low',
    researchStatus: 'approved',
    reviewedAt,
    affiliateDisclosure: 'Affiliate disclosure',
    rationaleShort: 'Short rationale',
    rationaleLong: 'Long rationale',
    bestFor: ['testing'],
  } as any
}

const pageContext = {
  entityType: 'herb' as const,
  entitySlug: 'test-herb',
  confidence: 'low' as const,
  sourceCount: 1,
}

function isoDaysBefore(days: number) {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

describe('curated product review recency', () => {
  it('keeps a current review fresh', () => {
    expect(getReviewRecencyState(productWithReviewedAt(NOW.toISOString()), NOW)).toBe('fresh')
  })

  it('keeps the configured grace window distinct from expired reviews', () => {
    expect(CURATED_PRODUCT_STALE_REVIEW_DAYS).toBeGreaterThan(0)
    const graceReview = productWithReviewedAt(isoDaysBefore(CURATED_PRODUCT_STALE_REVIEW_DAYS + 5))
    expect(getReviewRecencyState(graceReview, NOW)).toBe('stale_grace')

    const expiredReview = productWithReviewedAt(isoDaysBefore(CURATED_PRODUCT_STALE_REVIEW_DAYS + 31))
    expect(getReviewRecencyState(expiredReview, NOW)).toBe('stale_expired')
  })

  it('treats malformed review timestamps as invalid and non-renderable', () => {
    const product = productWithReviewedAt('not-a-date')
    expect(getReviewRecencyState(product, NOW)).toBe('missing_reviewed_at')

    const readiness = assessCuratedProductReadiness({ product, pageContext, now: NOW })
    expect(readiness.renderEligible).toBe(false)
    expect(readiness.failureReasons).toContain('missing_reviewed_at')
    expect(readiness.requiresManualReview).toBe(true)
  })

  it('rejects materially future-dated approvals with an explicit failure reason', () => {
    const future = new Date(NOW.getTime() + 60 * 60 * 1000).toISOString()
    const product = productWithReviewedAt(future)
    expect(getReviewRecencyState(product, NOW)).toBe('future_reviewed_at')

    const readiness = assessCuratedProductReadiness({ product, pageContext, now: NOW })
    expect(readiness.renderEligible).toBe(false)
    expect(readiness.failureReasons).toContain('future_reviewed_at')
    expect(readiness.requiresManualReview).toBe(true)
  })

  it('allows only a small clock-skew tolerance', () => {
    const fourMinutesAhead = new Date(NOW.getTime() + 4 * 60 * 1000).toISOString()
    expect(getReviewRecencyState(productWithReviewedAt(fourMinutesAhead), NOW)).toBe('fresh')
  })
})

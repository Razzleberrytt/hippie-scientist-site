import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import {
  curatedProductRecommendations,
  DEFAULT_AMAZON_AFFILIATE_TAG,
  CURATED_PRODUCT_STALE_REVIEW_DAYS,
  type CuratedProductEntityType,
  type CuratedProductRecommendation,
} from '@/data/curatedProducts'

type CuratedProductPageContext = {
  entityType: CuratedProductEntityType
  entitySlug: string
  confidence: ConfidenceLevel
  sourceCount: number
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

const GENERIC_AFFILIATE_PATTERNS: RegExp[] = [
  /amazon\.[^/]+\/s[/?]/i,
  /amazon\.[^/]+\/gp\/search/i,
  /amazon\.[^/]+\/b\?/i,
  /amazon\.[^/]+\/best-sellers/i,
  /etsy\.com\/market\//i,
  /\bsearch\b/i,
  /placeholder/i,
]

function hasTrimmedText(value: string | undefined): boolean {
  return Boolean(value?.trim())
}

function hasReviewApproval(product: CuratedProductRecommendation) {
  return product.researchStatus === 'approved' && hasTrimmedText(product.reviewedAt)
}

function supportsConfidence(product: CuratedProductRecommendation, pageConfidence: ConfidenceLevel) {
  return CONFIDENCE_RANK[pageConfidence] >= CONFIDENCE_RANK[product.confidenceTierRequired]
}

function appendAmazonTag(url: string, tag: string) {
  try {
    const parsed = new URL(url)
    parsed.searchParams.set('tag', tag)
    return parsed.toString()
  } catch {
    return ''
  }
}

function parseDate(value: string): Date | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function isStaleReview(product: CuratedProductRecommendation, now: Date = new Date()): boolean {
  if (!CURATED_PRODUCT_STALE_REVIEW_DAYS || CURATED_PRODUCT_STALE_REVIEW_DAYS <= 0) return false
  const reviewedAt = parseDate(product.reviewedAt)
  if (!reviewedAt) return true

  const elapsedMs = now.getTime() - reviewedAt.getTime()
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)
  return elapsedDays > CURATED_PRODUCT_STALE_REVIEW_DAYS
}

export function resolveAffiliateUrl(product: CuratedProductRecommendation): string {
  if (!product.amazonUrl.trim()) return ''
  if (product.affiliateTagStrategy === 'already_tagged') return product.amazonUrl
  return appendAmazonTag(product.amazonUrl, DEFAULT_AMAZON_AFFILIATE_TAG)
}

export function hasGenericAffiliateLink(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return true

  return GENERIC_AFFILIATE_PATTERNS.some(pattern => pattern.test(trimmed))
}

export type CuratedProductReadinessFailureReason =
  | 'missing_disclosure'
  | 'missing_rationale'
  | 'missing_research_status'
  | 'missing_reviewed_at'
  | 'inactive'
  | 'entity_page_mismatch'
  | 'confidence_tier_not_met'
  | 'stale_review'
  | 'generic_affiliate_link'
  | 'missing_best_for'

export type CuratedProductReadiness = {
  entitySlug: string
  entityType: CuratedProductEntityType
  productId: string
  renderEligible: boolean
  failureReasons: CuratedProductReadinessFailureReason[]
  disclosurePresent: boolean
  rationalePresent: boolean
  researchedReviewedStatusPresent: boolean
  reviewedAt: string
  active: boolean
  confidenceTierRequired: ConfidenceLevel
  pageConfidenceTier: ConfidenceLevel
  stale: boolean
  genericLinkDetected: boolean
}

export function assessCuratedProductReadiness(params: {
  product: CuratedProductRecommendation
  pageContext: CuratedProductPageContext
  now?: Date
}): CuratedProductReadiness {
  const { product, pageContext, now } = params
  const affiliateUrl = resolveAffiliateUrl(product)
  const disclosurePresent = hasTrimmedText(product.affiliateDisclosure)
  const rationalePresent = hasTrimmedText(product.rationaleShort) && hasTrimmedText(product.rationaleLong)
  const researchedReviewedStatusPresent = hasTrimmedText(product.researchStatus)
  const reviewedAtPresent = hasTrimmedText(product.reviewedAt)
  const stale = isStaleReview(product, now)
  const genericLinkDetected = hasGenericAffiliateLink(affiliateUrl)

  const failureReasons: CuratedProductReadinessFailureReason[] = []

  if (!disclosurePresent) failureReasons.push('missing_disclosure')
  if (!rationalePresent) failureReasons.push('missing_rationale')
  if (!researchedReviewedStatusPresent) failureReasons.push('missing_research_status')
  if (!reviewedAtPresent) failureReasons.push('missing_reviewed_at')
  if (!product.active) failureReasons.push('inactive')
  if (product.entityType !== pageContext.entityType || product.entitySlug !== pageContext.entitySlug) {
    failureReasons.push('entity_page_mismatch')
  }
  if (!supportsConfidence(product, pageContext.confidence)) failureReasons.push('confidence_tier_not_met')
  if (!hasReviewApproval(product)) {
    if (!failureReasons.includes('missing_reviewed_at')) failureReasons.push('missing_reviewed_at')
    if (product.researchStatus !== 'approved' && !failureReasons.includes('missing_research_status')) {
      failureReasons.push('missing_research_status')
    }
  }
  if (stale) failureReasons.push('stale_review')
  if (genericLinkDetected) failureReasons.push('generic_affiliate_link')
  if (!Array.isArray(product.bestFor) || product.bestFor.length === 0) failureReasons.push('missing_best_for')

  return {
    entitySlug: product.entitySlug,
    entityType: product.entityType,
    productId: product.productId,
    renderEligible: failureReasons.length === 0,
    failureReasons,
    disclosurePresent,
    rationalePresent,
    researchedReviewedStatusPresent,
    reviewedAt: product.reviewedAt,
    active: product.active,
    confidenceTierRequired: product.confidenceTierRequired,
    pageConfidenceTier: pageContext.confidence,
    stale,
    genericLinkDetected,
  }
}

export type RenderableCuratedProduct = CuratedProductRecommendation & {
  affiliateUrl: string
}

export function getRenderableCuratedProducts(
  context: CuratedProductPageContext
): RenderableCuratedProduct[] {
  if (context.sourceCount <= 0) return []

  return curatedProductRecommendations
    .filter(product => product.entityType === context.entityType && product.entitySlug === context.entitySlug)
    .map(product => ({
      product,
      readiness: assessCuratedProductReadiness({ product, pageContext: context }),
    }))
    .filter(entry => entry.readiness.renderEligible)
    .map(({ product }) => ({
      ...product,
      affiliateUrl: resolveAffiliateUrl(product),
    }))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
}

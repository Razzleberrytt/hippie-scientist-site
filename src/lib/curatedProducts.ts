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
  /amazon\.[^/]+\/gp\/bestsellers/i,
  /amazon\.[^/]+\/best-sellers/i,
  /amazon\.[^/]+\/gp\/aw\/s/i,
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

const REVIEW_GRACE_PERIOD_DAYS = 30

export type ReviewRecencyState = 'fresh' | 'stale_grace' | 'stale_expired' | 'missing_reviewed_at'

function getReviewAgeDays(product: CuratedProductRecommendation, now: Date = new Date()): number | null {
  const reviewedAt = parseDate(product.reviewedAt)
  if (!reviewedAt) return null

  const elapsedMs = now.getTime() - reviewedAt.getTime()
  return elapsedMs / (1000 * 60 * 60 * 24)
}

export function getReviewRecencyState(
  product: CuratedProductRecommendation,
  now: Date = new Date()
): ReviewRecencyState {
  if (!CURATED_PRODUCT_STALE_REVIEW_DAYS || CURATED_PRODUCT_STALE_REVIEW_DAYS <= 0) return 'fresh'
  const elapsedDays = getReviewAgeDays(product, now)
  if (elapsedDays === null) return 'missing_reviewed_at'
  if (elapsedDays <= CURATED_PRODUCT_STALE_REVIEW_DAYS) return 'fresh'
  if (elapsedDays <= CURATED_PRODUCT_STALE_REVIEW_DAYS + REVIEW_GRACE_PERIOD_DAYS) return 'stale_grace'
  return 'stale_expired'
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

function isAmazonDomain(hostname: string): boolean {
  const normalized = hostname.toLowerCase()
  return normalized === 'amazon.com' || normalized === 'www.amazon.com'
}

export function isMalformedAmazonProductUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (!isAmazonDomain(parsed.hostname)) return true

    const path = parsed.pathname.trim()
    if (!path || path === '/') return true

    const asinMatch = path.match(/\/(?:dp|gp\/product)\/([a-zA-Z0-9]{10})(?:[/?]|$)/)
    return !asinMatch
  } catch {
    return true
  }
}

export type CuratedProductReadinessFailureReason =
  | 'missing_disclosure'
  | 'missing_rationale'
  | 'missing_research_status'
  | 'missing_reviewed_at'
  | 'inactive'
  | 'entity_page_mismatch'
  | 'confidence_tier_not_met'
  | 'stale_review_expired'
  | 'generic_affiliate_link'
  | 'malformed_amazon_url'
  | 'missing_best_for'
  | 'duplicate_product_mapping'

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
  reviewRecencyState: ReviewRecencyState
  reviewAgeDays: number | null
  stale: boolean
  staleWithinGracePeriod: boolean
  genericLinkDetected: boolean
  malformedUrlDetected: boolean
  requiresManualReview: boolean
  warningReasons: string[]
}

export function assessCuratedProductReadiness(params: {
  product: CuratedProductRecommendation
  pageContext: CuratedProductPageContext
  now?: Date
  duplicateProductMappingDetected?: boolean
}): CuratedProductReadiness {
  const { product, pageContext, now, duplicateProductMappingDetected = false } = params
  const affiliateUrl = resolveAffiliateUrl(product)
  const disclosurePresent = hasTrimmedText(product.affiliateDisclosure)
  const rationalePresent = hasTrimmedText(product.rationaleShort) && hasTrimmedText(product.rationaleLong)
  const researchedReviewedStatusPresent = hasTrimmedText(product.researchStatus)
  const reviewedAtPresent = hasTrimmedText(product.reviewedAt)
  const reviewRecencyState = getReviewRecencyState(product, now)
  const reviewAgeDays = getReviewAgeDays(product, now)
  const stale = reviewRecencyState === 'stale_grace' || reviewRecencyState === 'stale_expired'
  const staleWithinGracePeriod = reviewRecencyState === 'stale_grace'
  const genericLinkDetected = hasGenericAffiliateLink(affiliateUrl)
  const malformedUrlDetected = isMalformedAmazonProductUrl(product.amazonUrl)
  const warningReasons: string[] = []

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
  if (reviewRecencyState === 'stale_grace') warningReasons.push('stale_review_grace_period')
  if (reviewRecencyState === 'stale_expired') failureReasons.push('stale_review_expired')
  if (genericLinkDetected) failureReasons.push('generic_affiliate_link')
  if (malformedUrlDetected) failureReasons.push('malformed_amazon_url')
  if (!Array.isArray(product.bestFor) || product.bestFor.length === 0) failureReasons.push('missing_best_for')
  if (duplicateProductMappingDetected) failureReasons.push('duplicate_product_mapping')

  const requiresManualReview =
    warningReasons.length > 0 ||
    staleWithinGracePeriod ||
    genericLinkDetected ||
    malformedUrlDetected ||
    reviewRecencyState === 'missing_reviewed_at'

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
    reviewRecencyState,
    reviewAgeDays,
    stale,
    staleWithinGracePeriod,
    genericLinkDetected,
    malformedUrlDetected,
    requiresManualReview,
    warningReasons,
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

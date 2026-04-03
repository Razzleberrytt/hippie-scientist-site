import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import {
  curatedProductRecommendations,
  DEFAULT_AMAZON_AFFILIATE_TAG,
  CURATED_PRODUCT_STALE_REVIEW_DAYS,
  type CuratedProductEntityType,
  type CuratedProductRecommendation,
} from '@/data/curatedProducts'
import { normalizeAmazonAffiliateUrl } from '@/utils/affiliateUrls'
import { readAnalyticsEvents, type StoredAnalyticsEvent } from '@/utils/analytics/eventStorage'
import type { AffiliateUseCaseAnchor } from '@/lib/affiliateClickTracking'

type CuratedProductPageContext = {
  entityType: CuratedProductEntityType
  entitySlug: string
  confidence: ConfidenceLevel
  sourceCount: number
  useCaseAnchor?: AffiliateUseCaseAnchor
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

function supportsConfidence(
  product: CuratedProductRecommendation,
  pageConfidence: ConfidenceLevel,
) {
  return CONFIDENCE_RANK[pageConfidence] >= CONFIDENCE_RANK[product.confidenceTierRequired]
}

function parseDate(value: string): Date | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const REVIEW_GRACE_PERIOD_DAYS = 30

export type ReviewRecencyState = 'fresh' | 'stale_grace' | 'stale_expired' | 'missing_reviewed_at'

function getReviewAgeDays(
  product: CuratedProductRecommendation,
  now: Date = new Date(),
): number | null {
  const reviewedAt = parseDate(product.reviewedAt)
  if (!reviewedAt) return null

  const elapsedMs = now.getTime() - reviewedAt.getTime()
  return elapsedMs / (1000 * 60 * 60 * 24)
}

export function getReviewRecencyState(
  product: CuratedProductRecommendation,
  now: Date = new Date(),
): ReviewRecencyState {
  if (!CURATED_PRODUCT_STALE_REVIEW_DAYS || CURATED_PRODUCT_STALE_REVIEW_DAYS <= 0) return 'fresh'
  const elapsedDays = getReviewAgeDays(product, now)
  if (elapsedDays === null) return 'missing_reviewed_at'
  if (elapsedDays <= CURATED_PRODUCT_STALE_REVIEW_DAYS) return 'fresh'
  if (elapsedDays <= CURATED_PRODUCT_STALE_REVIEW_DAYS + REVIEW_GRACE_PERIOD_DAYS)
    return 'stale_grace'
  return 'stale_expired'
}

export function resolveAffiliateUrl(product: CuratedProductRecommendation): string {
  if (!product.amazonUrl.trim()) return ''
  return normalizeAmazonAffiliateUrl(product.amazonUrl, DEFAULT_AMAZON_AFFILIATE_TAG)
}

export function hasGenericAffiliateLink(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return true

  return GENERIC_AFFILIATE_PATTERNS.some(pattern => pattern.test(trimmed))
}

export function isMalformedAmazonProductUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    if (hostname !== 'amazon.com' && hostname !== 'www.amazon.com') return true

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
  const rationalePresent =
    hasTrimmedText(product.rationaleShort) && hasTrimmedText(product.rationaleLong)
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
  if (
    product.entityType !== pageContext.entityType ||
    product.entitySlug !== pageContext.entitySlug
  ) {
    failureReasons.push('entity_page_mismatch')
  }
  if (!supportsConfidence(product, pageContext.confidence))
    failureReasons.push('confidence_tier_not_met')
  if (!hasReviewApproval(product)) {
    if (!failureReasons.includes('missing_reviewed_at')) failureReasons.push('missing_reviewed_at')
    if (
      product.researchStatus !== 'approved' &&
      !failureReasons.includes('missing_research_status')
    ) {
      failureReasons.push('missing_research_status')
    }
  }
  if (reviewRecencyState === 'stale_grace') warningReasons.push('stale_review_grace_period')
  if (reviewRecencyState === 'stale_expired') failureReasons.push('stale_review_expired')
  if (genericLinkDetected) failureReasons.push('generic_affiliate_link')
  if (malformedUrlDetected) failureReasons.push('malformed_amazon_url')
  if (!Array.isArray(product.bestFor) || product.bestFor.length === 0)
    failureReasons.push('missing_best_for')
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

const CLICK_CAP = 6
const CLICK_WEIGHT = 1
const CONVERSION_WEIGHT = 3
const MIN_EXPOSURE_CLICKS = 2
const MIN_EXPOSURE_BOOST = 1.25
const MIN_DATA_THRESHOLD = 4
const COLD_START_BASE_PRIOR = 0.5
const COLD_START_BOOST_CAP = 0.65
const HIGH_CONVERSION_PROTECTION_THRESHOLD = 0.75
const CLOSE_SCORE_DELTA = 0.35
const TIME_DECAY_HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000
const MAX_CLICK_EVENT_AGE_MS = 60 * 24 * 60 * 60 * 1000

function getHerbSlugFromAnalyticsEvent(event: { slug?: string; entitySlug?: string }): string | null {
  const slug = String(event.slug || '').trim()
  if (slug.startsWith('herb:')) return slug.slice('herb:'.length)
  return null
}

type ProductClickMetrics = {
  rawCount: number
  weightedScore: number
  weightedEventCount: number
}
type ClickMetricsByProductId = Record<string, ProductClickMetrics>
type HerbClickMetricsByAnchor = Record<string, ClickMetricsByProductId>
type HerbProductClickMetricsByAnchor = Record<string, HerbClickMetricsByAnchor>
type ProductConversionScores = Record<string, number>
type HerbConversionScoresByAnchor = Record<string, ProductConversionScores>
type HerbProductConversionScoresByAnchor = Record<string, HerbConversionScoresByAnchor>

function getPositionWeight(position: number): number {
  if (position <= 2) return 0.6
  if (position <= 5) return 0.8
  return 1
}

function getDwellWeight(dwellTimeMs: number | null): number {
  if (dwellTimeMs === null) return 1
  if (dwellTimeMs < 3000) return 0.5
  if (dwellTimeMs < 10000) return 1
  return 1.5
}

export function getTimeDecayWeight(timestamp?: number, nowMs: number = Date.now()): number {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return 1

  const ageMs = Math.max(0, nowMs - timestamp)
  return Math.pow(0.5, ageMs / TIME_DECAY_HALF_LIFE_MS)
}

function shouldSkipByAge(timestamp?: number, nowMs: number = Date.now()): boolean {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return false
  const ageMs = Math.max(0, nowMs - timestamp)
  return ageMs > MAX_CLICK_EVENT_AGE_MS
}

function hasWeightedSignal(event: StoredAnalyticsEvent): boolean {
  return typeof event.position === 'number' || 'dwellTimeMs' in event
}

function getEventWeightedScore(event: StoredAnalyticsEvent, nowMs: number): number {
  const position = typeof event.position === 'number' && Number.isFinite(event.position) ? event.position : 6
  const dwellTimeMs =
    event.dwellTimeMs === null || (typeof event.dwellTimeMs === 'number' && Number.isFinite(event.dwellTimeMs))
      ? event.dwellTimeMs
      : null
  const timeDecayWeight = getTimeDecayWeight(event.timestamp, nowMs)
  return getPositionWeight(position) * getDwellWeight(dwellTimeMs) * timeDecayWeight
}

export function getWeightedClickScore(events: StoredAnalyticsEvent[], nowMs: number = Date.now()): number {
  return events.reduce((total, event) => {
    if (shouldSkipByAge(event.timestamp, nowMs)) return total
    return total + getEventWeightedScore(event, nowMs)
  }, 0)
}

function addClickEvent(
  metrics: ClickMetricsByProductId,
  productId: string,
  event: StoredAnalyticsEvent,
  nowMs: number,
) {
  if (shouldSkipByAge(event.timestamp, nowMs)) return

  const next = (metrics[productId] ||= {
    rawCount: 0,
    weightedScore: 0,
    weightedEventCount: 0,
  })

  next.rawCount += 1
  if (hasWeightedSignal(event)) {
    next.weightedScore += getEventWeightedScore(event, nowMs)
    next.weightedEventCount += 1
  }
}

function getHerbProductClickCountsByAnchor(nowMs: number): HerbProductClickMetricsByAnchor {
  const countsByHerb: HerbProductClickMetricsByAnchor = {}

  const events = readAnalyticsEvents()
  events.forEach(event => {
    if (event.type !== 'curated_product_click') return
    const herbSlug = getHerbSlugFromAnalyticsEvent(event)
    if (!herbSlug) return
    const productId = String(event.item || '').trim()
    if (!productId) return

    const herbCounts = (countsByHerb[herbSlug] ||= {})
    const globalCounts = (herbCounts.__global ||= {})
    addClickEvent(globalCounts, productId, event, nowMs)

    const anchorKey = String(event.useCaseAnchor || '').trim()
    if (!anchorKey) return
    const anchorCounts = (herbCounts[anchorKey] ||= {})
    addClickEvent(anchorCounts, productId, event, nowMs)
  })

  return countsByHerb
}

function getConversionEventScore(event: StoredAnalyticsEvent, nowMs: number): number {
  const base = 1
  const valueWeight =
    typeof event.valueUsd === 'number' && Number.isFinite(event.valueUsd) && event.valueUsd > 0
      ? Math.log(1 + event.valueUsd)
      : 1
  const timeDecayWeight = getTimeDecayWeight(event.timestamp, nowMs)
  return base * valueWeight * timeDecayWeight
}

function addConversionEvent(
  scores: ProductConversionScores,
  productId: string,
  event: StoredAnalyticsEvent,
  nowMs: number,
) {
  if (shouldSkipByAge(event.timestamp, nowMs)) return
  scores[productId] = (scores[productId] || 0) + getConversionEventScore(event, nowMs)
}

export function getHerbProductConversionScores(nowMs: number): HerbProductConversionScoresByAnchor {
  const scoresByHerb: HerbProductConversionScoresByAnchor = {}
  const events = readAnalyticsEvents()

  events.forEach(event => {
    if (event.type !== 'affiliate_conversion') return

    const herbSlug = String(event.herbSlug || '').trim() || getHerbSlugFromAnalyticsEvent(event)
    if (!herbSlug) return

    const productId = String(event.productId || event.item || '').trim()
    if (!productId) return

    const herbScores = (scoresByHerb[herbSlug] ||= {})
    const globalScores = (herbScores.__global ||= {})
    addConversionEvent(globalScores, productId, event, nowMs)

    const anchorKey = String(event.useCaseAnchor || '').trim()
    if (!anchorKey) return
    const anchorScores = (herbScores[anchorKey] ||= {})
    addConversionEvent(anchorScores, productId, event, nowMs)
  })

  return scoresByHerb
}

function cappedClickScore(clickCount: number): number {
  if (clickCount <= 0) return 0
  return Math.log2(Math.min(clickCount, CLICK_CAP) + 1)
}

function exposureBoost(clickCount: number): number {
  if (clickCount >= MIN_EXPOSURE_CLICKS) return 0
  return (MIN_EXPOSURE_CLICKS - clickCount) * MIN_EXPOSURE_BOOST
}

function isColdStart(params: { totalClickScore: number; totalConversionScore: number }): boolean {
  return params.totalClickScore < MIN_DATA_THRESHOLD && params.totalConversionScore === 0
}

function getColdStartBoost(product: CuratedProductRecommendation): number {
  let prior = COLD_START_BASE_PRIOR

  const typedProduct = product as CuratedProductRecommendation & {
    rating?: number
    reviewCount?: number
    priceCompetitiveness?: number
  }

  if (typeof typedProduct.rating === 'number' && Number.isFinite(typedProduct.rating)) {
    const normalizedRating = Math.max(0, Math.min(typedProduct.rating, 5)) / 5
    prior += normalizedRating * 0.05
  }
  if (typeof typedProduct.reviewCount === 'number' && Number.isFinite(typedProduct.reviewCount)) {
    prior += Math.min(typedProduct.reviewCount, 500) / 5000
  }
  if (
    typeof typedProduct.priceCompetitiveness === 'number' &&
    Number.isFinite(typedProduct.priceCompetitiveness)
  ) {
    prior += Math.max(-1, Math.min(typedProduct.priceCompetitiveness, 1)) * 0.05
  }

  return Math.max(0, Math.min(prior, COLD_START_BOOST_CAP))
}

function getColdStartScoreBoost(
  product: CuratedProductRecommendation,
  clickEvidenceScore: number,
): number {
  const decayedBoost = getColdStartBoost(product) * Math.exp(-clickEvidenceScore)
  return Math.min(COLD_START_BOOST_CAP, decayedBoost)
}

function deterministicJitter(seed: string): number {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }
  return (hash % 1000) / 1000
}

export function getRenderableCuratedProducts(
  context: CuratedProductPageContext,
  options?: { nowMs?: number },
): RenderableCuratedProduct[] {
  if (context.sourceCount <= 0) return []
  const nowMs = options?.nowMs ?? Date.now()
  const herbClickCountsByAnchor =
    context.entityType === 'herb'
      ? getHerbProductClickCountsByAnchor(nowMs)[context.entitySlug]
      : null
  const herbConversionScoresByAnchor =
    context.entityType === 'herb'
      ? getHerbProductConversionScores(nowMs)[context.entitySlug]
      : null
  const activeAnchorKey = String(context.useCaseAnchor || '').trim()
  const anchorSpecificClickCounts =
    activeAnchorKey && herbClickCountsByAnchor ? herbClickCountsByAnchor[activeAnchorKey] : undefined
  const anchorSpecificConversionScores =
    activeAnchorKey && herbConversionScoresByAnchor
      ? herbConversionScoresByAnchor[activeAnchorKey]
      : undefined
  const resolvedClickCounts =
    anchorSpecificClickCounts && Object.keys(anchorSpecificClickCounts).length > 0
      ? anchorSpecificClickCounts
      : herbClickCountsByAnchor?.__global
  const resolvedConversionScores =
    anchorSpecificConversionScores && Object.keys(anchorSpecificConversionScores).length > 0
      ? anchorSpecificConversionScores
      : herbConversionScoresByAnchor?.__global

  return curatedProductRecommendations
    .filter(
      product =>
        product.entityType === context.entityType && product.entitySlug === context.entitySlug,
    )
    .map(product => ({
      product,
      readiness: assessCuratedProductReadiness({ product, pageContext: context }),
    }))
    .filter(entry => entry.readiness.renderEligible)
    .map(({ product }) => ({
      ...product,
      affiliateUrl: resolveAffiliateUrl(product),
    }))
    .sort((a, b) => {
      const featuredRank = Number(b.featured) - Number(a.featured)
      if (featuredRank !== 0) return featuredRank

      const aMetrics = resolvedClickCounts?.[a.productId]
      const bMetrics = resolvedClickCounts?.[b.productId]
      const aClickEvidenceScore = aMetrics?.rawCount || 0
      const bClickEvidenceScore = bMetrics?.rawCount || 0
      const aClicks = aMetrics
        ? aMetrics.weightedEventCount > 0
          ? aMetrics.weightedScore
          : aMetrics.rawCount
        : 0
      const bClicks = bMetrics
        ? bMetrics.weightedEventCount > 0
          ? bMetrics.weightedScore
          : bMetrics.rawCount
        : 0
      const aConversionScore = resolvedConversionScores?.[a.productId] || 0
      const bConversionScore = resolvedConversionScores?.[b.productId] || 0
      const aColdStartBoost = isColdStart({
        totalClickScore: aClicks,
        totalConversionScore: aConversionScore,
      })
        ? getColdStartScoreBoost(a, aClickEvidenceScore)
        : 0
      const bColdStartBoost = isColdStart({
        totalClickScore: bClicks,
        totalConversionScore: bConversionScore,
      })
        ? getColdStartScoreBoost(b, bClickEvidenceScore)
        : 0
      const baseScore = 0
      const aScore =
        baseScore +
        cappedClickScore(aClicks) * CLICK_WEIGHT +
        aConversionScore * CONVERSION_WEIGHT +
        aColdStartBoost +
        exposureBoost(aClicks)
      const bScore =
        baseScore +
        cappedClickScore(bClicks) * CLICK_WEIGHT +
        bConversionScore * CONVERSION_WEIGHT +
        bColdStartBoost +
        exposureBoost(bClicks)
      const scoreDelta = bScore - aScore

      const aProtectedByConversion = aConversionScore >= HIGH_CONVERSION_PROTECTION_THRESHOLD
      const bProtectedByConversion = bConversionScore >= HIGH_CONVERSION_PROTECTION_THRESHOLD
      if (aProtectedByConversion !== bProtectedByConversion) {
        return bProtectedByConversion ? 1 : -1
      }

      if (Math.abs(scoreDelta) > CLOSE_SCORE_DELTA) return scoreDelta > 0 ? 1 : -1

      const jitterDelta =
        deterministicJitter(`${context.entitySlug}:${b.productId}`) -
        deterministicJitter(`${context.entitySlug}:${a.productId}`)
      if (Math.abs(jitterDelta) > Number.EPSILON) return jitterDelta > 0 ? 1 : -1

      return a.sortOrder - b.sortOrder
    })
}

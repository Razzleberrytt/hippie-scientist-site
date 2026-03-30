import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import {
  curatedProductRecommendations,
  DEFAULT_AMAZON_AFFILIATE_TAG,
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

function hasRequiredCopy(product: CuratedProductRecommendation) {
  return Boolean(product.rationaleShort.trim() && product.rationaleLong.trim() && product.reviewedBy.trim())
}

function hasReviewApproval(product: CuratedProductRecommendation) {
  return product.researchStatus === 'approved' && Boolean(product.reviewedAt.trim())
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

export function resolveAffiliateUrl(product: CuratedProductRecommendation): string {
  if (!product.amazonUrl.trim()) return ''
  if (product.affiliateTagStrategy === 'already_tagged') return product.amazonUrl
  return appendAmazonTag(product.amazonUrl, DEFAULT_AMAZON_AFFILIATE_TAG)
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
    .filter(product => product.active)
    .filter(product => hasReviewApproval(product))
    .filter(product => hasRequiredCopy(product))
    .filter(product => supportsConfidence(product, context.confidence))
    .map(product => ({
      ...product,
      affiliateUrl: resolveAffiliateUrl(product),
    }))
    .filter(product => Boolean(product.affiliateUrl))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
}

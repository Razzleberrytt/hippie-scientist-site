export type CuratedProductEntityType = 'herb' | 'compound'

export type CuratedProductRecommendation = {
  productId: string
  entityType: CuratedProductEntityType
  entitySlug: string
  active: boolean
  confidenceTierRequired: 'low' | 'medium' | 'high'
  affiliateDisclosure: string
  rationaleShort: string
  rationaleLong: string
  researchStatus: string
  reviewedAt: string
  amazonUrl: string
  bestFor: string[]
  brand: string
  productType: string
  formNotes: string
  cautionNotes: string[]
  avoidIf: string[]
  productTitle: string
  reviewedBy: string
}

export const curatedProductRecommendations: CuratedProductRecommendation[] = []

export const DEFAULT_AMAZON_AFFILIATE_TAG = ''

export const CURATED_PRODUCT_STALE_REVIEW_DAYS = 0

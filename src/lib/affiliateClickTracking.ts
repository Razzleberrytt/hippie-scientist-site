import { appendAnalyticsEvent } from '@/utils/analytics/eventStorage'

export type AffiliateClickPosition = 'primary' | 'alternative'
export type AffiliateUseCaseAnchor = 'sleep' | 'anxiety' | 'focus'

type TrackAffiliateLinkClickParams = {
  herbSlug: string
  productId: string
  position: AffiliateClickPosition
  useCaseAnchor?: AffiliateUseCaseAnchor
  source: 'curated_product_module' | 'herb_product_section'
}

type TrackAffiliateConversionParams = {
  herbSlug: string
  productId: string
  useCaseAnchor?: AffiliateUseCaseAnchor
  valueUsd?: number
}

export function trackAffiliateLinkClick({
  herbSlug,
  productId,
  position,
  useCaseAnchor,
  source,
}: TrackAffiliateLinkClickParams) {
  if (typeof window === 'undefined') return null

  const event = appendAnalyticsEvent({
    type: 'affiliate_link_click',
    slug: herbSlug,
    item: productId,
    productId,
    herbSlug,
    productPosition: position,
    position: position === 'primary' ? 1 : 2,
    dwellTimeMs: null,
    useCaseAnchor,
    sourceType: source,
    targetType: 'product',
    pageType: 'herb_detail',
    entityType: 'herb',
    entitySlug: herbSlug,
    ctaType: 'affiliate',
  })

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[affiliate-click]', {
      herbSlug,
      productId,
      position,
      useCaseAnchor,
      source,
    })
  }

  return event
}

export function trackAffiliateConversion({
  herbSlug,
  productId,
  useCaseAnchor,
  valueUsd,
}: TrackAffiliateConversionParams) {
  if (typeof window === 'undefined') return null

  return appendAnalyticsEvent({
    type: 'affiliate_conversion',
    productId,
    herbSlug,
    useCaseAnchor,
    valueUsd,
  })
}

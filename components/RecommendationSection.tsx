import AffiliateDisclosure from './AffiliateDisclosure'
import AffiliateProductCard, { type AffiliateProduct } from './AffiliateProductCard'
import RevenueImpressionTracker from './RevenueImpressionTracker'
import WhyWeRecommend from '../src/components/monetization/WhyWeRecommend'
import HorizontalCardRail from './ui/HorizontalCardRail'

export type RecommendationSlot = 'budget' | 'overall' | 'premium'

export type RecommendationProduct = AffiliateProduct & {
  slot: RecommendationSlot
}

type RecommendationSectionProps = {
  title?: string
  description?: string
  products: RecommendationProduct[]
  preferredRegion?: string | null
  suppressMonetization?: boolean
  trackingProductSlug?: string
  trackingLocation?: string
}

const slotLabels: Record<RecommendationSlot, string> = {
  budget: 'Budget pick',
  overall: 'Best overall',
  premium: 'Premium pick',
}

export default function RecommendationSection({
  title = 'Product recommendations',
  description = 'Use these as sourcing starting points, not medical recommendations. Product quality, dose, and fit still need review.',
  products,
  preferredRegion = null,
  suppressMonetization = false,
  trackingProductSlug,
  trackingLocation = 'recommendation-section',
}: RecommendationSectionProps) {
  if (suppressMonetization) return null
  if (products.length === 0) return null

  const ordered = ['budget', 'overall', 'premium'].flatMap((slot) =>
    products.filter((product) => product.slot === slot)
  )

  return (
    <section className='card-premium p-4 sm:p-5'>
      <div className='max-w-3xl'>
        <p className='eyebrow-label'>Sourcing options</p>
        <h2 className='mt-1 text-lg font-semibold text-ink'>{title}</h2>
        <p className='mt-1 text-sm leading-6 text-muted'>{description}</p>
        <AffiliateDisclosure variant='compact' className='mt-2' />
      </div>

      <HorizontalCardRail label={`${title} options`}>
        {ordered.map((product) => {
          const productTitle = product.title || product.name || `${slotLabels[product.slot]} option`
          const productSlug = product.trackingProductSlug ?? trackingProductSlug
          const productLocation = product.trackingLocation ?? trackingLocation

          return (
            <RevenueImpressionTracker
              key={`${product.slot}-${productTitle}`}
              className='flex h-full flex-col gap-2'
              location={productLocation}
              label={productTitle}
              productSlug={productSlug}
              productSlot={product.trackingSlot ?? product.slot}
              productAsin={product.asin}
            >
              <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200'>{slotLabels[product.slot]}</p>
              <AffiliateProductCard
                product={{
                  ...product,
                  preferredRegion: product.preferredRegion ?? preferredRegion,
                  trackingLocation: productLocation,
                  trackingProductSlug: productSlug,
                  trackingSlot: product.trackingSlot ?? product.slot,
                }}
                compact
              />
            </RevenueImpressionTracker>
          )
        })}
      </HorizontalCardRail>

      <WhyWeRecommend className='mt-4' />
    </section>
  )
}

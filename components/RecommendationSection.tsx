import AffiliateDisclosure from './AffiliateDisclosure'
import AffiliateProductCard, { type AffiliateProduct } from './AffiliateProductCard'
import WhyWeRecommend from '../src/components/monetization/WhyWeRecommend'

export type RecommendationSlot = 'budget' | 'overall' | 'premium'

export type RecommendationProduct = AffiliateProduct & {
  slot: RecommendationSlot
}

type RecommendationSectionProps = {
  title?: string
  description?: string
  products: RecommendationProduct[]
  suppressMonetization?: boolean
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
  suppressMonetization = false,
}: RecommendationSectionProps) {
  if (suppressMonetization) return null
  if (products.length === 0) return null

  const ordered = ['budget', 'overall', 'premium'].flatMap((slot) =>
    products.filter((product) => product.slot === slot)
  )

  return (
    <section className='card-premium p-5 sm:p-8'>
      <div className='max-w-3xl'>
        <p className='eyebrow-label'>Affiliate-ready sourcing</p>
        <h2 className='mt-3 text-2xl font-semibold text-ink'>{title}</h2>
        <p className='mt-3 text-sm leading-7 text-muted'>{description}</p>
        <AffiliateDisclosure variant='compact' className='mt-3' />
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-3'>
        {ordered.map((product) => (
          <div key={`${product.slot}-${product.title || product.name}`} className='flex flex-col gap-2'>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200'>{slotLabels[product.slot]}</p>
            <AffiliateProductCard product={{ ...product, trackingLocation: 'recommendation-section' }} compact />
          </div>
        ))}
      </div>

      <WhyWeRecommend className='mt-6' />
    </section>
  )
}

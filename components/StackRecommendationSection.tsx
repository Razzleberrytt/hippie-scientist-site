import AffiliateDisclosure from './AffiliateDisclosure'
import AffiliateProductCard from './AffiliateProductCard'
import type { StackRecommendation } from '../src/lib/recommendation-engine'
import HorizontalCardRail from './ui/HorizontalCardRail'

interface StackRecommendationSectionProps {
  productName: string
  recommendations: StackRecommendation[]
}

export default function StackRecommendationSection({
  productName,
  recommendations,
}: StackRecommendationSectionProps) {
  if (!recommendations.length) return null

  return (
    <section className='rounded-[1.5rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-white/5'>
      <div className='max-w-3xl'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Supplement stacking</p>
        <h2 className='mt-1 text-lg font-semibold text-ink'>Stack {productName} With</h2>
        <p className='mt-1 text-sm leading-6 text-muted'>
          Commonly paired with {productName}. Review interactions and dosage before combining.
        </p>
        <AffiliateDisclosure variant='compact' className='mt-2' />
      </div>

      <HorizontalCardRail label={`Stack recommendations for ${productName}`}>
        {recommendations.map((rec) => (
          <div key={rec.targetSlug} className='flex h-full flex-col gap-2'>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200'>Pairs well</p>
            <AffiliateProductCard
              product={{
                ...rec.product,
                rationale: rec.reason,
                trackingLocation: rec.product.trackingLocation ?? 'stack-recommendation',
              }}
              compact
            />
          </div>
        ))}
      </HorizontalCardRail>
    </section>
  )
}

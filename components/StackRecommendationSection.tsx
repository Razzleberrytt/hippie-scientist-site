import AffiliateDisclosure from './AffiliateDisclosure'
import AffiliateProductCard from './AffiliateProductCard'
import type { StackRecommendation } from '@/lib/recommendation-engine'

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
    <section className='rounded-[1.5rem] border border-brand-900/10 bg-white/80 p-6 shadow-sm sm:p-8'>
      <div className='max-w-3xl'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Supplement stacking</p>
        <h2 className='mt-3 text-2xl font-semibold text-ink'>Stack {productName} With</h2>
        <p className='mt-3 text-sm leading-7 text-muted'>
          Products commonly paired with {productName} for synergistic effects. Review interactions and dosage before combining supplements.
        </p>
        <AffiliateDisclosure variant='compact' className='mt-3' />
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-3'>
        {recommendations.map((rec) => (
          <div key={rec.targetSlug} className='flex flex-col gap-2'>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700'>Pairs well</p>
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
      </div>
    </section>
  )
}

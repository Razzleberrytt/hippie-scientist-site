import type { Herb } from '@/types'
import { getHerbProducts } from '@/lib/herbProducts'

type RecommendedProductsProps = {
  herb: Herb
  compact?: boolean
  showTitle?: boolean
}

export default function RecommendedProducts({
  herb,
  compact = false,
  showTitle = true,
}: RecommendedProductsProps) {
  const recommendations = getHerbProducts(herb.slug).slice(0, 2)

  if (!recommendations.length) return null

  return (
    <section className='rounded-xl border border-white/10 bg-white/[0.03] p-3'>
      {showTitle && (
        <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
          Recommended Ways to Try This Herb
        </h3>
      )}
      <div className='mt-2 space-y-2'>
        {recommendations.map(item => (
          <article
            key={`${herb.slug || herb.common}-${item.productTitle}`}
            className='rounded-lg border border-white/15 bg-white/[0.02] p-3'
          >
            <p className='text-sm font-medium text-white'>{item.productTitle}</p>
            <p className='mt-1 text-xs capitalize text-white/70'>Form: {item.form}</p>
            {item.attributes.length > 0 && (
              <p className='mt-1 text-xs text-white/70'>{item.attributes.join(' • ')}</p>
            )}
            {item.notes && <p className='mt-1 text-xs text-white/65'>{item.notes}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

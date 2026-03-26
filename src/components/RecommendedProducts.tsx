import type { Herb } from '@/types'
import { getHerbProductRecommendations, getProductTypeExplanation } from '@/lib/herbProducts'

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
  const recommendations = getHerbProductRecommendations(herb)
  if (recommendations.length === 0) return null

  return (
    <section className='rounded-xl border border-white/10 bg-white/[0.03] p-3'>
      {showTitle && (
        <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
          Recommended Products
        </h3>
      )}
      <div className='mt-2 space-y-2'>
        {recommendations.map(item => (
          <article
            key={`${herb.slug || herb.common}-${item.type}`}
            className='rounded-lg border border-white/10 p-2.5'
          >
            <p className='text-sm font-medium text-white'>{item.label}</p>
            <p className='mt-1 text-xs capitalize text-white/70'>Type: {item.type}</p>
            <p className='mt-1 text-xs text-white/70'>{getProductTypeExplanation(item.type)}</p>
            {item.url ? (
              <a
                href={item.url}
                target='_blank'
                rel='noreferrer nofollow sponsored'
                className='mt-2 inline-flex text-xs text-violet-200 underline underline-offset-4 hover:text-violet-100'
              >
                View product ↗
              </a>
            ) : (
              <p className='mt-2 text-xs text-white/55'>Affiliate link placeholder</p>
            )}
          </article>
        ))}
      </div>
      <p className='mt-2 text-[11px] text-white/50'>We may earn a commission from links.</p>
    </section>
  )
}

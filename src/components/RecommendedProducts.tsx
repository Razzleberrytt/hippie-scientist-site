import type { Herb } from '@/types'
import { getHerbProductRecommendations, getProductFormExplanation } from '@/lib/herbProducts'

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
  const recommendations = getHerbProductRecommendations(herb).slice(0, 2)

  return (
    <section className='rounded-xl border border-white/10 bg-white/[0.03] p-3'>
      {showTitle && (
        <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
          Recommended Ways to Try This Herb
        </h3>
      )}
      {recommendations.length > 0 ? (
        <div className='mt-2 space-y-2'>
          <p className='text-xs leading-relaxed text-white/70'>
            Herbs come in different forms so you can match your routine and preferred preparation
            style. Choose the one that feels easiest for you to use consistently.
          </p>
          {recommendations.map(item => (
            <article
              key={`${herb.slug || herb.common}-${item.asin}`}
              className='rounded-lg border border-white/15 bg-white/[0.02] p-3'
            >
              <p className='text-sm font-medium text-white'>{item.label}</p>
              <p className='mt-1 text-xs capitalize text-white/70'>Form: {item.form}</p>
              <p className='mt-1 text-xs text-white/70'>
                {item.note || getProductFormExplanation(item.form)}
              </p>
              <p className='mt-1 text-xs font-medium text-emerald-100/90'>{item.bestFor}</p>
              <a
                href={item.url}
                target='_blank'
                rel='noreferrer nofollow sponsored'
                className='btn-secondary mt-2 inline-flex text-xs'
              >
                View Product
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className='mt-2 text-xs text-white/55'>
          Reviewed product recommendations will appear here as they are added.
        </p>
      )}
      <p className='mt-2 text-[11px] text-white/45'>
        As an Amazon Associate, we may earn from qualifying purchases.
      </p>
    </section>
  )
}

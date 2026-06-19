import AffiliateDisclosure from '../AffiliateDisclosure'
import type { RecommendationItem } from '@/content/recommendations'
import { EvidenceConfidenceBadge } from './EvidenceConfidenceBadge'
import { RecommendedSourcingPaths } from './RecommendedSourcingPaths'

type RecommendationCardProps = {
  item: RecommendationItem
  className?: string
  showDisclosure?: boolean
}

export function RecommendationCard({
  item,
  className = '',
  showDisclosure = false,
}: RecommendationCardProps) {
  return (
    <article className={`flex h-full flex-col rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm ${className}`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          {item.rankLabel ? (
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700'>{item.rankLabel}</p>
          ) : null}
          <h3 className='mt-2 text-xl font-semibold text-ink'>{item.name}</h3>
        </div>
        <EvidenceConfidenceBadge level={item.evidenceLevel} />
      </div>

      <dl className='mt-4 flex-1 space-y-3 text-sm leading-6'>
        <div>
          <dt className='font-semibold text-ink'>Best for</dt>
          <dd className='text-muted'>{item.bestFor}</dd>
        </div>
        <div>
          <dt className='font-semibold text-ink'>Avoid or ask first if</dt>
          <dd className='text-muted'>{item.avoidIf}</dd>
        </div>
        <div>
          <dt className='font-semibold text-ink'>Safety note</dt>
          <dd className='text-muted'>{item.safetyNote}</dd>
        </div>
        <div>
          <dt className='font-semibold text-ink'>Practical note</dt>
          <dd className='text-muted'>{item.practicalNote}</dd>
        </div>
      </dl>

      <RecommendedSourcingPaths paths={item.sourcingPaths} className='mt-5' />
      {showDisclosure ? <AffiliateDisclosure variant='compact' className='mt-4' /> : null}
    </article>
  )
}

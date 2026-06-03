import type { SourcingPath } from '@/content/recommendations'
import { AffiliateLink } from './AffiliateLink'

type RecommendedSourcingPathsProps = {
  paths: SourcingPath[]
  className?: string
}

export function RecommendedSourcingPaths({
  paths,
  className = '',
}: RecommendedSourcingPathsProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {paths.map((path) => (
        <div key={path.id} className='max-w-xs'>
          <AffiliateLink
            href={path.href}
            affiliate={path.affiliate}
            merchant={path.merchant}
            className='inline-flex min-h-10 items-center justify-center rounded-full border border-brand-900/15 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-brand-700 hover:bg-brand-50'
          >
            {path.label}
          </AffiliateLink>
          <p className='mt-2 text-xs leading-5 text-muted'>{path.description}</p>
        </div>
      ))}
    </div>
  )
}

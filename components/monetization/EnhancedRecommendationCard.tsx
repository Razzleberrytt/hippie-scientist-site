import Link from 'next/link'

export type EnhancedRecommendationCardProps = {
  rankLabel?: string
  productName: string
  category?: string
  whyRecommended: string
  bestUseCase: string
  safetyNote: string
  href?: string
  ctaLabel?: string
  ctaUrl?: string
  evidenceLevel?: 'A' | 'B' | 'C' | 'Limited'
  priceRange?: 'budget' | 'mid' | 'premium'
  className?: string
}

const priceEmoji: Record<string, string> = {
  budget: '$',
  mid: '$$',
  premium: '$$$',
}

const evidenceColor: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-amber-100 text-amber-800',
  Limited: 'bg-gray-100 text-gray-800',
}

export function EnhancedRecommendationCard({
  rankLabel,
  productName,
  category,
  whyRecommended,
  bestUseCase,
  safetyNote,
  href,
  ctaLabel = 'Compare products',
  ctaUrl,
  evidenceLevel,
  priceRange,
  className = '',
}: EnhancedRecommendationCardProps) {
  return (
    <article
      className={`rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm hover:shadow-md transition ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1">
          {rankLabel && <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{rankLabel}</p>}
          <h3 className="mt-1 text-2xl font-semibold text-ink">{productName}</h3>
          {category && <p className="mt-1 text-xs text-muted">{category}</p>}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {evidenceLevel && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${evidenceColor[evidenceLevel]}`}>
              Evidence: {evidenceLevel}
            </span>
          )}
          {priceRange && <span className="text-sm font-medium text-muted">{priceEmoji[priceRange]}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-ink">Why recommended</dt>
          <dd className="mt-1 leading-6 text-muted">{whyRecommended}</dd>
        </div>

        <div>
          <dt className="font-semibold text-ink">Best use case</dt>
          <dd className="mt-1 leading-6 text-muted">{bestUseCase}</dd>
        </div>

        <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-amber-900">Safety first</dt>
          <dd className="mt-1 text-xs leading-5 text-amber-900">{safetyNote}</dd>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-wrap gap-3">
        {ctaUrl && (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 transition"
          >
            {ctaLabel} →
          </a>
        )}
        {href && (
          <Link href={href} className="rounded-full border border-brand-700 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50 transition">
            Full profile
          </Link>
        )}
      </div>
    </article>
  )
}

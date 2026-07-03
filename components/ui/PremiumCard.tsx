import Link from 'next/link'
import EvidenceBadge from '@/components/ui/EvidenceBadge'
import { cleanSummary as sanitizeSummary, editorialUseCaseLabel, formatDisplayLabel, isClean } from '@/lib/display-utils'
import { getDecisionSafetyTone, normalizeDecisionSafety, safetyToneClasses } from '@/lib/decision-primitives'

export type PremiumCardProps = {
  href: string
  title: string
  summary?: string
  typeLabel?: string
  evidence?: string
  safety?: string
  bestFor?: string
  tags?: string[]
  ctaLabel?: string
}

export default function PremiumCard({
  href,
  title,
  summary,
  evidence,
  safety,
  bestFor,
  tags = [],
  ctaLabel = 'Open profile',
}: PremiumCardProps) {
  const safetyLabel = normalizeDecisionSafety(safety)
  const safetyTone = getDecisionSafetyTone(safetyLabel)
  const cleanSummary = sanitizeSummary(summary, 'compound')
  const cleanBestFor = isClean(bestFor) ? editorialUseCaseLabel(bestFor) : ''
  const visibleTags = tags.map(formatDisplayLabel).filter(isClean).slice(0, 3)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-white p-6 shadow-[var(--soft-lift-shadow)] transition duration-300 motion-safe:hover:-translate-y-1 hover:bg-brand-50/30 hover:shadow-[var(--deep-lift-shadow)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="eyebrow text-brand-700">
          Evidence-informed profile
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <EvidenceBadge tier={evidence} />

          <span
            title={formatDisplayLabel(safety) || 'Safety context should be reviewed before use.'}
            aria-label={`Safety indicator: ${safetyLabel}`}
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${safetyToneClasses(safetyTone)}`}
          >
            {safetyLabel}
          </span>
        </div>
      </div>

      <div className="mt-7 flex-1">
        <Link href={href} className="block rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-700/25">
          <h2 className="text-display text-[2rem] leading-[1.02] transition group-hover:text-brand-800 sm:text-4xl">
            {title}
          </h2>
        </Link>

        {cleanSummary ? (
          <p className="text-reading mt-4 line-clamp-4 text-base text-muted">
            {cleanSummary}
          </p>
        ) : null}

        {cleanBestFor ? (
          <div className="mt-5 rounded-2xl bg-brand-50 px-4 py-3">
            <p className="text-sm leading-6 text-muted">
              <span className="font-semibold text-ink">Commonly explored for:</span> {cleanBestFor}
            </p>
          </div>
        ) : null}

        {visibleTags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-brand-900/10 bg-paper-100 px-3 py-1 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <Link
        href={href}
        className="mt-7 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-1"
      >
        {ctaLabel} →
      </Link>
    </article>
  )
}

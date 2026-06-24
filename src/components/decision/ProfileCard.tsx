import Link from 'next/link'
import EvidenceBadge, { type EvidenceTier } from './EvidenceBadge'
import SafetyBadge, { type SafetyLevel } from './SafetyBadge'

export interface ProfileCardProps {
  type: 'herb' | 'compound' | 'stack'
  slug: string
  name: string
  /** One-line decision-oriented summary. Falls back to generic text if absent. */
  summary?: string
  evidenceTier?: EvidenceTier
  safetyLevel?: SafetyLevel
  /** Up to 3 signals/tags shown as compact chips */
  signals?: string[]
  /** Explicit href override — defaults to /{type}s/{slug} */
  href?: string
  /** Renders with a featured visual treatment */
  featured?: boolean
  /** Optional mechanism/effect slot used by compound cards */
  mechanismNote?: string
}

const TYPE_ICON: Record<ProfileCardProps['type'], string> = {
  herb: '🌿',
  compound: '⚗️',
  stack: '🧩',
}

const FALLBACK_SUMMARY: Record<ProfileCardProps['type'], string> = {
  herb: 'Traditionally used herb with growing research interest.',
  compound: 'Bioactive compound with documented mechanistic activity.',
  stack: 'Goal-based stack with ingredients and caution notes.',
}

function buildHref(type: ProfileCardProps['type'], slug: string): string {
  if (type === 'herb') return `/herbs/${slug}`
  if (type === 'compound') return `/compounds/${slug}`
  return `/stacks/${slug}`
}

export default function ProfileCard({
  type,
  slug,
  name,
  summary,
  evidenceTier,
  safetyLevel,
  signals = [],
  href,
  featured = false,
  mechanismNote,
}: ProfileCardProps) {
  const resolvedHref = href ?? buildHref(type, slug)
  const displaySummary =
    summary && summary.trim().length > 10
      ? summary.length > 130
        ? `${summary.slice(0, 129).trimEnd()}…`
        : summary
      : FALLBACK_SUMMARY[type]

  const visibleSignals = signals.slice(0, 3)

  return (
    <Link
      href={resolvedHref}
      className={[
        'group block rounded-[var(--radius-card-premium)]',
        'border border-brand-900/10 bg-white/85 backdrop-blur-xl',
        'p-5 transition-all duration-200',
        'hover:border-brand-900/15 motion-safe:hover:-translate-y-0.5',
        'focus-visible:outline-2 focus-visible:outline-offset-4',
        featured
          ? 'shadow-[var(--shadow-card-calm-hover)] ring-1 ring-brand-700/10'
          : 'shadow-[var(--shadow-card-calm)]',
      ].join(' ')}
      aria-label={`View profile: ${name}`}
    >
      {/* Badge row */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {evidenceTier && evidenceTier !== 'unknown' && (
          <EvidenceBadge tier={evidenceTier} />
        )}
        {safetyLevel && safetyLevel !== 'unknown' && (
          <SafetyBadge level={safetyLevel} />
        )}
        {featured && (
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-700/20 bg-brand-50 px-2.5 py-0.5 text-[0.7rem] font-semibold leading-none text-brand-700">
            Featured
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="mb-1.5 line-clamp-2 text-base font-semibold leading-snug tracking-tight text-ink group-hover:text-brand-700 transition-colors duration-200">
        <span className="mr-1.5" aria-hidden="true">{TYPE_ICON[type]}</span>
        {name}
      </h3>

      {/* Summary */}
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted">
        {displaySummary}
      </p>

      {/* Mechanism note (compound-specific) */}
      {mechanismNote && (
        <p className="mb-3 line-clamp-1 text-xs font-medium text-muted/80 italic">
          {mechanismNote}
        </p>
      )}

      {/* Signal chips */}
      {visibleSignals.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {visibleSignals.map((s) => (
            <span
              key={s}
              className="rounded-full border border-brand-900/10 bg-surface px-2.5 py-0.5 text-[0.68rem] font-medium leading-none text-muted"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="flex items-center justify-end pt-1">
        <span className="text-xs font-semibold text-brand-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View profile →
        </span>
      </div>
    </Link>
  )
}

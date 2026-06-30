import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean, isSafeInternalHref } from '@/lib/display-utils'
import {
  decisionChipClass,
  decisionMetadataClusterClass,
  decisionStatusBadgeClass,
} from '@/lib/decision-primitives'

type Props = {
  item: {
    slug: string
    name?: string
    archetype?: string
    relationship_reason?: string
    relationship_score?: number
    evidence_tier?: string
  }
}

function cleanLabel(value?: string) {
  return formatDisplayLabel(value)
}

export default function SemanticRecommendationCard({ item }: Props) {
  const confidence =
    (item.relationship_score || 0) >= 5
      ? 'High confidence'
      : (item.relationship_score || 0) >= 2
        ? 'Moderate confidence'
        : 'Exploratory'

  const name = cleanLabel(item.name || item.slug)
  const archetype = cleanLabel(item.archetype)
  const evidenceTier = cleanLabel(item.evidence_tier)
  const reason = cleanSummary(item.relationship_reason, 'compound')

  const href = `/compounds/${item.slug}`

  if (!isSafeInternalHref(href) || !name || !isClean(name)) return null

  return (
    <Link
      href={href}
      className="card-premium block p-5 transition-all duration-300 motion-safe:hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-ink transition group-hover:text-brand-700">
            {name}
          </div>

          <div className={`${decisionMetadataClusterClass} mt-2`}>
            {archetype ? (
              <span className={`${decisionStatusBadgeClass} border-emerald-800/15 bg-emerald-50/80 text-emerald-900`}>
                {archetype}
              </span>
            ) : null}

            {evidenceTier ? (
              <span className={decisionChipClass}>
                {evidenceTier}
              </span>
            ) : null}
          </div>
        </div>

        <div className={`${decisionStatusBadgeClass} shrink-0 border-brand-900/10 bg-white/80 text-muted`}>
          {confidence}
        </div>
      </div>

      <div className="mt-4 text-sm leading-7 text-muted">
        {reason}
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-brand-900/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500"
          style={{ width: `${Math.min(100, (item.relationship_score || 1) * 15)}%` }}
        />
      </div>
    </Link>
  )
}
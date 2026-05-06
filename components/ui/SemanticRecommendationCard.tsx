import Link from 'next/link'

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
  if (!value) return ''

  return value
    .replace(/_/g, ' ')
    .replace(/\bhealthy aging\b/gi, 'Healthy aging')
    .replace(/\bfat loss\b/gi, 'Fat loss')
    .replace(/\bstress mood\b/gi, 'Stress & mood')
    .replace(/\bsleep quality\b/gi, 'Sleep quality')
    .replace(/\bgeneral wellness\b/gi, 'General wellness')
}

export default function SemanticRecommendationCard({ item }: Props) {
  const confidence =
    (item.relationship_score || 0) >= 5
      ? 'High confidence'
      : (item.relationship_score || 0) >= 2
        ? 'Moderate confidence'
        : 'Exploratory'

  return (
    <Link
      href={`/compounds/${item.slug}`}
      className="card-premium block p-5 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-ink transition group-hover:text-brand-700">
            {item.name || item.slug}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {item.archetype && (
              <span className="evidence-pill-strong">
                {cleanLabel(item.archetype)}
              </span>
            )}

            {item.evidence_tier && (
              <span className="chip-readable">
                {cleanLabel(item.evidence_tier)}
              </span>
            )}
          </div>
        </div>

        <div className="chip-readable text-[10px] uppercase tracking-wide">
          {confidence}
        </div>
      </div>

      <div className="mt-4 text-sm leading-7 text-[#46574d]">
        {item.relationship_reason || 'Related through shared mechanisms, pathways, or overlapping wellness targets.'}
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

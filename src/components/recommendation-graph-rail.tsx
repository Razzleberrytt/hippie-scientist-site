import Link from 'next/link'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import { cleanSummary, formatDisplayLabel, isClean, list, unique } from '@/lib/display-utils'
import type { RecommendationGraphEdge } from '@/lib/recommendation-graph'

type RecommendationRailItem = {
  edge: RecommendationGraphEdge
  record: any
}

type RecommendationGraphRailProps = {
  title: string
  description?: string
  items: RecommendationRailItem[]
}

function getSignals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 4)
}

function href(record: any) {
  return `/${record?.entityType === 'compound' ? 'compounds' : 'herbs'}/${record.slug}`
}

function relationshipLabel(type: RecommendationGraphEdge['relationship']) {
  switch (type) {
    case 'mechanism':
      return 'Mechanism overlap'
    case 'pathway':
      return 'Pathway continuity'
    case 'effect':
      return 'Effect adjacency'
    case 'evidence':
      return 'Evidence-forward'
    default:
      return 'Semantic ecosystem'
  }
}

export default function RecommendationGraphRail({
  title,
  description,
  items,
}: RecommendationGraphRailProps) {
  if (!items?.length) return null

  return (
    <section className="compact-section section-rhythm-balanced">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Recommendation Graph</p>
          <span className="chip-readable">Semantic traversal</span>
        </div>

        <h2 className="compact-heading">{title}</h2>

        {description ? (
          <p className="compact-copy">{description}</p>
        ) : null}
      </div>

      <div className="semantic-rail">
        {items.map(({ edge, record }) => {
          const signals = getSignals(record)

          return (
            <Link
              key={`${edge.source}-${edge.target}`}
              href={href(record)}
              className="semantic-rail-card section-rhythm-compact"
            >
              <div className="flex flex-wrap gap-2">
                <span className="identity-kicker">
                  {relationshipLabel(edge.relationship)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="max-w-none text-base font-semibold leading-tight tracking-tight text-ink">
                  {formatDisplayLabel(record?.displayName || record?.name || record?.slug)}
                </h3>

                <p className="line-clamp-3 text-sm leading-6 text-[#46574d]">
                  {cleanSummary(record?.summary || record?.description || '', record?.entityType === 'compound' ? 'compound' : 'herb')}
                </p>
              </div>

              {edge.reasons.length > 0 ? (
                <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
                  {edge.reasons.map((reason) => (
                    <PathwayVisualChip key={reason} pathway={reason} />
                  ))}
                </div>
              ) : signals.length > 0 ? (
                <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-3">
                  {signals.map((signal) => (
                    <PathwayVisualChip key={signal} pathway={signal} />
                  ))}
                </div>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

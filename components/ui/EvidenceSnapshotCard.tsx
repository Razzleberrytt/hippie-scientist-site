import { formatDisplayLabel, isClean } from '@/lib/display-utils'

type Props = {
  snapshot: {
    archetype?: string
    clusters?: string[]
    citation_density?: number
    source_count?: number
    effect_count?: number
    freshness_score?: number
    human_evidence_ratio?: number
  }
}


function freshnessLabel(score?: number) {
  if (score === null || score === undefined) return null
  if (score < 0.45) return null
  if (score >= 0.85) return 'Very recent'
  if (score >= 0.65) return 'Recent'
  return 'Mixed recency'
}

export default function EvidenceSnapshotCard({ snapshot }: Props) {
  const items = [
    snapshot.citation_density && snapshot.citation_density > 0
      ? {
          label: 'Citation density',
          value: snapshot.citation_density.toFixed(1),
        }
      : null,

    snapshot.source_count && snapshot.source_count > 0
      ? {
          label: 'Sources',
          value: snapshot.source_count,
        }
      : null,

    snapshot.effect_count && snapshot.effect_count > 0
      ? {
          label: 'Effects',
          value: snapshot.effect_count,
        }
      : null,

    freshnessLabel(snapshot.freshness_score)
      ? {
          label: 'Research recency',
          value: freshnessLabel(snapshot.freshness_score),
        }
      : null,
  ].filter(Boolean) as { label: string; value: string | number }[]

  const clusters = (snapshot.clusters || [])
    .map(cluster => formatDisplayLabel(cluster))
    .filter(isClean)

  const archetype = formatDisplayLabel(snapshot.archetype || 'General wellness')

  if (!archetype && items.length === 0 && clusters.length === 0) {
    return null
  }

  return (
    <div className="surface-depth card-spacing section-spacing">
      <div className="flex flex-wrap items-center gap-2">
        {archetype ? (
          <span className="evidence-pill-strong">
            {archetype}
          </span>
        ) : null}

        {clusters.map((cluster) => (
          <span
            key={cluster}
            className="chip-readable"
          >
            {cluster}
          </span>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="surface-subtle rounded-2xl p-5"
            >
              <div className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#66756d]">
                {item.label}
              </div>

              <div className="mt-2 text-xl font-semibold tracking-tight text-ink">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

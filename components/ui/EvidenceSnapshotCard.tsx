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

export default function EvidenceSnapshotCard({ snapshot }: Props) {
  const items = [
    {
      label: 'Citation Density',
      value: snapshot.citation_density ?? 0,
    },
    {
      label: 'Sources',
      value: snapshot.source_count ?? 0,
    },
    {
      label: 'Effects',
      value: snapshot.effect_count ?? 0,
    },
    {
      label: 'Freshness',
      value: snapshot.freshness_score ?? 0,
    },
  ]

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-2xl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          {snapshot.archetype || 'General Wellness'}
        </span>

        {(snapshot.clusters || []).map((cluster) => (
          <span
            key={cluster}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300"
          >
            {cluster}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              {item.label}
            </div>

            <div className="mt-2 text-2xl font-semibold text-white">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

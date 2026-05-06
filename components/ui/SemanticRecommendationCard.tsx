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

export default function SemanticRecommendationCard({ item }: Props) {
  const confidence =
    (item.relationship_score || 0) >= 5
      ? 'High Confidence'
      : (item.relationship_score || 0) >= 2
        ? 'Moderate Confidence'
        : 'Exploratory'

  return (
    <Link
      href={`/compounds/${item.slug}`}
      className="group rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 transition hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-2xl block"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white group-hover:text-emerald-300 transition">
            {item.name || item.slug}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {item.archetype && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-wide text-emerald-300">
                {item.archetype}
              </span>
            )}

            {item.evidence_tier && (
              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[10px] uppercase tracking-wide text-sky-300">
                {item.evidence_tier}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-wide text-neutral-300">
          {confidence}
        </div>
      </div>

      <div className="mt-4 text-sm leading-6 text-neutral-400">
        {item.relationship_reason || 'Related through shared effects or mechanisms.'}
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
          style={{ width: `${Math.min(100, (item.relationship_score || 1) * 15)}%` }}
        />
      </div>
    </Link>
  )
}

type ScientificConsensusCardProps = {
  summary: string | null
  style?: string
}

export default function ScientificConsensusCard({ summary, style }: ScientificConsensusCardProps) {
  if (!summary) return null

  return (
    <div className="card-premium p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="eyebrow-label">Scientific consensus</p>
        {style ? (
          <span className="rounded-full border border-brand-900/10 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-800">
            {style}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">Conservative editorial read</h3>
      <p className="mt-4 text-sm leading-7 text-[#46574d]">{summary}</p>
    </div>
  )
}

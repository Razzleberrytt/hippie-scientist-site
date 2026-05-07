export default function ScientificConsensusCard({ summary }: { summary?: string | null }) {
  if (!summary) return null

  return (
    <div className="card-premium p-5 sm:p-6">
      <p className="eyebrow-label">Scientific consensus</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">Conservative editorial read</h3>
      <p className="mt-4 text-sm leading-7 text-[#46574d]">{summary}</p>
    </div>
  )
}

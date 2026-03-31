import type { ResearchEnrichment } from '@/types/researchEnrichment'
import { buildGovernedReviewFreshnessSignal } from '@/lib/governedReviewFreshness'

export default function GovernedReviewFreshnessCard({ enrichment }: { enrichment: ResearchEnrichment }) {
  const freshness = buildGovernedReviewFreshnessSignal(enrichment)

  return (
    <section id='governed-review-freshness' className='mt-6 rounded-2xl border border-white/15 bg-white/[0.03] p-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/80'>Review freshness</h2>
        <span className={`rounded-full border px-2.5 py-1 text-xs ${freshness.statusClassName}`}>
          {freshness.statusLabel}
        </span>
      </div>
      <p className='mt-2 text-sm text-white/75'>{freshness.statusTone}</p>
      <div className='mt-3 grid gap-2 text-xs text-white/75 sm:grid-cols-3'>
        {freshness.keySignals.map(signal => (
          <div key={signal} className='rounded-lg border border-white/12 bg-black/15 px-2.5 py-2'>
            {signal}
          </div>
        ))}
      </div>
      {freshness.whatChangedRecently && (
        <p className='mt-3 text-sm text-white/80'>
          <span className='font-semibold text-white'>What changed recently:</span>{' '}
          {freshness.whatChangedRecently}
        </p>
      )}
    </section>
  )
}

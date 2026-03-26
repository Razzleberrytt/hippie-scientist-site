import { Link } from 'react-router-dom'
import type { RelatedHerb } from '@/lib/compoundHerbRelations'

function ConfidenceBadge({ confidence }: { confidence?: string }) {
  if (!confidence) return null

  const tone =
    confidence === 'high'
      ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
      : confidence === 'medium'
        ? 'border-amber-300/40 bg-amber-500/10 text-amber-100'
        : 'border-white/20 bg-white/10 text-white/75'

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tone}`}
    >
      {confidence} confidence
    </span>
  )
}

export default function RelatedHerbCard({ herb }: { herb: RelatedHerb }) {
  return (
    <Link
      to={`/herbs/${encodeURIComponent(herb.slug)}`}
      className='group rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10'
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <h3 className='text-base font-semibold text-white group-hover:text-violet-100'>
          {herb.name}
        </h3>
        <ConfidenceBadge confidence={herb.confidence} />
      </div>
      <p className='mt-2 text-sm text-white/70'>{herb.descriptor}</p>
      <span className='mt-3 inline-flex text-xs font-medium text-violet-200'>View herb →</span>
    </Link>
  )
}

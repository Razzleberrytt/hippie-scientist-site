import { Link } from 'react-router-dom'
import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import type { CompoundCompleteness, HerbCompleteness } from '@/utils/getDataCompleteness'
import {
  formatReviewDate,
  getEvidenceTier,
  getEvidenceTierClass,
  getEvidenceTierLabel,
  getTrustNote,
} from '@/lib/trust'

type Entity = 'herb' | 'compound'

type DataTrustPanelProps = {
  entity: Entity
  confidence: ConfidenceLevel
  completeness: HerbCompleteness | CompoundCompleteness
  sourceCount: number
  lastReviewed: string
  cautionCount: number
  hasInferredContent?: boolean
  hasFallbackContent?: boolean
}

function confidenceBadgeClass(level: ConfidenceLevel) {
  if (level === 'high') {
    return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100'
  }
  if (level === 'medium') {
    return 'border-amber-300/45 bg-amber-500/15 text-amber-100'
  }
  return 'border-rose-300/50 bg-rose-500/15 text-rose-100'
}

export default function DataTrustPanel({
  entity,
  confidence,
  completeness,
  sourceCount,
  lastReviewed,
  cautionCount,
  hasInferredContent = false,
  hasFallbackContent = false,
}: DataTrustPanelProps) {
  const evidenceTier = getEvidenceTier({
    confidence,
    sourceCount,
    completenessScore: completeness.completenessScore,
  })
  const trustNote = getTrustNote({
    evidenceTier,
    sourceCount,
    hasInferredContent,
    hasFallbackContent,
  })

  return (
    <section className='mt-4 rounded-2xl border border-white/15 bg-white/5 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/75'>
          Evidence & trust
        </h2>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${confidenceBadgeClass(confidence)}`}
          >
            Confidence: {confidence}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getEvidenceTierClass(evidenceTier)}`}
          >
            {getEvidenceTierLabel(evidenceTier)}
          </span>
          {cautionCount > 0 && (
            <span className='rounded-full border border-rose-300/45 bg-rose-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100'>
              Caution signals: {cautionCount}
            </span>
          )}
        </div>
      </div>

      <dl className='mt-4 grid gap-2 text-sm text-white/85 sm:grid-cols-3'>
        <div className='rounded-xl border border-white/10 bg-black/20 px-3 py-2'>
          <dt className='text-xs uppercase tracking-wide text-white/50'>Sources</dt>
          <dd className='mt-1 font-semibold text-white'>{sourceCount}</dd>
        </div>
        <div className='rounded-xl border border-white/10 bg-black/20 px-3 py-2'>
          <dt className='text-xs uppercase tracking-wide text-white/50'>Last reviewed</dt>
          <dd className='mt-1 font-semibold text-white'>{formatReviewDate(lastReviewed)}</dd>
        </div>
        <div className='rounded-xl border border-white/10 bg-black/20 px-3 py-2'>
          <dt className='text-xs uppercase tracking-wide text-white/50'>Coverage</dt>
          <dd className='mt-1 font-semibold text-white'>{completeness.completenessScore}%</dd>
        </div>
      </dl>

      {(hasInferredContent || hasFallbackContent || evidenceTier === 'limited') && (
        <p className='mt-3 rounded-xl border border-amber-300/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100'>
          {trustNote}
        </p>
      )}

      <div className='mt-4'>
        <Link
          to={entity === 'herb' ? '/methodology#confidence-system' : '/methodology'}
          className='text-xs text-cyan-100 underline decoration-dotted underline-offset-4 transition hover:text-cyan-50'
        >
          How confidence and evidence tiers work
        </Link>
      </div>
    </section>
  )
}

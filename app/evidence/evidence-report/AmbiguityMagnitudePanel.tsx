import { analyzePublicEvidenceAmbiguity } from '@/lib/public-evidence-ambiguity-analysis'
import type { PublicStudyEntity } from '@/lib/public-evidence-dataset'

type Props = {
  studies: PublicStudyEntity[]
}

function formatRatio(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0×'
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}×`
}

const metricCardClass = 'rounded-xl border border-[var(--border-soft)] bg-[var(--surface-subtle)] p-4'

export default function AmbiguityMagnitudePanel({ studies }: Props) {
  const { summary } = analyzePublicEvidenceAmbiguity(studies)
  if (summary.studiesWithAnyAmbiguity === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" aria-labelledby="ambiguity-magnitude-title">
      <div className="card-premium p-6 sm:p-8">
        <p className="eyebrow-label">Metadata reconciliation</p>
        <h2 id="ambiguity-magnitude-title" className="mt-2 text-2xl font-semibold text-ink">How large are the unresolved metadata conflicts?</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
          These are raw conflict magnitudes, not subjective severity scores. Candidate values remain available in the downloadable dataset so discrepancies can be reconciled at the source level.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={metricCardClass}>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Ambiguous studies</p>
            <p className="mt-2 text-2xl font-bold text-ink">{summary.studiesWithAnyAmbiguity.toLocaleString()}</p>
            <p className="mt-1 text-xs leading-5 text-muted">Canonical publications with a year, participant-count, or concrete study-class conflict.</p>
          </div>
          <div className={metricCardClass}>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Cross-family class conflicts</p>
            <p className="mt-2 text-2xl font-bold text-ink">{summary.crossFamilyStudyClassConflictCount.toLocaleString()}</p>
            <p className="mt-1 text-xs leading-5 text-muted">Class disagreements that cross evidence families rather than staying within one design family.</p>
          </div>
          <div className={metricCardClass}>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Largest year span</p>
            <p className="mt-2 text-2xl font-bold text-ink">{summary.largestPublicationYearSpan.toLocaleString()} yr</p>
            <p className="mt-1 text-xs leading-5 text-muted">Maximum difference between observed publication-year candidates for one canonical study.</p>
          </div>
          <div className={metricCardClass}>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Largest participant mismatch</p>
            <p className="mt-2 text-2xl font-bold text-ink">{formatRatio(summary.largestParticipantCountRatio)}</p>
            <p className="mt-1 text-xs leading-5 text-muted">Largest ratio between conflicting structured participant-count candidates; maximum absolute spread is {summary.largestParticipantCountAbsoluteSpread.toLocaleString()}.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { CompareItem, EvidenceLevel } from '@/lib/compare'
import { evidenceDots, evidenceLabelText } from '@/lib/compare'

interface CompareEvidenceMatrixProps {
  item1: CompareItem
  item2: CompareItem
}

const EVIDENCE_TEXT_CLASS: Record<EvidenceLevel, string> = {
  strong: 'text-evidence-strong',
  moderate: 'text-evidence-moderate',
  preliminary: 'text-evidence-limited',
  anecdotal: 'text-evidence-theoretical',
  unknown: 'text-evidence-theoretical',
}

const BAR_WIDTH_CLASS: Record<number, string> = {
  0: 'w-0',
  1: 'w-1/5',
  2: 'w-2/5',
  3: 'w-3/5',
  4: 'w-4/5',
  5: 'w-full',
}

function EvidencePanel({ item }: { item: CompareItem }) {
  const { filled, empty } = evidenceDots(item.evidenceLevel)
  const labelText = evidenceLabelText(item.evidenceLevel)
  const textClass = EVIDENCE_TEXT_CLASS[item.evidenceLevel]
  const barWidth = BAR_WIDTH_CLASS[filled] ?? 'w-0'

  return (
    <div className="card-premium p-5 space-y-4 sm:p-6">
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-brand-700">
          {item.type === 'herb' ? 'Herb' : 'Compound'}
        </p>
        <h3 className="mt-0.5 text-lg font-semibold leading-snug text-ink sm:text-xl">
          {item.name}
        </h3>
      </div>

      <div
        aria-label={`Evidence: ${labelText} (${filled} of 5)`}
        className="flex items-center gap-1"
      >
        {Array.from({ length: filled }, (_, i) => (
          <span
            key={`filled-${i}`}
            className="text-evidence-strong text-lg leading-none"
            aria-hidden="true"
          >
            ●
          </span>
        ))}
        {Array.from({ length: empty }, (_, i) => (
          <span
            key={`empty-${i}`}
            className="text-brand-200 text-lg leading-none"
            aria-hidden="true"
          >
            ○
          </span>
        ))}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className={`h-full rounded-full bg-brand-500 transition-all duration-300 ${barWidth}`}
          role="presentation"
        />
      </div>

      <p className={`text-sm font-semibold ${textClass}`}>{labelText}</p>
      <p className="text-xs leading-5 text-muted">
        Overall profile signal only. Evidence strength can differ substantially by outcome, dose, formulation, and study design.
      </p>

      {item.evidenceGrade && (
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand-700">
            Grade
          </span>
          <span className="rounded-full border border-brand-900/10 bg-paper-100 px-2.5 py-0.5 text-xs font-semibold text-ink">
            {item.evidenceGrade}
          </span>
        </div>
      )}

      {item.evidenceTier && (
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand-700">
            Tier
          </span>
          <span className="rounded-full border border-brand-900/10 bg-paper-100 px-2.5 py-0.5 text-xs font-semibold text-ink">
            {item.evidenceTier}
          </span>
        </div>
      )}
    </div>
  )
}

export default function CompareEvidenceMatrix({ item1, item2 }: CompareEvidenceMatrixProps) {
  return (
    <section aria-labelledby="evidence-matrix-heading">
      <div className="mb-5 max-w-3xl">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-700">
          Evidence quality
        </p>
        <h2 id="evidence-matrix-heading" className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          Evidence Signals Side by Side
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Compare the profile-level evidence labels without treating them as a head-to-head efficacy ranking. The relevant evidence depends on the exact outcome you care about.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <EvidencePanel item={item1} />
        <EvidencePanel item={item2} />
      </div>
    </section>
  )
}

import type { CompareItem, EvidenceLevel } from '@/lib/compare'
import { evidenceDots, evidenceLabelText } from '@/lib/compare'

interface CompareEvidenceMatrixProps {
  item1: CompareItem
  item2: CompareItem
}

// Numeric rank for determining which item has stronger evidence.
const EVIDENCE_RANK: Record<EvidenceLevel, number> = {
  strong: 5,
  moderate: 4,
  preliminary: 2,
  anecdotal: 1,
  unknown: 0,
}

// Tailwind color classes per evidence level for the label text.
const EVIDENCE_TEXT_CLASS: Record<EvidenceLevel, string> = {
  strong: 'text-evidence-strong',
  moderate: 'text-evidence-moderate',
  preliminary: 'text-evidence-limited',
  anecdotal: 'text-evidence-theoretical',
  unknown: 'text-evidence-theoretical',
}

// Bar fill width per filled-dot count (max 5).
const BAR_WIDTH_CLASS: Record<number, string> = {
  0: 'w-0',
  1: 'w-1/5',
  2: 'w-2/5',
  3: 'w-3/5',
  4: 'w-4/5',
  5: 'w-full',
}

interface EvidencePanelProps {
  item: CompareItem
  isWinner: boolean
}

function EvidencePanel({ item, isWinner }: EvidencePanelProps) {
  const { filled, empty } = evidenceDots(item.evidenceLevel)
  const labelText = evidenceLabelText(item.evidenceLevel)
  const textClass = EVIDENCE_TEXT_CLASS[item.evidenceLevel]
  const barWidth = BAR_WIDTH_CLASS[filled] ?? 'w-0'

  return (
    <div
      className={`relative card-premium p-5 space-y-4 sm:p-6 ${
        isWinner ? 'ring-2 ring-brand-700/30' : ''
      }`}
    >
      {/* Winner badge */}
      {isWinner && (
        <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-brand-700 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-white">
          Stronger evidence
        </span>
      )}

      {/* Item identity */}
      <div className="pr-28">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-brand-700">
          {item.type === 'herb' ? 'Herb' : 'Compound'}
        </p>
        <h3 className="mt-0.5 text-lg font-semibold leading-snug text-ink sm:text-xl">
          {item.name}
        </h3>
      </div>

      {/* Dot indicator */}
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

      {/* Evidence bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className={`h-full rounded-full bg-brand-500 transition-all duration-300 ${barWidth}`}
          role="presentation"
        />
      </div>

      {/* Evidence label */}
      <p className={`text-sm font-semibold ${textClass}`}>{labelText}</p>

      {/* Evidence grade */}
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

      {/* Evidence tier */}
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
  const rank1 = EVIDENCE_RANK[item1.evidenceLevel]
  const rank2 = EVIDENCE_RANK[item2.evidenceLevel]
  const tied = rank1 === rank2
  const item1Wins = !tied && rank1 > rank2
  const item2Wins = !tied && rank2 > rank1

  return (
    <section aria-labelledby="evidence-matrix-heading">
      <div className="mb-5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-brand-700">
          Evidence quality
        </p>
        <h2 id="evidence-matrix-heading" className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          Evidence Comparison
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <EvidencePanel item={item1} isWinner={item1Wins} />
        <EvidencePanel item={item2} isWinner={item2Wins} />
      </div>

      {tied && (
        <p className="mt-4 text-center text-sm text-muted">
          Similar evidence base — both items share the same evidence tier.
        </p>
      )}
    </section>
  )
}

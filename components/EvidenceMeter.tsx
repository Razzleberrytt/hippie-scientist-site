import type { EvidenceStrengthData } from '@/lib/evidence-strength'
import EvidenceMeterDetail from './EvidenceMeterDetail'

type Props = {
  data: EvidenceStrengthData
  /** Optional context label shown next to the eyebrow (e.g. "for ADHD Focus") */
  context?: string
  /** Compact mode: hides description text and detail expansion */
  compact?: boolean
  /** Whether the detail panel starts open */
  defaultOpen?: boolean
}

export default function EvidenceMeter({
  data,
  context,
  compact = false,
  defaultOpen = false,
}: Props) {
  const ariaLabel = `Evidence strength: ${data.label}${context ? ` ${context}` : ''}. Score ${data.score} out of 100.`

  if (compact) {
    return (
      <div className="flex items-center gap-2" role="meter" aria-valuenow={data.score} aria-valuemin={0} aria-valuemax={100} aria-label={ariaLabel}>
        <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-200/80 flex-shrink-0">
          <div
            className={`h-full rounded-full ${data.barColorClass}`}
            style={{ width: `${data.score}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${data.textColorClass}`}>
          {data.label}
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-[1rem] border border-brand-900/10 bg-white/85 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.09em] text-[#68786f]">
            Evidence Strength{context ? ` — ${context}` : ''}
          </p>
          {!compact && (
            <p className="text-xs leading-5 text-[#5f6f66]">
              Confidence estimate based on available human and mechanistic research.
            </p>
          )}
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${data.bgColorClass} ${data.textColorClass} ${data.borderColorClass}`}
          aria-label={`Evidence grade: ${data.grade} — ${data.label}`}
        >
          {data.grade} · {data.label}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-200/80"
        role="meter"
        aria-valuenow={data.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${data.barColorClass}`}
          style={{ width: `${data.score}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#9ab3a0]">
        <span>Theoretical</span>
        <span>Limited</span>
        <span>Moderate</span>
        <span>Strong</span>
      </div>

      {/* Expandable detail — uses native <details> for zero-JS keyboard accessibility */}
      <details className="mt-3 group" open={defaultOpen || undefined}>
        <summary className="flex cursor-pointer items-center gap-1.5 rounded-md text-xs font-semibold text-brand-700 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:ring-offset-1 select-none list-none [&::-webkit-details-marker]:hidden">
          <span className="transition-transform duration-200 group-open:rotate-90" aria-hidden="true">
            ▶
          </span>
          <span className="group-open:hidden">See evidence details</span>
          <span className="hidden group-open:inline">Hide details</span>
        </summary>

        <EvidenceMeterDetail data={data} />
      </details>
    </div>
  )
}

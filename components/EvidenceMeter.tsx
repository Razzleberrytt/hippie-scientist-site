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
        <div className="h-2 w-24 flex-shrink-0 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10">
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
    <section className="border-y border-[color:var(--hs-hairline-strong)] py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="eyebrow-label">
            Evidence Strength{context ? ` — ${context}` : ''}
          </p>
          <p className="text-xs leading-5 text-[color:var(--hs-body)]">
            Confidence estimate based on available human and mechanistic research.
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${data.bgColorClass} ${data.textColorClass} ${data.borderColorClass}`}
          aria-label={`Evidence grade: ${data.grade} — ${data.label}`}
        >
          {data.grade} · {data.label}
        </span>
      </div>

      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10"
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

      <div className="mt-1 flex justify-between text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--hs-body)]">
        <span>Theoretical</span>
        <span>Limited</span>
        <span>Moderate</span>
        <span>Strong</span>
      </div>

      <details className="group mt-3 border-t border-[color:var(--hs-hairline)] !bg-transparent !p-0 !shadow-none" open={defaultOpen || undefined}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 py-2.5 text-xs font-semibold text-[color:var(--tone-ink)] hover:text-[color:var(--hs-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">See evidence details</span>
          <span className="hidden group-open:inline">Hide evidence details</span>
          <svg
            className="size-4 shrink-0 text-[color:var(--hs-body)] transition-transform group-open:rotate-180"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>

        <div className="border-t border-[color:var(--hs-hairline)] pt-3">
          <EvidenceMeterDetail data={data} />
        </div>
      </details>
    </section>
  )
}

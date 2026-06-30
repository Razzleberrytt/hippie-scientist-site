import type { EvidenceStrengthTier } from '@/lib/evidence-strength'

type TierRow = {
  tier: EvidenceStrengthTier
  grade: 'A' | 'B' | 'C' | 'D'
  label: string
  what: string
  human: string
  barClass: string
  badgeClass: string
  score: number
}

const TIERS: TierRow[] = [
  {
    tier: 'strong',
    grade: 'A',
    label: 'Strong Human Evidence',
    what: 'Multiple RCTs or a meta-analysis with consistent positive results across independent labs.',
    human: 'Yes — robust human clinical data',
    barClass: 'bg-[var(--color-evidence-strong)]',
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    score: 90,
  },
  {
    tier: 'moderate',
    grade: 'B',
    label: 'Moderate Evidence',
    what: 'Human trials showing generally positive outcomes, though study scale or consistency may vary.',
    human: 'Yes — at least some quality human trials',
    barClass: 'bg-blue-600',
    badgeClass: 'bg-blue-50 border-blue-200 text-blue-800',
    score: 70,
  },
  {
    tier: 'limited',
    grade: 'C',
    label: 'Limited Evidence',
    what: 'Small-scale human studies or preliminary trials exist, but better-controlled or larger trials are lacking.',
    human: 'Some — early or small human data',
    barClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-800',
    score: 45,
  },
  {
    tier: 'preliminary',
    grade: 'D',
    label: 'Preliminary / Mechanistic',
    what: 'Evidence comes mainly from animal studies, cell cultures, or proposed mechanisms — not validated in human trials.',
    human: 'No — animal or theoretical only',
    barClass: 'bg-amber-400',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-700',
    score: 28,
  },
  {
    tier: 'traditional',
    grade: 'D',
    label: 'Traditional Use Only',
    what: 'Long historical or ethnobotanical use; modern clinical validation is minimal or absent.',
    human: 'No — traditional use record only',
    barClass: 'bg-slate-400',
    badgeClass: 'bg-slate-50 border-slate-200 text-slate-700',
    score: 18,
  },
]

type Props = {
  /** Visually highlight one tier (matches current compound) */
  highlightTier?: EvidenceStrengthTier
  /** Extra Tailwind classes on the outer wrapper */
  className?: string
  /** Start expanded (default false) */
  defaultOpen?: boolean
}

export default function EvidenceLegend({
  highlightTier,
  className = '',
  defaultOpen = false,
}: Props) {
  return (
    <details
      className={`group rounded-[1rem] border border-brand-900/10 bg-white/90 shadow-sm ${className}`}
      open={defaultOpen || undefined}
    >
      <summary className="flex cursor-pointer select-none list-none items-center gap-2 px-5 py-3 text-xs font-semibold text-brand-700 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 [&::-webkit-details-marker]:hidden">
        <span
          className="transition-transform duration-200 group-open:rotate-90"
          aria-hidden="true"
        >
          ▶
        </span>
        <span className="group-open:hidden">What do these evidence levels mean?</span>
        <span className="hidden group-open:inline">Hide evidence level guide</span>
      </summary>

      <div className="border-t border-brand-900/10 px-5 pb-5 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
          Evidence Strength Scale — How We Rate Research
        </p>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          Each rating reflects the quality, quantity, and human relevance of available clinical
          research. Ratings are assigned to specific outcomes (e.g., &ldquo;sleep quality&rdquo;)
          — not compounds overall.
        </p>

        <div className="mt-4 space-y-3">
          {TIERS.map((row) => {
            const isHighlighted = row.tier === highlightTier
            return (
              <div
                key={row.tier}
                className={`rounded-[0.75rem] border p-3 transition-colors ${
                  isHighlighted
                    ? 'border-brand-700/30 bg-brand-50/80 ring-1 ring-brand-700/20'
                    : 'border-brand-900/10 bg-brand-50/20'
                }`}
                aria-current={isHighlighted ? 'true' : undefined}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${row.badgeClass}`}
                  >
                    {row.grade} · {row.label}
                  </span>
                  {isHighlighted && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                      ← current
                    </span>
                  )}
                </div>

                {/* Mini progress bar */}
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80"
                  role="meter"
                  aria-valuenow={row.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${row.label} confidence score: ${row.score} out of 100`}
                >
                  <div
                    className={`h-full rounded-full ${row.barClass}`}
                    style={{ width: `${row.score}%` }}
                  />
                </div>

                <div className="mt-2 grid gap-1 text-[11px] text-muted sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-ink">What it means: </span>
                    {row.what}
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Human trials: </span>
                    {row.human}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-[10px] leading-5 text-muted">
          Ratings reflect what the scientific literature currently supports — not marketing claims.
          Effect sizes, study quality, and population context all influence the final grade.
          &ldquo;Moderate&rdquo; evidence is meaningful; most supplements in widespread use sit at
          &ldquo;Limited&rdquo; or below.
        </p>
      </div>
    </details>
  )
}

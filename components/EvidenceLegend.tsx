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
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-300/10 dark:border-emerald-200/20 dark:text-emerald-100',
    score: 90,
  },
  {
    tier: 'moderate',
    grade: 'B',
    label: 'Moderate Evidence',
    what: 'Human trials showing generally positive outcomes, though study scale or consistency may vary.',
    human: 'Yes — at least some quality human trials',
    barClass: 'bg-blue-600',
    badgeClass: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-300/10 dark:border-blue-200/20 dark:text-blue-100',
    score: 70,
  },
  {
    tier: 'limited',
    grade: 'C',
    label: 'Limited Evidence',
    what: 'Small-scale human studies or preliminary trials exist, but better-controlled or larger trials are lacking.',
    human: 'Some — early or small human data',
    barClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-300/10 dark:border-amber-200/20 dark:text-amber-100',
    score: 45,
  },
  {
    tier: 'preliminary',
    grade: 'D',
    label: 'Preliminary / Mechanistic',
    what: 'Evidence comes mainly from animal studies, cell cultures, or proposed mechanisms — not validated in human trials.',
    human: 'No — animal or theoretical only',
    barClass: 'bg-amber-400',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-300/10 dark:border-amber-200/20 dark:text-amber-100',
    score: 28,
  },
  {
    tier: 'traditional',
    grade: 'D',
    label: 'Traditional Use Only',
    what: 'Long historical or ethnobotanical use; modern clinical validation is minimal or absent.',
    human: 'No — traditional use record only',
    barClass: 'bg-slate-400',
    badgeClass: 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-300/10 dark:border-slate-200/20 dark:text-slate-100',
    score: 18,
  },
]

type Props = {
  /** Visually highlight one tier (matches current compound). */
  highlightTier?: EvidenceStrengthTier
  /** Extra Tailwind classes on the outer wrapper. */
  className?: string
  /** Start expanded (default false). */
  defaultOpen?: boolean
}

export default function EvidenceLegend({
  highlightTier,
  className = '',
  defaultOpen = false,
}: Props) {
  return (
    <details
      className={`group border-y border-[color:var(--hs-hairline-strong)] !bg-transparent !shadow-none ${className}`}
      open={defaultOpen || undefined}
    >
      <summary className="flex min-h-12 cursor-pointer select-none list-none items-center gap-2 px-1 py-3 text-xs font-semibold text-[color:var(--tone-ink)] hover:text-[color:var(--hs-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] [&::-webkit-details-marker]:hidden">
        <span
          className="transition-transform duration-200 group-open:rotate-90"
          aria-hidden="true"
        >
          ▶
        </span>
        <span className="group-open:hidden">What do these evidence levels mean?</span>
        <span className="hidden group-open:inline">Hide evidence level guide</span>
      </summary>

      <div className="border-t border-[color:var(--hs-hairline)] px-1 pb-5 pt-4">
        <p className="eyebrow-label">Evidence Strength Scale</p>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-[color:var(--hs-body)]">
          Each rating reflects the quality, quantity, and human relevance of available clinical research. Ratings are assigned to specific outcomes (for example, sleep quality) — not compounds overall.
        </p>

        <div className="mt-4 divide-y divide-[color:var(--hs-hairline)]">
          {TIERS.map((row) => {
            const isHighlighted = row.tier === highlightTier
            return (
              <div
                key={row.tier}
                className={`relative py-4 pl-3 pr-1 transition-colors ${
                  isHighlighted
                    ? 'bg-[color:color-mix(in_srgb,var(--tone)_8%,transparent)] before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:bg-[color:var(--hs-gold)]'
                    : ''
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--hs-gold)]">
                      Current tier
                    </span>
                  )}
                </div>

                <div
                  className="mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10"
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

                <div className="mt-2 grid gap-1 text-[11px] text-[color:var(--hs-body)] sm:grid-cols-2 sm:gap-5">
                  <p>
                    <span className="font-semibold text-[color:var(--hs-ink)]">What it means: </span>
                    {row.what}
                  </p>
                  <p>
                    <span className="font-semibold text-[color:var(--hs-ink)]">Human trials: </span>
                    {row.human}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 max-w-3xl text-[10px] leading-5 text-[color:var(--hs-body)]">
          Ratings reflect what the scientific literature currently supports — not marketing claims. Effect sizes, study quality, and population context all influence the final grade. “Moderate” evidence is meaningful; most supplements in widespread use sit at “Limited” or below.
        </p>
      </div>
    </details>
  )
}

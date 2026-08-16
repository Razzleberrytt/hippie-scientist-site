const LEVEL_STYLES = {
  strong: {
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-300/10 dark:text-emerald-100 dark:border-emerald-200/20',
    bg: 'bg-emerald-50/60 dark:bg-emerald-300/10',
    border: 'border-emerald-200/50 dark:border-emerald-200/20',
    label: 'Strong Evidence',
  },
  moderate: {
    badge: 'bg-blue-100 text-blue-800 border border-blue-200/60 dark:bg-blue-300/10 dark:text-blue-100 dark:border-blue-200/20',
    bg: 'bg-blue-50/60 dark:bg-blue-300/10',
    border: 'border-blue-200/50 dark:border-blue-200/20',
    label: 'Moderate Evidence',
  },
  limited: {
    badge: 'bg-amber-100 text-amber-800 border border-amber-200/60 dark:bg-amber-300/10 dark:text-amber-100 dark:border-amber-200/20',
    bg: 'bg-amber-50/60 dark:bg-amber-300/10',
    border: 'border-amber-200/50 dark:border-amber-200/20',
    label: 'Limited Evidence',
  },
} as const

export type EvidenceLevel = keyof typeof LEVEL_STYLES

interface Props {
  level: EvidenceLevel
  takeaway: string
  outcome?: string
  citationCount?: number
}

export default function EvidenceSummaryBox({ level, takeaway, outcome, citationCount }: Props) {
  const style = LEVEL_STYLES[level]
  return (
    <div className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${style.badge}`}>
          {style.label}
        </span>
        {citationCount !== undefined && (
          <span className="text-xs text-muted">{citationCount} key studies</span>
        )}
      </div>
      {outcome && (
        <p className="text-sm font-medium text-ink mb-1">{outcome}</p>
      )}
      <p className="text-xs leading-5 text-muted">{takeaway}</p>
    </div>
  )
}

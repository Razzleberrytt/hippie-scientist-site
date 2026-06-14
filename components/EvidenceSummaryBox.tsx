const LEVEL_STYLES = {
  strong: {
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200/50',
    label: 'Strong Evidence',
  },
  moderate: {
    badge: 'bg-blue-100 text-blue-800 border border-blue-200/60',
    bg: 'bg-blue-50/60',
    border: 'border-blue-200/50',
    label: 'Moderate Evidence',
  },
  limited: {
    badge: 'bg-amber-100 text-amber-800 border border-amber-200/60',
    bg: 'bg-amber-50/60',
    border: 'border-amber-200/50',
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

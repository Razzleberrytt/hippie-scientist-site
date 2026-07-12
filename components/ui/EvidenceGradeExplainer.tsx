const GRADES = [
  {
    grade: 'A',
    label: 'Strong',
    meaning: 'Multiple RCTs, consistent direction, adequate effect size',
    bg: 'bg-[var(--color-evidence-strong)]/10',
    text: 'text-[var(--color-evidence-strong)]',
    border: 'border-[var(--color-evidence-strong)]/20',
  },
  {
    grade: 'B',
    label: 'Moderate',
    meaning: 'Some RCTs or consistent observational data in humans',
    bg: 'bg-[var(--color-evidence-moderate)]/10',
    text: 'text-[var(--color-evidence-moderate)]',
    border: 'border-[var(--color-evidence-moderate)]/20',
  },
  {
    grade: 'C',
    label: 'Preliminary / Mixed',
    meaning: 'Animal or in-vitro only, or conflicting human data',
    bg: 'bg-[var(--color-evidence-limited)]/10',
    text: 'text-[var(--color-evidence-limited)]',
    border: 'border-[var(--color-evidence-limited)]/20',
  },
  {
    grade: 'D',
    label: 'Traditional / Theoretical',
    meaning: 'Traditional use only; no controlled human trials',
    bg: 'bg-[var(--color-evidence-theoretical)]/10',
    text: 'text-[var(--color-evidence-theoretical)]',
    border: 'border-[var(--color-evidence-theoretical)]/20',
  },
]

export default function EvidenceGradeExplainer() {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted select-none hover:text-ink transition-colors">
        <span aria-hidden="true" className="text-brand-500 group-open:rotate-90 transition-transform inline-block">▶</span>
        How evidence grades work
      </summary>
      <div className="mt-3 rounded-xl border border-brand-900/10 bg-white/70 p-3 space-y-2">
        <p className="text-[11px] leading-5 text-muted">
          Each grade reflects the strength and consistency of published human evidence — not marketing claims.
          Grades are based on study count, design quality, effect size, consistency, and recency.
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {GRADES.map(({ grade, label, meaning, bg, text, border }) => (
            <div
              key={grade}
              className={`flex items-start gap-2 rounded-lg border p-2 ${bg} ${border}`}
            >
              <span
                className={`shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full border bg-white/60 ${text} ${border} text-xs font-bold dark:bg-black/10`}
              >
                {grade}
              </span>
              <div>
                <p className={`text-[11px] font-bold ${text}`}>{label}</p>
                <p className={`text-[11px] leading-4 ${text} opacity-75`}>{meaning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  )
}

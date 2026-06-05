const GRADES = [
  {
    grade: 'A',
    label: 'Strong',
    meaning: 'Multiple RCTs, consistent direction, adequate effect size',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-700/20',
    badgeBg: 'bg-emerald-100',
  },
  {
    grade: 'B',
    label: 'Moderate',
    meaning: 'Some RCTs or consistent observational data in humans',
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    border: 'border-yellow-600/20',
    badgeBg: 'bg-yellow-100',
  },
  {
    grade: 'C',
    label: 'Preliminary / Mixed',
    meaning: 'Animal or in-vitro only, or conflicting human data',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-700/20',
    badgeBg: 'bg-amber-100',
  },
  {
    grade: 'D',
    label: 'Traditional / Theoretical',
    meaning: 'Traditional use only; no controlled human trials',
    bg: 'bg-stone-50',
    text: 'text-stone-700',
    border: 'border-stone-400/30',
    badgeBg: 'bg-stone-200',
  },
]

export default function EvidenceGradeExplainer() {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted select-none hover:text-ink transition-colors">
        <span className="text-brand-500 group-open:rotate-90 transition-transform inline-block">▶</span>
        How evidence grades work
      </summary>
      <div className="mt-3 rounded-xl border border-brand-900/10 bg-white/70 p-3 space-y-2">
        <p className="text-[11px] leading-5 text-muted">
          Each grade reflects the strength and consistency of published human evidence — not marketing claims.
          Grades are based on study count, design quality, effect size, consistency, and recency.
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {GRADES.map(({ grade, label, meaning, bg, text, border, badgeBg }) => (
            <div
              key={grade}
              className={`flex items-start gap-2 rounded-lg border p-2 ${bg} ${border}`}
            >
              <span
                className={`shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full ${badgeBg} ${text} text-xs font-bold`}
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

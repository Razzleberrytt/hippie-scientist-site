const GRADES = [
  {
    grade: 'A',
    label: 'Strong',
    meaning: 'Multiple RCTs, consistent direction, adequate effect size',
    text: 'text-[var(--color-evidence-strong)]',
    border: 'border-[var(--color-evidence-strong)]/20',
  },
  {
    grade: 'B',
    label: 'Moderate',
    meaning: 'Some RCTs or consistent observational data in humans',
    text: 'text-[var(--color-evidence-moderate)]',
    border: 'border-[var(--color-evidence-moderate)]/20',
  },
  {
    grade: 'C',
    label: 'Preliminary / Mixed',
    meaning: 'Animal or in-vitro only, or conflicting human data',
    text: 'text-[var(--color-evidence-limited)]',
    border: 'border-[var(--color-evidence-limited)]/20',
  },
  {
    grade: 'D',
    label: 'Traditional / Theoretical',
    meaning: 'Traditional use only; no controlled human trials',
    text: 'text-[var(--color-evidence-theoretical)]',
    border: 'border-[var(--color-evidence-theoretical)]/20',
  },
]

export default function EvidenceGradeExplainer() {
  return (
    <details className="hs-disclosure">
      <summary>
        <span className="text-sm">How evidence grades work</span>
        <span aria-hidden="true" className="hs-disclosure__marker">▼</span>
      </summary>
      <div className="space-y-2">
        <p className="text-xs leading-5 text-muted">
          Each grade reflects the strength and consistency of published human evidence — not marketing claims.
          Grades are based on study count, design quality, effect size, consistency, and recency.
        </p>
        <dl className="hs-defs">
          {GRADES.map(({ grade, label, meaning, text, border }) => (
            <div key={grade}>
              <dt className="flex items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-[var(--surface-card-strong)] ${text} ${border} text-[0.65rem] font-bold`}
                  aria-hidden="true"
                >
                  {grade}
                </span>
                <span>{label}</span>
              </dt>
              <dd className="text-xs leading-5">{meaning}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  )
}

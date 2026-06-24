import * as React from 'react'

export interface EvidenceGradeRationaleProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | string
  designMatch: string
  riskOfBias: 'Low' | 'Medium' | 'High' | string
  consistency: 'Consistent' | 'Mixed' | 'Inconsistent' | string
  children: React.ReactNode
}

export default function EvidenceGradeRationale({
  grade,
  designMatch,
  riskOfBias,
  consistency,
  children,
}: EvidenceGradeRationaleProps) {
  const gradeConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    A: {
      bg: 'bg-emerald-50 dark:bg-emerald-300/10',
      text: 'text-emerald-800 dark:text-emerald-100',
      border: 'border-emerald-200 dark:border-emerald-200/20',
      label: 'Grade A: Strong Evidence',
    },
    B: {
      bg: 'bg-blue-50 dark:bg-blue-300/10',
      text: 'text-blue-800 dark:text-blue-100',
      border: 'border-blue-200 dark:border-blue-200/20',
      label: 'Grade B: Moderate Evidence',
    },
    C: {
      bg: 'bg-amber-50 dark:bg-amber-300/10',
      text: 'text-amber-800 dark:text-amber-100',
      border: 'border-amber-200 dark:border-amber-200/20',
      label: 'Grade C: Limited Evidence',
    },
    D: {
      bg: 'bg-slate-50 dark:bg-slate-300/10',
      text: 'text-slate-700 dark:text-slate-100',
      border: 'border-slate-200 dark:border-slate-200/20',
      label: 'Grade D: Theoretical Evidence',
    },
    F: {
      bg: 'bg-rose-50 dark:bg-rose-300/10',
      text: 'text-rose-800 dark:text-rose-100',
      border: 'border-rose-200 dark:border-rose-200/20',
      label: 'Grade F: Insufficient or Contraindicated',
    },
  }

  const config = gradeConfig[grade] || {
    bg: 'bg-slate-50 dark:bg-slate-300/10',
    text: 'text-slate-700 dark:text-slate-100',
    border: 'border-slate-200 dark:border-slate-200/20',
    label: `Grade ${grade}`,
  }

  const biasColors: Record<string, string> = {
    Low: 'text-emerald-700 font-semibold dark:text-emerald-100',
    Medium: 'text-amber-700 font-semibold dark:text-amber-100',
    High: 'text-rose-700 font-semibold dark:text-rose-100',
  }
  const biasColor = biasColors[riskOfBias] || 'font-semibold text-muted'

  const consistencyColors: Record<string, string> = {
    Consistent: 'text-emerald-700 font-semibold dark:text-emerald-100',
    Mixed: 'text-amber-700 font-semibold dark:text-amber-100',
    Inconsistent: 'text-rose-700 font-semibold dark:text-rose-100',
  }
  const consistencyColor = consistencyColors[consistency] || 'font-semibold text-muted'
  const headingId = `evidence-grade-${String(grade).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <section
      className="my-6 rounded-[1.25rem] border border-brand-900/10 bg-white/85 p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5"
      aria-labelledby={headingId}
    >
      <div className="grid items-start gap-5 md:grid-cols-[120px_1fr] md:gap-6">
        <div className="flex flex-row items-center gap-3 text-left md:flex-col md:justify-center md:text-center">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 font-display text-2xl font-bold shadow-inner md:h-20 md:w-20 md:text-3xl ${config.bg} ${config.text} ${config.border}`}
            aria-hidden="true"
          >
            {grade}
          </div>
          <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-muted md:mt-2">
            Evidence Grade
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 id={headingId} className="font-display text-lg font-semibold leading-7 text-ink">
              {config.label}
            </h3>
            <p className="mt-0.5 text-xs leading-5 text-muted">
              Evaluation of methodological rigor, population reach, and evidence alignment.
            </p>
          </div>

          <dl className="grid gap-3 rounded-xl border border-brand-900/10 bg-brand-50/30 p-3.5 text-xs sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
            <div>
              <dt className="mb-0.5 block font-medium text-muted">Design Match</dt>
              <dd className="font-semibold text-ink">{designMatch}</dd>
            </div>
            <div>
              <dt className="mb-0.5 block font-medium text-muted">Risk of Bias</dt>
              <dd className={biasColor}>{riskOfBias}</dd>
            </div>
            <div>
              <dt className="mb-0.5 block font-medium text-muted">Consistency</dt>
              <dd className={consistencyColor}>{consistency}</dd>
            </div>
          </dl>

          <div className="rounded-lg bg-white/65 p-3 text-sm leading-6 text-muted dark:bg-white/5">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

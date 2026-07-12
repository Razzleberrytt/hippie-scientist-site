import type { ReactNode } from 'react'

const GRADE_STYLE: Record<string, string> = {
  strong:
    'border-emerald-500/40 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/40 dark:text-emerald-100',
  'moderate-high':
    'border-emerald-500/40 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/40 dark:text-emerald-100',
  moderate:
    'border-amber-500/40 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-900/40 dark:text-amber-100',
  limited:
    'border-slate-400/40 bg-slate-100 text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-[var(--text-secondary)]',
  preliminary:
    'border-slate-400/40 bg-slate-100 text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-[var(--text-secondary)]',
}

/**
 * EvidenceConfidence — explains an evidence grade in plain English instead of
 * leaving "Moderate" unexplained. States why it isn't higher, why it isn't
 * lower, and the practical takeaway. Builds trust and calibrates expectations.
 *
 * MDX usage:
 *   <EvidenceConfidence
 *     grade="Moderate"
 *     whyNotHigher={['Most trials are small', 'Long-term data is limited', 'Outcomes vary by dose']}
 *     whyNotLower={['Multiple human trials exist', 'Effects are biologically plausible', 'Short-term safety is favorable']}
 *     practicalTakeaway="Reasonable to try for mild situational use, not a replacement for medical care."
 *   />
 */
export function EvidenceConfidence({
  title = 'How strong is the evidence?',
  grade,
  whyNotHigher,
  whyNotLower,
  practicalTakeaway,
}: {
  title?: string
  grade: string
  whyNotHigher: string[]
  whyNotLower?: string[]
  practicalTakeaway: ReactNode
}) {
  const gradeStyle = GRADE_STYLE[String(grade).toLowerCase()] ?? GRADE_STYLE.moderate
  return (
    <section className="not-prose my-4 rounded-2xl border border-brand-900/12 bg-white p-4 shadow-[0_1px_2px_rgba(13,23,18,0.05)] dark:border-white/10 dark:bg-[var(--surface-card)]">
      <details className="group">
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/40 focus-visible:rounded">
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-base font-bold tracking-tight text-ink">{title}</span>
            <span className={`rounded-full border px-3 py-0.5 text-sm font-bold ${gradeStyle}`}>{grade}</span>
          </span>
          <span aria-hidden="true" className="shrink-0 text-brand-500 transition-transform group-open:rotate-180">v</span>
        </summary>
      <div className="mt-4 grid gap-4 border-t border-brand-900/10 pt-4 sm:grid-cols-2 dark:border-white/10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Why not higher</p>
          <ul className="mt-2 space-y-1.5">
            {whyNotHigher.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-muted">
                <span aria-hidden="true" className="mt-0.5">
                  –
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {whyNotLower && whyNotLower.length > 0 ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Why not lower
            </p>
            <ul className="mt-2 space-y-1.5">
              {whyNotLower.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-ink">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <p className="mt-4 border-t border-brand-900/10 pt-3 text-sm leading-7 text-ink dark:border-white/10">
        <span className="font-bold">Practical takeaway: </span>
        {practicalTakeaway}
      </p>
      </details>
    </section>
  )
}

export default EvidenceConfidence

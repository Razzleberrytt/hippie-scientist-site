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
    <section className="not-prose my-4">
      <details className="group border-y border-[color:var(--hs-hairline-strong)] !bg-transparent !p-0 !shadow-none">
        <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center justify-between gap-3 py-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] [&::-webkit-details-marker]:hidden">
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--tone-ink)]">{title}</span>
            <span className={`rounded-full border px-3 py-0.5 text-sm font-bold ${gradeStyle}`}>{grade}</span>
          </span>
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

        <div className="grid gap-0 border-t border-[color:var(--hs-hairline)] sm:grid-cols-2">
          <div className="py-4 sm:pr-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--hs-body)]">Why not higher</p>
            <ul className="mt-2 space-y-1.5">
              {whyNotHigher.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-[color:var(--hs-body)]">
                  <span aria-hidden="true" className="mt-0.5 text-[color:var(--hs-gold)]">–</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {whyNotLower && whyNotLower.length > 0 ? (
            <div className="border-t border-[color:var(--hs-hairline)] py-4 sm:border-l sm:border-t-0 sm:pl-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Why not lower
              </p>
              <ul className="mt-2 space-y-1.5">
                {whyNotLower.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-[color:var(--hs-ink)]">
                    <span aria-hidden="true" className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <p className="border-t border-[color:var(--hs-hairline)] py-4 text-sm leading-7 text-[color:var(--hs-ink)]">
          <span className="font-bold">Practical takeaway: </span>
          {practicalTakeaway}
        </p>
      </details>
    </section>
  )
}

export default EvidenceConfidence

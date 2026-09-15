import Link from 'next/link'
import type { ReactNode } from 'react'

type Recommendation = 'Yes' | 'Maybe' | 'No' | 'Situation-dependent'

type BetterAlternative = {
  label: string
  href: string
  reason?: string
}

type ScientificVerdictCardProps = {
  id?: string
  /** Heading label. Defaults to "Scientific Verdict". */
  title?: string
  /** Overall call: Yes | Maybe | No | Situation-dependent. */
  recommendation: Recommendation | string
  /** Evidence confidence label, e.g. "Moderate". */
  confidence?: string
  /** Who it's for. Array, or a pipe-delimited string for MDX: "A|B|C". */
  bestFor?: string | string[]
  /** Who should skip it. Array or pipe-delimited string. */
  notIdealFor?: string | string[]
  /** Alias for notIdealFor (Pass-1 compatibility). */
  notFor?: string | string[]
  /** Expected onset, e.g. "30–40 minutes". */
  onset?: string
  /** How long to trial it before judging, e.g. "Same day to 2 weeks". */
  evaluationWindow?: string
  /** Bottom-line sentence. Prefer children in MDX; this prop is the .tsx path. */
  bottomLine?: ReactNode
  /** A better first choice for a different problem. */
  betterAlternative?: BetterAlternative
  /** Short safety caveat surfaced inside the verdict. */
  safetyNote?: ReactNode
  /** Short note on the evidence base. */
  evidenceNote?: ReactNode
  /** Overrides the recommendation pill text (keeps the recommendation color). */
  badgeLabel?: string
  /** Reserved for future visual variants; currently only "default". */
  variant?: 'default'
  className?: string
  children?: ReactNode
}

const toList = (value?: string | string[]): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  return String(value).split('|').map((v) => v.trim()).filter(Boolean)
}

const RECOMMENDATION_STYLES: Record<string, string> = {
  yes: 'border-emerald-500/40 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/40 dark:text-emerald-100',
  maybe: 'border-amber-500/40 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-900/40 dark:text-amber-100',
  no: 'border-rose-500/40 bg-rose-100 text-rose-900 dark:border-rose-400/30 dark:bg-rose-900/40 dark:text-rose-100',
  'situation-dependent': 'border-sky-500/40 bg-sky-100 text-sky-900 dark:border-sky-400/30 dark:bg-sky-900/40 dark:text-sky-100',
}

/** Shared scientific decision surface for articles and profiles. */
export function ScientificVerdictCard({
  id,
  title = 'Scientific Verdict',
  recommendation,
  confidence,
  bestFor,
  notIdealFor,
  notFor,
  onset,
  evaluationWindow,
  bottomLine,
  betterAlternative,
  safetyNote,
  evidenceNote,
  badgeLabel,
  className = '',
  children,
}: ScientificVerdictCardProps) {
  const best = toList(bestFor)
  const not = toList(notIdealFor ?? notFor)
  const badgeStyle = RECOMMENDATION_STYLES[String(recommendation).toLowerCase()] ?? RECOMMENDATION_STYLES.maybe
  const stats = [
    confidence ? { label: 'Evidence confidence', value: confidence, evidence: true } : null,
    onset ? { label: 'Expected onset', value: onset, evidence: false } : null,
    evaluationWindow ? { label: 'Give it', value: evaluationWindow, evidence: false } : null,
  ].filter((s): s is { label: string; value: string; evidence: boolean } => Boolean(s))

  return (
    <section
      id={id}
      data-answer-engine-decision="true"
      data-recommendation={String(recommendation)}
      aria-label="Scientific verdict"
      className={`not-prose my-6 scroll-mt-24 overflow-hidden rounded-2xl border-2 border-brand-900/15 bg-white shadow-md ring-1 ring-brand-900/5 dark:border-white/12 dark:bg-[var(--surface-card)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-900/10 bg-brand-50/60 px-4 py-2.5 sm:gap-3 sm:px-5 sm:py-3 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
        <span className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-brand-700 sm:text-xs sm:tracking-[0.16em]">{title}</span>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold sm:px-3 sm:text-sm ${badgeStyle}`}>{badgeLabel ?? recommendation}</span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        {(bottomLine || children) && (
          <div
            data-claim="true"
            data-mobile-answer-first="true"
            className="rounded-xl border border-brand-900/10 bg-brand-50/45 p-3.5 dark:border-white/10 dark:bg-[var(--surface-subtle)]"
          >
            <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.14em] text-brand-700 dark:text-[var(--accent-teal)]">
              Bottom line
            </p>
            <div className="mt-1.5 text-[0.95rem] font-medium leading-6 text-ink sm:text-base sm:leading-7">
              {bottomLine ?? children}
            </div>
          </div>
        )}

        {stats.length > 0 && (
          <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                data-evidence={stat.evidence ? 'true' : undefined}
                className={`rounded-xl border border-brand-900/8 bg-[var(--surface-card)] p-2.5 dark:border-white/10 ${stat.evidence ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <dt className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted sm:text-[0.7rem] sm:tracking-wider">{stat.label}</dt>
                <dd className="mt-1 text-sm font-semibold leading-5 text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {safetyNote ? (
          <p data-safety-context="true" className="mt-3 rounded-xl border border-amber-500/30 bg-amber-50/70 px-3 py-2.5 text-sm leading-6 text-amber-900 dark:border-amber-400/25 dark:bg-amber-900/25 dark:text-amber-100">
            <span className="font-bold">Safety: </span>{safetyNote}
          </p>
        ) : null}

        {evidenceNote ? (
          <p data-evidence="true" className="mt-3 text-sm leading-6 text-muted">
            <span className="font-semibold text-ink">On the evidence: </span>{evidenceNote}
          </p>
        ) : null}

        {(best.length > 0 || not.length > 0) && (
          <div className="mt-4 grid gap-4 border-t border-brand-900/10 pt-4 sm:grid-cols-2 dark:border-white/10">
            {best.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Best for</p>
                <ul className="mt-2 space-y-1.5">
                  {best.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-ink">
                      <span aria-hidden="true" className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {not.length > 0 && (
              <div data-limitation="true">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">Not ideal for</p>
                <ul className="mt-2 space-y-1.5">
                  {not.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-muted">
                      <span aria-hidden="true" className="mt-0.5 font-bold text-rose-500 dark:text-rose-400">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {betterAlternative ? (
          <p className="mt-4 border-t border-brand-900/10 pt-4 text-sm leading-6 dark:border-white/10">
            <span className="font-bold text-ink">Consider instead: </span>
            <Link href={betterAlternative.href} className="font-semibold text-brand-800 hover:underline dark:text-[var(--text-primary)]">{betterAlternative.label}</Link>
            {betterAlternative.reason ? <span className="text-muted"> — {betterAlternative.reason}</span> : null}
          </p>
        ) : null}
      </div>
      {id ? <a href={`#${id}`} className="sr-only">Permanent link to this scientific verdict</a> : null}
    </section>
  )
}

export const ScientificVerdict = ScientificVerdictCard
export default ScientificVerdictCard

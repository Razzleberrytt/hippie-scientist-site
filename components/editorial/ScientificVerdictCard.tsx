import Link from 'next/link'
import type { ReactNode } from 'react'

type Recommendation = 'Yes' | 'Maybe' | 'No' | 'Situation-dependent'

type BetterAlternative = {
  label: string
  href: string
  reason?: string
}

type ScientificVerdictCardProps = {
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
  children?: ReactNode
}

const toList = (value?: string | string[]): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  return String(value)
    .split('|')
    .map((v) => v.trim())
    .filter(Boolean)
}

const RECOMMENDATION_STYLES: Record<string, string> = {
  yes: 'border-emerald-500/40 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-900/40 dark:text-emerald-100',
  maybe: 'border-amber-500/40 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-900/40 dark:text-amber-100',
  no: 'border-rose-500/40 bg-rose-100 text-rose-900 dark:border-rose-400/30 dark:bg-rose-900/40 dark:text-rose-100',
  'situation-dependent':
    'border-sky-500/40 bg-sky-100 text-sky-900 dark:border-sky-400/30 dark:bg-sky-900/40 dark:text-sky-100',
}

/**
 * ScientificVerdictCard — the signature decision module for The Hippie Scientist.
 *
 * Every major article/herb/compound/comparison page should OPEN with one of
 * these. It answers, before any biochemistry: would we recommend this, for
 * whom, for what use, how confident, how fast, and when to choose something
 * else. Registered as an MDX component (also under the alias `ScientificVerdict`
 * for Pass-1 compatibility) so any article can drop it at the top of the body.
 *
 *   <ScientificVerdictCard
 *     recommendation="Yes"
 *     bestFor="Racing thoughts|Caffeine jitters|Mild situational anxiety"
 *     notIdealFor="Severe insomnia|Panic attacks|Chronic stress alone"
 *     confidence="Moderate" onset="30–40 minutes" evaluationWindow="Same day to 2 weeks"
 *     betterAlternative={{ label: 'Ashwagandha', href: '/articles/ashwagandha/',
 *       reason: 'for chronic baseline stress' }}
 *   >
 *   L-theanine is a strong first choice for calm focus, not for chronic stress.
 *   </ScientificVerdictCard>
 *
 * Lists accept a pipe-delimited string (MDX-friendly) or a real array (.tsx).
 * Keep it honest: use "No" / "Situation-dependent" and a real "Not ideal for"
 * list when the evidence warrants.
 */
export function ScientificVerdictCard({
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
  children,
}: ScientificVerdictCardProps) {
  const best = toList(bestFor)
  const not = toList(notIdealFor ?? notFor)
  const badgeStyle =
    RECOMMENDATION_STYLES[String(recommendation).toLowerCase()] ?? RECOMMENDATION_STYLES.maybe
  const stats = [
    confidence ? { label: 'Evidence confidence', value: confidence } : null,
    onset ? { label: 'Expected onset', value: onset } : null,
    evaluationWindow ? { label: 'Give it', value: evaluationWindow } : null,
  ].filter((s): s is { label: string; value: string } => Boolean(s))

  return (
    // Root is a <section> (not <aside>) on purpose: the article body is
    // post-processed by ContentCards, which wraps any pre-section "intro"
    // content in its own card. Being a section makes ContentCards treat this
    // as the first section and leave it standalone instead of double-wrapping.
    <section
      aria-label="Scientific verdict"
      className="not-prose my-6 overflow-hidden rounded-2xl border-2 border-brand-900/15 bg-white shadow-md ring-1 ring-brand-900/5 dark:border-white/12 dark:bg-[var(--surface-card)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-900/10 bg-brand-50/60 px-5 py-3 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">{title}</span>
        <span className={`rounded-full border px-3 py-1 text-sm font-bold ${badgeStyle}`}>
          {badgeLabel ?? recommendation}
        </span>
      </div>

      <div className="px-5 py-4">
        {(best.length > 0 || not.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {best.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Best for
                </p>
                <ul className="mt-2 space-y-1.5">
                  {best.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-ink">
                      <span aria-hidden="true" className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {not.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  Not ideal for
                </p>
                <ul className="mt-2 space-y-1.5">
                  {not.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-muted">
                      <span aria-hidden="true" className="mt-0.5 font-bold text-rose-500 dark:text-rose-400">
                        ✕
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {stats.length > 0 && (
          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-brand-900/10 pt-4 dark:border-white/10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[0.7rem] font-bold uppercase tracking-wider text-muted">{stat.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {(bottomLine || children) && (
          <div className="mt-4 border-t border-brand-900/10 pt-4 text-sm leading-7 text-ink dark:border-white/10">
            <span className="font-bold">Bottom line: </span>
            {bottomLine ?? children}
          </div>
        )}

        {safetyNote ? (
          <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-50/70 px-3 py-2 text-sm leading-6 text-amber-900 dark:border-amber-400/25 dark:bg-amber-900/25 dark:text-amber-100">
            <span className="font-bold">Safety: </span>
            {safetyNote}
          </p>
        ) : null}

        {evidenceNote ? (
          <p className="mt-3 text-sm leading-6 text-muted">
            <span className="font-semibold text-ink">On the evidence: </span>
            {evidenceNote}
          </p>
        ) : null}

        {betterAlternative ? (
          <p className="mt-4 border-t border-brand-900/10 pt-4 text-sm leading-6 dark:border-white/10">
            <span className="font-bold text-ink">Consider instead: </span>
            <Link href={betterAlternative.href} className="font-semibold text-brand-800 hover:underline dark:text-[var(--text-primary)]">
              {betterAlternative.label}
            </Link>
            {betterAlternative.reason ? <span className="text-muted"> — {betterAlternative.reason}</span> : null}
          </p>
        ) : null}
      </div>
    </section>
  )
}

/** Pass-1 compatibility alias. Prefer `ScientificVerdictCard` going forward. */
export const ScientificVerdict = ScientificVerdictCard

export default ScientificVerdictCard

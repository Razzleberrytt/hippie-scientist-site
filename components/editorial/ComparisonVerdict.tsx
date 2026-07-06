import type { ReactNode } from 'react'

export type ComparisonWinner = {
  /** The dimension being judged ("Fastest", "Best for sleep", "Best safety"). */
  label: string
  /** Which option wins it — usually one of the two option names, or "Either". */
  winner: string
  /** Optional short qualifier. */
  note?: string
}

type ComparisonVerdictProps = {
  title?: string
  /** Names of the two things being compared. */
  optionA: string
  optionB: string
  /** Situations where A is the better first choice. */
  chooseA: string[]
  /** Situations where B is the better first choice. */
  chooseB: string[]
  /** When to use both together. */
  useBoth?: string[]
  /** When neither is the answer. */
  avoidBoth?: string[]
  /** Quick "who wins what" verdict rows. */
  winners?: ComparisonWinner[]
  bottomLine?: ReactNode
  children?: ReactNode
}

/**
 * ComparisonVerdict — the decision module for comparison ("A vs B") pages.
 *
 * A comparison page's one job is to help the reader CHOOSE. This module makes
 * the call up front: choose A if…, choose B if…, use both if…, avoid both if…,
 * plus a quick grid of who-wins-what. Place it at the very top of a comparison
 * page, before the deep mechanism/evidence sections.
 *
 * Static-safe server component; theme-aware; distinctions are labeled (not
 * communicated by color alone).
 *
 * Usage (.tsx page):
 *   <ComparisonVerdict
 *     optionA="Magnesium" optionB="Melatonin"
 *     chooseA={['Muscle tension or trouble winding down', 'Likely low magnesium status']}
 *     chooseB={['A circadian/timing problem (jet lag, delayed sleep phase)']}
 *     useBoth={['Both relaxation and timing are issues — mind the timing']}
 *     winners={[
 *       { label: 'Fastest to act', winner: 'Melatonin' },
 *       { label: 'Best for muscle tension', winner: 'Magnesium' },
 *       { label: 'Best safety profile', winner: 'Magnesium', note: 'no morning grog' },
 *     ]}
 *   >
 *   They solve different problems and are often combined.
 *   </ComparisonVerdict>
 */
export function ComparisonVerdict({
  title = 'Which should you choose?',
  optionA,
  optionB,
  chooseA,
  chooseB,
  useBoth,
  avoidBoth,
  winners,
  bottomLine,
  children,
}: ComparisonVerdictProps) {
  return (
    <section
      aria-label={`Verdict: ${optionA} vs ${optionB}`}
      className="not-prose my-6 overflow-hidden rounded-2xl border-2 border-brand-900/15 bg-white shadow-md ring-1 ring-brand-900/5 dark:border-white/12 dark:bg-[var(--surface-card)]"
    >
      <div className="border-b border-brand-900/10 bg-brand-50/60 px-5 py-3 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">{title}</span>
      </div>

      <div className="px-5 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-800 dark:text-[var(--text-primary)]">
              Choose {optionA} if
            </p>
            <ul className="mt-2 space-y-1.5">
              {chooseA.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-ink">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-800 dark:text-[var(--text-primary)]">
              Choose {optionB} if
            </p>
            <ul className="mt-2 space-y-1.5">
              {chooseB.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-ink">
                  <span aria-hidden="true" className="mt-0.5 font-bold text-sky-600 dark:text-sky-400">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {useBoth && useBoth.length > 0 ? (
          <div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-50/60 px-3 py-2 dark:border-emerald-400/20 dark:bg-emerald-900/20">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Use both if
            </p>
            <ul className="mt-1 space-y-1">
              {useBoth.map((item) => (
                <li key={item} className="text-sm leading-6 text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {avoidBoth && avoidBoth.length > 0 ? (
          <div className="mt-3 rounded-lg border border-rose-500/25 bg-rose-50/60 px-3 py-2 dark:border-rose-400/20 dark:bg-rose-900/20">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Neither is enough if
            </p>
            <ul className="mt-1 space-y-1">
              {avoidBoth.map((item) => (
                <li key={item} className="text-sm leading-6 text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {winners && winners.length > 0 ? (
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-brand-900/10 pt-4 dark:border-white/10 sm:grid-cols-2">
            {winners.map((w) => (
              <div key={w.label} className="flex items-baseline justify-between gap-3">
                <dt className="text-sm text-muted">{w.label}</dt>
                <dd className="text-right text-sm font-bold text-ink">
                  {w.winner}
                  {w.note ? <span className="ml-1 font-normal text-muted">({w.note})</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {(bottomLine || children) && (
          <div className="mt-4 border-t border-brand-900/10 pt-4 text-sm leading-7 text-ink dark:border-white/10">
            <span className="font-bold">Bottom line: </span>
            {bottomLine ?? children}
          </div>
        )}
      </div>
    </section>
  )
}

export default ComparisonVerdict

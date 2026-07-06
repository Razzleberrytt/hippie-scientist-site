import type { ReactNode } from 'react'

/**
 * RealityCheck — corrects hype and sets honest expectations.
 *
 * A two-column "people expect / reality" contrast that defuses inflated
 * marketing claims before the reader forms them. Core to the brand's trust.
 *
 * MDX usage:
 *   <RealityCheck
 *     title="What to actually expect"
 *     expectations={['Instant calm', 'Strong sedation', 'Anxiety gone completely']}
 *     reality={['Effects are usually subtle', 'Calm without drowsiness', 'Severe anxiety needs more than a supplement']}
 *     bottomLine="Think 'quieter and smoother', not 'switched off'."
 *   />
 */
export function RealityCheck({
  title = 'Reality check',
  expectations,
  reality,
  bottomLine,
}: {
  title?: string
  expectations: string[]
  reality: string[]
  bottomLine?: ReactNode
}) {
  return (
    <section className="not-prose my-6 rounded-2xl border border-brand-900/12 bg-white p-5 shadow-[0_1px_2px_rgba(13,23,18,0.05)] dark:border-white/10 dark:bg-[var(--surface-card)]">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">People often expect</p>
          <ul className="mt-2 space-y-1.5">
            {expectations.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-muted line-through decoration-rose-400/50">
                <span aria-hidden="true" className="mt-0.5 not-line-through">
                  ✕
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            What's realistic
          </p>
          <ul className="mt-2 space-y-1.5">
            {reality.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-ink">
                <span aria-hidden="true" className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {bottomLine ? (
        <p className="mt-4 border-t border-brand-900/10 pt-3 text-sm leading-7 text-ink dark:border-white/10">
          <span className="font-bold">Bottom line: </span>
          {bottomLine}
        </p>
      ) : null}
    </section>
  )
}

export default RealityCheck

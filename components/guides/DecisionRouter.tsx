import Link from 'next/link'

export type IntentRoute = {
  /** The user's situation, phrased as they'd recognize it ("Racing thoughts at bedtime"). */
  problem: string
  /** One-line editorial reason this route fits — the "why". Optional but recommended. */
  why?: string
  /** The destination page's short label ("L-Theanine for Sleep"). */
  cta: string
  /** Destination href. Must be a real, existing route. */
  href: string
}

/**
 * DecisionRouter — the signature "field guide" routing module for hub pages.
 *
 * Instead of a flat directory of cards, it asks the reader to identify their
 * situation and routes each one to the single most relevant page. This is the
 * core of the decision-first hub standard: a hub should behave like an editor,
 * not a file cabinet.
 *
 * Reuse: give it an array of {problem, why, cta, href}. Intended for the
 * "Start here / what's your problem?" section of every goal hub (sleep,
 * anxiety, stress, focus). Keep routes pointed at real pages — each card is a
 * promise that the destination answers that specific problem.
 */
export function DecisionRouter({ items }: { items: IntentRoute[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.href + item.problem}
          href={item.href}
          className="group flex flex-col rounded-xl border-2 border-brand-900/12 bg-white p-5 shadow-[0_1px_2px_rgba(13,23,18,0.06)] transition-all hover:-translate-y-0.5 hover:border-brand-700/30 hover:shadow-md dark:border-white/10 dark:bg-[var(--surface-card)]"
        >
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-700">
            If your problem is
          </span>
          <span className="mt-1 text-base font-bold leading-snug text-ink">{item.problem}</span>
          {item.why ? <span className="mt-2 text-sm leading-6 text-muted">{item.why}</span> : null}
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-800 transition group-hover:gap-1.5 dark:text-[var(--text-primary)]">
            Start with {item.cta}
            <span aria-hidden="true">→</span>
          </span>
        </Link>
      ))}
    </div>
  )
}

export default DecisionRouter

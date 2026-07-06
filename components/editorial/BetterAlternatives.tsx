import Link from 'next/link'
import type { ReactNode } from 'react'

export type AlternativeItem = {
  /** The condition under which something else is the better call. */
  condition: string
  /** What to use instead. */
  recommendation: string
  /** Why it's the better fit. */
  reason: ReactNode
  href?: string
}

/**
 * BetterAlternatives — builds trust by routing readers elsewhere when the
 * page's subject is not their best option.
 *
 * MDX usage:
 *   <BetterAlternatives
 *     intro="L-theanine is not always the right first tool."
 *     alternatives={[
 *       { condition: 'Your main issue is physical tension', recommendation: 'Magnesium glycinate',
 *         reason: 'supports muscle relaxation and nervous-system calm.', href: '/articles/magnesium-glycinate/' },
 *       { condition: 'Your main issue is chronic stress', recommendation: 'Ashwagandha',
 *         reason: 'targets baseline stress and cortisol over weeks.', href: '/articles/ashwagandha/' },
 *     ]}
 *   />
 */
export function BetterAlternatives({
  title = 'When something else may be better',
  intro,
  alternatives,
}: {
  title?: string
  intro?: ReactNode
  alternatives: AlternativeItem[]
}) {
  return (
    <section className="not-prose my-6">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
      {intro ? <p className="mt-2 text-sm leading-6 text-muted">{intro}</p> : null}
      <div className="mt-4 space-y-2.5">
        {alternatives.map((alt, i) => (
          <div
            key={`${alt.condition}-${i}`}
            className="rounded-xl border border-brand-900/10 bg-white p-4 shadow-[0_1px_2px_rgba(13,23,18,0.05)] dark:border-white/10 dark:bg-[var(--surface-card)]"
          >
            <p className="text-sm font-semibold text-muted">{alt.condition}</p>
            <p className="mt-1 text-sm leading-6 text-ink">
              {alt.href ? (
                <Link href={alt.href} className="font-bold text-brand-800 hover:underline dark:text-[var(--text-primary)]">
                  {alt.recommendation}
                </Link>
              ) : (
                <span className="font-bold">{alt.recommendation}</span>
              )}{' '}
              — {alt.reason}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BetterAlternatives

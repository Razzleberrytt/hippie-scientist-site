import Link from 'next/link'
import type { GoalStartHereLink } from '@/lib/goal-start-here-links'

type GoalStartHereLinksProps = {
  links: GoalStartHereLink[]
}

export default function GoalStartHereLinks({ links }: GoalStartHereLinksProps) {
  if (links.length === 0) return null

  return (
    <section className="card-premium p-5 sm:p-8">
      <div className="max-w-3xl">
        <p className="eyebrow-label">Start here</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Best next reads for this goal</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Open the overview first, then use the comparison and profile pages to narrow the decision.
        </p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="goal-link-card rounded-2xl border border-brand-900/10 bg-white/70 p-4 transition hover:border-brand-700/20 hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-200">
              {link.role}
            </span>
            <span className="mt-1 block text-sm font-semibold text-ink">{link.title}</span>
            <span className="mt-2 block text-xs leading-5 text-muted">{link.note}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

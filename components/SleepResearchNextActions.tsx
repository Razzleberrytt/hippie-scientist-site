import SleepResearchNextActionLink from '@/components/SleepResearchNextActionLink'

const ACTIONS = [
  {
    href: '/guides/sleep/',
    action: 'research-hub',
    label: 'Compare the sleep evidence',
    description: 'Explore the sleep research hub and compare evidence-first guides.',
  },
  {
    href: '/info/newsletter/#research-interests',
    action: 'newsletter-interest',
    label: 'Follow sleep research',
    description: 'Choose Sleep as a research interest for evidence-focused updates.',
  },
] as const

/** Claim-neutral post-answer navigation for eligible sleep guides. */
export default function SleepResearchNextActions() {
  return (
    <section
      className="rounded-2xl border border-brand-900/10 bg-brand-50/30 p-5 sm:p-6"
      aria-labelledby="sleep-research-next-actions-heading"
    >
      <h2 id="sleep-research-next-actions-heading" className="text-xl font-semibold text-ink dark:text-[var(--text-primary)]">
        Continue your sleep research
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted dark:text-[var(--text-secondary)]">
        Keep exploring the evidence, or follow sleep research updates by email.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((action) => (
          <SleepResearchNextActionLink
            key={action.href}
            href={action.href}
            action={action.action}
            className="flex min-h-11 flex-col justify-center rounded-xl border border-brand-900/10 bg-white px-4 py-3 transition hover:border-brand-700/30 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-[var(--surface-card)]"
          >
            <span className="font-semibold text-brand-800 dark:text-[var(--text-primary)]">{action.label}</span>
            <span className="mt-1 text-sm leading-5 text-muted dark:text-[var(--text-secondary)]">{action.description}</span>
          </SleepResearchNextActionLink>
        ))}
      </div>
    </section>
  )
}

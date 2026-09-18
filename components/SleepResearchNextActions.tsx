import ResearchNextActions, { researchNextActionClassName } from '@/components/ResearchNextActions'
import SleepResearchNextActionLink from '@/components/SleepResearchNextActionLink'

const ACTIONS = [
  {
    href: '/guides/sleep/',
    action: 'research-hub',
    label: 'Compare the sleep evidence',
    description: 'Explore the sleep research hub and compare evidence-first guides.',
  },
  {
    href: '/info/newsletter/?interest=sleep#research-interests',
    action: 'newsletter-interest',
    label: 'Follow sleep research',
    description: 'Choose Sleep as a research interest for evidence-focused updates.',
  },
] as const

/** Claim-neutral post-answer navigation for eligible sleep guides. */
export default function SleepResearchNextActions() {
  return (
    <ResearchNextActions
      headingId="sleep-research-next-actions-heading"
      title="Continue your sleep research"
      description="Keep exploring the evidence, or follow sleep research updates by email."
    >
      {ACTIONS.map((action) => (
        <SleepResearchNextActionLink
          key={action.href}
          href={action.href}
          action={action.action}
          className={researchNextActionClassName}
        >
          <span className="font-semibold text-brand-800 dark:text-[var(--text-primary)]">{action.label}</span>
          <span className="mt-1 text-sm leading-5 text-muted dark:text-[var(--text-secondary)]">{action.description}</span>
        </SleepResearchNextActionLink>
      ))}
    </ResearchNextActions>
  )
}

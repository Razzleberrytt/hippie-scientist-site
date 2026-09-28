export type SiteDestinationId = 'goals' | 'guides' | 'ingredients' | 'safety' | 'research'

export type SiteDestination = {
  id: SiteDestinationId
  label: string
  href: string
  eyebrow: string
  description: string
}

export const siteDestinations: SiteDestination[] = [
  {
    id: 'goals',
    label: 'Goals',
    href: '/goals',
    eyebrow: 'Start with an outcome',
    description: 'Choose what you want to understand or improve, then compare the relevant options in context.',
  },
  {
    id: 'guides',
    label: 'Guides',
    href: '/guides',
    eyebrow: 'Make a decision',
    description: 'Use topic guides, comparisons, explainers, learning resources, and articles to answer a practical question.',
  },
  {
    id: 'ingredients',
    label: 'Ingredients',
    href: '/herbs',
    eyebrow: 'Look something up',
    description: 'Find herbs, nutrients, compounds, and extracts, then inspect their evidence and safety context.',
  },
  {
    id: 'safety',
    label: 'Safety',
    href: '/safety-checker',
    eyebrow: 'Check a combination',
    description: 'Screen stacks for caution signals, read evidence-gated interaction guidance, and understand uncertainty.',
  },
  {
    id: 'research',
    label: 'Research',
    href: '/research',
    eyebrow: 'Verify the evidence',
    description: 'Trace claims back to studies, evidence tools, methodology, reports, and public research data.',
  },
]

export const siteDestinationById = Object.fromEntries(
  siteDestinations.map((destination) => [destination.id, destination]),
) as Record<SiteDestinationId, SiteDestination>

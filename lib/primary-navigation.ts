import { coreGoals } from './core-goals'

export interface PrimaryNavigationItem {
  label: string
  href: string
  description?: string
  children?: PrimaryNavigationItem[]
  section?: string
  activePrefixes?: string[]
}

export const primaryNavigation: PrimaryNavigationItem[] = [
  {
    label: 'Goals',
    href: '/goals',
    description: 'Start with what you are researching, then follow the evidence to relevant options',
    children: [
      { section: 'Start here', label: 'Goal finder', href: '/goals' },
      ...coreGoals.map((goal) => ({
        section: 'Health goals',
        label: goal.label,
        href: goal.href.replace(/\/$/, ''),
      })),
    ],
  },
  {
    label: 'Ingredients',
    href: '/herbs',
    description: 'Look up herbs, nutrients, active compounds, extracts, evidence, and safety',
    activePrefixes: ['/herbs', '/compounds'],
    children: [
      { label: 'Herb database', href: '/herbs' },
      { label: 'Compound database', href: '/compounds' },
      { label: 'Search everything', href: '/search' },
    ],
  },
  {
    label: 'Compare',
    href: '/guides/compare',
    description: 'Compare options side by side by evidence, safety, form, dose, and practical tradeoffs',
    children: [
      { label: 'Comparison center', href: '/guides/compare' },
      { label: 'Build your own', href: '/guides/compare/dynamic' },
    ],
  },
  {
    label: 'Safety',
    href: '/safety-checker',
    description: 'Check interaction signals, contraindication context, and uncertainty before combining products',
    activePrefixes: ['/safety-checker', '/info/supplement-safety-checklist', '/guides/other/supplement-stacking-safety', '/novel-psychoactive-substances'],
    children: [
      { label: 'Safety Checker', href: '/safety-checker' },
      { label: 'Supplement safety checklist', href: '/info/supplement-safety-checklist' },
      { label: 'Stacking safety', href: '/guides/other/supplement-stacking-safety' },
      { label: 'Harm-reduction research', href: '/novel-psychoactive-substances' },
    ],
  },
  {
    label: 'Research',
    href: '/research',
    description: 'Browse studies, direct source links, evidence tools, research databases, methodology, and public data',
    activePrefixes: ['/research', '/evidence', '/tools', '/articles', '/learn', '/info/methodology'],
    children: [
      { section: 'Start here', label: 'Research library', href: '/research' },
      { section: 'Explore evidence', label: 'Citation explorer', href: '/learn/citation-explorer' },
      { section: 'Explore evidence', label: 'Evidence Database', href: '/evidence/evidence-checker' },
      { section: 'Explore evidence', label: 'Botanical Activity Atlas', href: '/tools/botanical-activity-atlas' },
      { section: 'Reports & methods', label: 'Evidence Report', href: '/evidence/evidence-report' },
      { section: 'Reports & methods', label: 'Methodology', href: '/info/methodology' },
      { section: 'Keep up', label: 'Evidence digest', href: '/evidence/evidence-digest' },
      { section: 'Keep up', label: 'All articles', href: '/articles' },
    ],
  },
]

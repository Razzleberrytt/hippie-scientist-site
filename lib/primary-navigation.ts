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
    href: '/evidence/evidence-report',
    description: 'Original evidence reports, databases, visual research tools, citations, and methodology',
    activePrefixes: ['/evidence', '/tools', '/articles', '/learn', '/info/methodology'],
    children: [
      { section: 'Original research', label: 'Evidence Report', href: '/evidence/evidence-report' },
      { section: 'Original research', label: 'Evidence Database', href: '/evidence/evidence-checker' },
      { section: 'Original research', label: 'Botanical Activity Atlas', href: '/tools/botanical-activity-atlas' },
      { section: 'Keep up', label: 'Evidence digest', href: '/evidence/evidence-digest' },
      { section: 'Read and verify', label: 'All articles', href: '/articles' },
      { section: 'Read and verify', label: 'Citation explorer', href: '/learn/citation-explorer' },
      { section: 'Read and verify', label: 'Methodology', href: '/info/methodology' },
    ],
  },
]

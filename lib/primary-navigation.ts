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
    label: 'Guides',
    href: '/guides',
    description: 'Browse mental health, ADHD, sleep, anxiety, substance-use, comparison, and supplement decision guides',
    activePrefixes: ['/guides'],
    children: [
      { section: 'Browse topics', label: 'All guides', href: '/guides', description: 'Browse the full guide library by topic' },
      { section: 'Browse topics', label: 'Mental Health', href: '/guides/mental-health', description: 'OCD, BPD, personality disorders, relationships, treatment, and stigma-aware research' },
      { section: 'Browse topics', label: 'ADHD', href: '/guides/adhd', description: 'Attention, executive function, nutrients, and treatment context' },
      { section: 'Browse topics', label: 'Sleep', href: '/guides/sleep' },
      { section: 'Browse topics', label: 'Anxiety', href: '/guides/anxiety' },
      { section: 'Browse topics', label: 'Stress', href: '/guides/stress' },
      { section: 'Browse topics', label: 'Focus & Cognition', href: '/guides/focus' },
      { section: 'Decisions & other guides', label: 'Substance Use & Harm Reduction', href: '/guides/substance-use' },
      { section: 'Decisions & other guides', label: 'Comparisons', href: '/guides/compare', description: 'Compare evidence, safety, forms, doses, and practical tradeoffs' },
      { section: 'Decisions & other guides', label: 'Best Supplements', href: '/guides/best' },
      { section: 'Decisions & other guides', label: 'Supplement Topic Guides', href: '/guides/other' },
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


function normalizeNavigationPath(path: string) {
  if (!path || path === '/') return '/'
  return path.replace(/\/+$/, '')
}

function navigationPrefixMatches(pathname: string, prefix: string) {
  const path = normalizeNavigationPath(pathname)
  const normalizedPrefix = normalizeNavigationPath(prefix)
  return path === normalizedPrefix || path.startsWith(`${normalizedPrefix}/`)
}

/**
 * Resolve exactly one active primary destination.
 *
 * Route families can intentionally overlap (for example, a safety guide living
 * under /guides). The longest matching prefix owns the active state so the
 * more-specific destination wins instead of highlighting two primary jobs.
 */
export function getActivePrimaryNavigationItem(pathname: string): PrimaryNavigationItem | undefined {
  let best: { item: PrimaryNavigationItem; prefixLength: number } | undefined

  for (const item of primaryNavigation) {
    const prefixes = item.activePrefixes?.length ? item.activePrefixes : [item.href]

    for (const prefix of prefixes) {
      if (!navigationPrefixMatches(pathname, prefix)) continue

      const prefixLength = normalizeNavigationPath(prefix).length
      if (!best || prefixLength > best.prefixLength) {
        best = { item, prefixLength }
      }
    }
  }

  return best?.item
}

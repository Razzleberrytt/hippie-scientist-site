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
    description: 'Start with the outcome or question you are researching',
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
    description: 'Decision guides, explainers, learning resources, and articles',
    activePrefixes: ['/guides', '/learn', '/articles'],
    children: [
      { section: 'Browse guides', label: 'All guides', href: '/guides', description: 'Browse practical guides by topic or decision' },
      { section: 'Browse guides', label: 'Mental Health', href: '/guides/mental-health', description: 'Conditions, relationships, treatment evidence, and stigma-aware research' },
      { section: 'Browse guides', label: 'ADHD', href: '/guides/adhd', description: 'Attention, executive function, nutrients, and treatment context' },
      { section: 'Browse guides', label: 'Sleep', href: '/guides/sleep' },
      { section: 'Browse guides', label: 'Anxiety', href: '/guides/anxiety' },
      { section: 'Browse guides', label: 'Stress', href: '/guides/stress' },
      { section: 'Browse guides', label: 'Focus & Cognition', href: '/guides/focus' },
      { section: 'Decide', label: 'Substance Use & Harm Reduction', href: '/guides/substance-use' },
      { section: 'Decide', label: 'Comparisons', href: '/guides/compare', description: 'Compare evidence, safety, forms, doses, and practical tradeoffs' },
      { section: 'Decide', label: 'Best Supplements', href: '/guides/best' },
      { section: 'Decide', label: 'Supplement Topic Guides', href: '/guides/other' },
      { section: 'Learn', label: 'Learning Library', href: '/learn', description: 'Evidence literacy, neuroscience, mechanisms, and safety explainers' },
      { section: 'Learn', label: 'Articles', href: '/articles', description: 'Research notes, evidence reviews, and editorial articles' },
    ],
  },
  {
    label: 'Ingredients',
    href: '/herbs',
    description: 'Look up herbs, nutrients, compounds, extracts, evidence, and safety',
    activePrefixes: ['/herbs', '/compounds', '/search'],
    children: [
      { label: 'Herb database', href: '/herbs' },
      { label: 'Compound database', href: '/compounds' },
      { label: 'Search profiles & learning', href: '/search' },
    ],
  },
  {
    label: 'Safety',
    href: '/safety-checker',
    description: 'Check interaction signals, contraindications, stacking risks, and uncertainty',
    activePrefixes: [
      '/safety-checker',
      '/info/supplement-safety-checklist',
      '/guides/other/supplement-stacking-safety',
      '/guides/interactions',
      '/learn/interactions',
      '/learn/safety-and-disclaimers',
      '/novel-psychoactive-substances',
    ],
    children: [
      { section: 'Check', label: 'Safety Checker', href: '/safety-checker' },
      { section: 'Understand', label: 'Interaction guides', href: '/safety-checker/interactions' },
      { section: 'Understand', label: 'How interactions work', href: '/learn/interactions' },
      { section: 'Prepare', label: 'Supplement safety checklist', href: '/info/supplement-safety-checklist' },
      { section: 'Related', label: 'Harm-reduction research', href: '/novel-psychoactive-substances' },
    ],
  },
  {
    label: 'Research',
    href: '/research',
    description: 'Studies, citations, evidence tools, methodology, reports, and public data',
    activePrefixes: [
      '/research',
      '/evidence',
      '/tools',
      '/learn/citation-explorer',
      '/learn/efficacy-model',
      '/learn/explorer',
      '/learn/research-methodology',
      '/info/methodology',
      '/info/reviews',
      '/info/research-roadmap',
      '/info/research-resources-for-writers',
    ],
    children: [
      { section: 'Start here', label: 'Research library', href: '/research', description: 'Choose the research task you are trying to complete' },
      { section: 'Find evidence', label: 'Research source register', href: '/research/source-register', description: 'Source-verified papers and the research-only PubMed index' },
      { section: 'Find evidence', label: 'Research Intelligence Studio', href: '/research/intelligence', description: 'Explore source-grounded study DNA, evidence comparisons, gaps, timelines, and safety literature' },
      { section: 'Find evidence', label: 'Citation explorer', href: '/learn/citation-explorer', description: 'Find study-level source records' },
      { section: 'Find evidence', label: 'Evidence Database', href: '/evidence/evidence-checker', description: 'Look up ingredient-level evidence' },
      { section: 'Find evidence', label: 'Botanical Activity Atlas', href: '/tools/botanical-activity-atlas', description: 'Explore evidence and mechanism relationships' },
      { section: 'Reports & methods', label: 'Evidence Report', href: '/evidence/evidence-report' },
      { section: 'Reports & methods', label: 'Methodology', href: '/info/methodology' },
      { section: 'Reports & methods', label: 'Review history', href: '/info/reviews' },
      { section: 'Keep up', label: 'Evidence digest', href: '/evidence/evidence-digest' },
      { section: 'Keep up', label: 'Research roadmap', href: '/info/research-roadmap' },
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
  return path === normalizedPrefix || path.startsWith(normalizedPrefix + '/')
}

/**
 * Resolve exactly one active primary destination.
 *
 * Route families can intentionally overlap. The longest matching prefix owns
 * the active state so a specific research or safety tool can override a broad
 * content family without highlighting two primary destinations.
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

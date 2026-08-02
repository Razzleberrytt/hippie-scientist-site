import { primaryNavigation, type PrimaryNavigationItem } from './primary-navigation'

export type NavigationItem = PrimaryNavigationItem

export interface BreadcrumbItem {
  label: string
  href: string
  current: boolean
}

export interface RouteMetadata {
  label: string
  description?: string
  parent?: string
  isDynamic?: boolean
}

export const SITE_URL = 'https://thehippiescientist.net'

// One navigation source of truth for the header, schema, helper utilities, and tests.
export const mainNavigation: NavigationItem[] = primaryNavigation

export const routeLabels: Record<string, RouteMetadata> = {
  '/': {
    label: 'Home',
    description: 'The Hippie Scientist evidence-based supplement research',
  },
  '/library': {
    label: 'Explore Everything',
    description: 'Complete site directory',
    parent: '/',
  },
  '/articles': {
    label: 'Articles',
    description: 'Research notes, evidence reviews, and editorial analysis',
    parent: '/library',
  },
  '/articles/[slug]': {
    label: 'Article',
    description: 'Research article or evidence review',
    parent: '/articles',
    isDynamic: true,
  },
  '/herbs': {
    label: 'Herbs',
    description: 'Evidence-graded herb profiles',
    parent: '/library',
  },
  '/herbs/[slug]': {
    label: 'Herb Profile',
    description: 'Detailed herb evidence and safety profile',
    parent: '/herbs',
    isDynamic: true,
  },
  '/compounds': {
    label: 'Compounds',
    description: 'Active compounds, nutrients, and standardized extracts',
    parent: '/library',
  },
  '/compounds/[slug]': {
    label: 'Compound Profile',
    description: 'Detailed compound evidence and safety profile',
    parent: '/compounds',
    isDynamic: true,
  },
  '/search': {
    label: 'Search',
    description: 'Search the complete site',
    parent: '/library',
  },
  '/guides': {
    label: 'Topics & Guides',
    description: 'Goal-based and practical evidence guides',
    parent: '/library',
  },
  '/guides/mental-health': {
    label: 'Mental Health',
    description: 'Conditions, treatment evidence, safety, and stigma-aware explainers',
    parent: '/guides',
  },
  '/guides/adhd': {
    label: 'ADHD',
    description: 'Attention, executive function, nutrients, and treatment context',
    parent: '/guides',
  },
  '/guides/sleep': {
    label: 'Sleep',
    description: 'Sleep aids, alternatives, and sleep-hygiene evidence',
    parent: '/guides',
  },
  '/guides/anxiety': {
    label: 'Anxiety & Stress',
    description: 'Calming supports, adaptogens, and stress-management evidence',
    parent: '/guides',
  },
  '/guides/focus': {
    label: 'Focus & Cognition',
    description: 'Focus support, nootropics, and cognitive performance',
    parent: '/guides',
  },
  '/guides/herbs': {
    label: 'Herb Guides',
    description: 'Long-form practical botanical guides',
    parent: '/guides',
  },
  '/guides/best': {
    label: 'Best Supplements',
    description: 'Evidence-aware roundups organized by need',
    parent: '/guides',
  },
  '/guides/compare': {
    label: 'Comparisons',
    description: 'Side-by-side supplement and compound tradeoffs',
    parent: '/guides',
  },
  '/guides/other': {
    label: 'Supplement Topic Guides',
    description: 'Forms, quality, routines, advanced compounds, and harm reduction',
    parent: '/guides',
  },
  '/guides/[slug]': {
    label: 'Guide',
    description: 'Evidence-informed supplement guide',
    parent: '/guides',
    isDynamic: true,
  },
  '/guides/[section]/[slug]': {
    label: 'Guide',
    description: 'Evidence-informed topic guide',
    parent: '/guides',
    isDynamic: true,
  },
  '/lead-magnets/adhd-supplement-starter-checklist': {
    label: 'ADHD Supplement Starter Checklist',
    description: 'Printable baseline, safety, and 28-day tracking worksheet',
    parent: '/guides/adhd',
  },
  '/learn': {
    label: 'Learning Library',
    description: 'Neuroscience, evidence literacy, and safety education',
    parent: '/library',
  },
  '/learn/[slug]': {
    label: 'Learning Resource',
    description: 'Educational research resource',
    parent: '/learn',
    isDynamic: true,
  },
  '/novel-psychoactive-substances': {
    label: 'Novel Psychoactive Substances',
    description: 'Harm-reduction profiles for emerging substances',
    parent: '/library',
  },
  '/safety': {
    label: 'Safety',
    description: 'Safety checker redirect',
    parent: '/',
  },
  '/safety-checker': {
    label: 'Safety Checker',
    description: 'Interaction and contraindication lookup',
    parent: '/library',
  },
  '/evidence/evidence-checker': {
    label: 'Evidence Lookup',
    description: 'Search compounds by clinical evidence grade',
    parent: '/library',
  },
  '/evidence/evidence-report': {
    label: 'Evidence Report',
    description: 'Annual state of supplement evidence review',
    parent: '/library',
  },
  '/evidence/evidence-digest': {
    label: 'Evidence Digest',
    description: 'Recent human-trial highlights and research summaries',
    parent: '/library',
  },
  '/info/methodology': {
    label: 'Methodology',
    description: 'Evidence grading and editorial standards',
    parent: '/library',
  },
  '/info/dosing': {
    label: 'Dosing Guide',
    description: 'Bioavailability, timing, stacking, and dose realism',
    parent: '/library',
  },
  '/info/supplement-safety-checklist': {
    label: 'Supplement Checklist',
    description: 'What to verify before buying or stacking a supplement',
    parent: '/library',
  },
  '/info/infographics': {
    label: 'Infographics',
    description: 'Downloadable and embeddable evidence visuals',
    parent: '/library',
  },
  '/info/about': {
    label: 'About',
    description: 'Project mission and editorial approach',
    parent: '/library',
  },
  '/info/author': {
    label: 'Author',
    description: 'Author identity and credentials',
    parent: '/library',
  },
  '/info/faq': {
    label: 'FAQ',
    description: 'Common questions about the site',
    parent: '/library',
  },
  '/info/contact': {
    label: 'Contact',
    description: 'Corrections, feedback, and contact information',
    parent: '/library',
  },
}

export const footerLinks = {
  legal: [
    { label: 'Privacy Policy', href: '/info/privacy' },
    { label: 'Disclaimer', href: '/info/disclaimer' },
    { label: 'Affiliate Disclosure', href: '/info/affiliate-disclosure' },
  ],
  social: [],
  meta: [
    { label: 'Explore Everything', href: '/library' },
    { label: 'Articles', href: '/articles' },
    { label: 'Evidence Report', href: '/evidence/evidence-report' },
    { label: 'Evidence Lookup', href: '/evidence/evidence-checker' },
    { label: 'Sitemap', href: '/sitemap.xml' },
    { label: 'RSS', href: '/rss.xml' },
  ],
}

const SEGMENT_LABEL_OVERRIDES: Record<string, string> = {
  'lions-mane': "Lion's Mane",
  'l-theanine': 'L-Theanine',
  'withanoside-iv': 'Withanoside IV',
  adhd: 'ADHD',
  faq: 'FAQ',
}

function segmentToLabel(segment: string): string {
  if (SEGMENT_LABEL_OVERRIDES[segment]) return SEGMENT_LABEL_OVERRIDES[segment]

  return segment
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bL Theanine\b/g, 'L-Theanine')
}

function findDynamicRoutePattern(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)

  for (const key in routeLabels) {
    if (!key.includes('[')) continue

    const keySegments = key.split('/').filter(Boolean)
    if (keySegments.length !== segments.length) continue

    const matches = keySegments.every((keySegment, index) =>
      keySegment.startsWith('[') || keySegment === segments[index]
    )

    if (matches) return key
  }

  return null
}

export function generateDynamicBreadcrumbs(
  pathname: string,
  customTrail?: BreadcrumbItem[]
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = customTrail
    ? [...customTrail]
    : [{ label: 'Home', href: '/', current: false }]

  const normalizedPath = pathname.toLowerCase().trim()
  if (normalizedPath === '/' || !normalizedPath) {
    breadcrumbs[0].current = true
    return breadcrumbs
  }

  const segments = normalizedPath.split('/').filter(Boolean)
  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const isLast = i === segments.length - 1
    const isStructuralSegment = segments[i] === 'page' || segments[i] === 'style' || segments[i] === 'lead-magnets'

    if (!isLast && isStructuralSegment) continue

    const metadata = routeLabels[currentPath]
    const patternKey = metadata ? null : findDynamicRoutePattern(currentPath)
    const displayLabel = metadata?.label
      || (patternKey ? segmentToLabel(segments[i]) : segmentToLabel(segments[i]))

    breadcrumbs.push({
      label: segments[i - 1] === 'page' ? `Page ${segments[i]}` : displayLabel,
      href: currentPath,
      current: isLast,
    })
  }

  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].current = true
  }

  return breadcrumbs
}

export function validateRoute(pathname: string): boolean {
  const normalizedPath = pathname.toLowerCase().trim()
  return normalizedPath in routeLabels || findDynamicRoutePattern(normalizedPath) !== null
}

export function getRouteMetadata(pathname: string): RouteMetadata | null {
  const normalizedPath = pathname.toLowerCase().trim()
  if (normalizedPath in routeLabels) return routeLabels[normalizedPath]

  const patternKey = findDynamicRoutePattern(normalizedPath)
  return patternKey ? routeLabels[patternKey] : null
}

export function flattenNavigation(
  items: NavigationItem[] = mainNavigation
): Array<{ item: NavigationItem; level: number; path: string }> {
  const result: Array<{ item: NavigationItem; level: number; path: string }> = []

  function traverse(currentItems: NavigationItem[], level: number) {
    for (const item of currentItems) {
      result.push({ item, level, path: item.href })
      if (item.children) traverse(item.children, level + 1)
    }
  }

  traverse(items, 0)
  return result
}

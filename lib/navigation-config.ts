export interface BreadcrumbItem {
  label: string
  href: string
  current: boolean
}

export interface RouteMetadata {
  label: string
  description?: string
  isDynamic?: boolean
}

export const SITE_URL = 'https://thehippiescientist.net'

export const routeLabels: Record<string, RouteMetadata> = {
  '/': {
    label: 'Home',
    description: 'The Hippie Scientist evidence-based supplement research',
  },
  '/start': {
    label: 'Start Here',
    description: 'Choose between goal research, ingredient lookup, and safety checking',
  },
  '/library': {
    label: 'Explore Everything',
    description: 'Complete site directory',
  },
  '/articles': {
    label: 'Articles',
    description: 'Research notes, evidence reviews, and editorial analysis',
  },
  '/articles/[slug]': {
    label: 'Article',
    description: 'Research article or evidence review',
    isDynamic: true,
  },
  '/herbs': {
    label: 'Herbs',
    description: 'Evidence-graded herb profiles',
  },
  '/herbs/[slug]': {
    label: 'Herb Profile',
    description: 'Detailed herb evidence and safety profile',
    isDynamic: true,
  },
  '/compounds': {
    label: 'Compounds',
    description: 'Active compounds, nutrients, and standardized extracts',
  },
  '/compounds/[slug]': {
    label: 'Compound Profile',
    description: 'Detailed compound evidence and safety profile',
    isDynamic: true,
  },
  '/search': {
    label: 'Search',
    description: 'Search the complete site',
  },
  '/goals': {
    label: 'Supplement Goals',
    description: 'Compare supplement options by the outcome you want to improve',
  },
  '/goals/[slug]': {
    label: 'Goal Guide',
    description: 'Goal-based supplement comparison by fit, onset, evidence, and risk',
    isDynamic: true,
  },
  '/guides': {
    label: 'Topics & Guides',
    description: 'Goal-based and practical evidence guides',
  },
  '/guides/mental-health': {
    label: 'Mental Health',
    description: 'Conditions, treatment evidence, safety, and stigma-aware explainers',
  },
  '/guides/adhd': {
    label: 'ADHD',
    description: 'Attention, executive function, nutrients, and treatment context',
  },
  '/guides/sleep': {
    label: 'Sleep',
    description: 'Sleep aids, alternatives, and sleep-hygiene evidence',
  },
  '/guides/stress': {
    label: 'Stress',
    description: 'Acute tension, chronic overload, burnout, cortisol concerns, and stress-support evidence',
  },
  '/guides/anxiety': {
    label: 'Anxiety',
    description: 'Anxiety patterns, calming supports, and evidence-aware safety guidance',
  },
  '/guides/focus': {
    label: 'Focus & Cognition',
    description: 'Focus support, nootropics, and cognitive performance',
  },
  '/guides/metabolic-health': {
    label: 'Metabolic Health',
    description: 'Metabolic-health evidence, comparisons, medication context, and practical research paths',
  },
  '/guides/herbs': {
    label: 'Herb Guides',
    description: 'Long-form practical botanical guides',
  },
  '/guides/best': {
    label: 'Best Supplements',
    description: 'Evidence-aware roundups organized by need',
  },
  '/guides/compare': {
    label: 'Comparisons',
    description: 'Side-by-side supplement and compound tradeoffs',
  },
  '/guides/other': {
    label: 'Supplement Topic Guides',
    description: 'Forms, quality, routines, advanced compounds, and harm reduction',
  },
  '/guides/[slug]': {
    label: 'Guide',
    description: 'Evidence-informed supplement guide',
    isDynamic: true,
  },
  '/guides/[section]/[slug]': {
    label: 'Guide',
    description: 'Evidence-informed topic guide',
    isDynamic: true,
  },
  '/lead-magnets/adhd-supplement-starter-checklist': {
    label: 'ADHD Supplement Starter Checklist',
    description: 'Printable baseline, safety, and 28-day tracking worksheet',
  },
  '/learn': {
    label: 'Learning Library',
    description: 'Neuroscience, evidence literacy, and safety education',
  },
  '/learn/[slug]': {
    label: 'Learning Resource',
    description: 'Educational research resource',
    isDynamic: true,
  },
  '/novel-psychoactive-substances': {
    label: 'Novel Psychoactive Substances',
    description: 'Harm-reduction profiles for emerging substances',
  },
  '/safety': {
    label: 'Safety',
    description: 'Safety checker redirect',
  },
  '/safety-checker': {
    label: 'Safety Checker',
    description: 'Interaction and contraindication lookup',
  },
  '/evidence/evidence-checker': {
    label: 'Evidence Lookup',
    description: 'Search compounds by clinical evidence grade',
  },
  '/evidence/evidence-report': {
    label: 'Evidence Report',
    description: 'Annual state of supplement evidence review',
  },
  '/evidence/evidence-digest': {
    label: 'Evidence Digest',
    description: 'Recent human-trial highlights and research summaries',
  },
  '/info/methodology': {
    label: 'Methodology',
    description: 'Evidence grading and editorial standards',
  },
  '/info/dosing': {
    label: 'Dosing Guide',
    description: 'Bioavailability, timing, stacking, and dose realism',
  },
  '/info/supplement-safety-checklist': {
    label: 'Supplement Checklist',
    description: 'What to verify before buying or stacking a supplement',
  },
  '/info/infographics': {
    label: 'Infographics',
    description: 'Downloadable and embeddable evidence visuals',
  },
  '/info/about': {
    label: 'About',
    description: 'Project mission and editorial approach',
  },
  '/info/author': {
    label: 'Author',
    description: 'Author identity and credentials',
  },
  '/info/faq': {
    label: 'FAQ',
    description: 'Common questions about the site',
  },
  '/info/contact': {
    label: 'Contact',
    description: 'Corrections, feedback, and contact information',
  },
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

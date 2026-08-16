export interface BreadcrumbItem {
  label: string
  href: string
  current: boolean
}

export const SITE_URL = 'https://thehippiescientist.net'

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/start': 'Start Here',
  '/library': 'Explore Everything',
  '/articles': 'Articles',
  '/articles/[slug]': 'Article',
  '/herbs': 'Herbs',
  '/herbs/[slug]': 'Herb Profile',
  '/compounds': 'Compounds',
  '/compounds/[slug]': 'Compound Profile',
  '/search': 'Search',
  '/goals': 'Supplement Goals',
  '/goals/[slug]': 'Goal Guide',
  '/guides': 'Topics & Guides',
  '/guides/mental-health': 'Mental Health',
  '/guides/adhd': 'ADHD',
  '/guides/sleep': 'Sleep',
  '/guides/stress': 'Stress',
  '/guides/anxiety': 'Anxiety',
  '/guides/focus': 'Focus & Cognition',
  '/guides/metabolic-health': 'Metabolic Health',
  '/guides/herbs': 'Herb Guides',
  '/guides/best': 'Best Supplements',
  '/guides/compare': 'Comparisons',
  '/guides/other': 'Supplement Topic Guides',
  '/guides/[slug]': 'Guide',
  '/guides/[section]/[slug]': 'Guide',
  '/lead-magnets/adhd-supplement-starter-checklist': 'ADHD Supplement Starter Checklist',
  '/learn': 'Learning Library',
  '/learn/[slug]': 'Learning Resource',
  '/novel-psychoactive-substances': 'Novel Psychoactive Substances',
  '/safety': 'Safety',
  '/safety-checker': 'Safety Checker',
  '/evidence/evidence-checker': 'Evidence Lookup',
  '/evidence/evidence-report': 'Evidence Report',
  '/evidence/evidence-digest': 'Evidence Digest',
  '/info/methodology': 'Methodology',
  '/info/dosing': 'Dosing Guide',
  '/info/supplement-safety-checklist': 'Supplement Checklist',
  '/info/infographics': 'Infographics',
  '/info/about': 'About',
  '/info/author': 'Author',
  '/info/faq': 'FAQ',
  '/info/contact': 'Contact',
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

    const exactLabel = routeLabels[currentPath]
    const patternKey = exactLabel ? null : findDynamicRoutePattern(currentPath)
    const displayLabel = exactLabel || (patternKey ? segmentToLabel(segments[i]) : segmentToLabel(segments[i]))

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

export interface BreadcrumbItem {
  label: string
  href: string
  current: boolean
}

export interface RouteMetadata {
  label: string
}

export const SITE_URL = 'https://thehippiescientist.net'

export const routeLabels: Record<string, RouteMetadata> = {
  '/': { label: 'Home' },
  '/start': { label: 'Start Here' },
  '/library': { label: 'Explore Everything' },
  '/articles': { label: 'Articles' },
  '/articles/[slug]': { label: 'Article' },
  '/herbs': { label: 'Herbs' },
  '/herbs/[slug]': { label: 'Herb Profile' },
  '/compounds': { label: 'Compounds' },
  '/compounds/[slug]': { label: 'Compound Profile' },
  '/search': { label: 'Search' },
  '/goals': { label: 'Supplement Goals' },
  '/goals/[slug]': { label: 'Goal Guide' },
  '/guides': { label: 'Topics & Guides' },
  '/guides/mental-health': { label: 'Mental Health' },
  '/guides/adhd': { label: 'ADHD' },
  '/guides/sleep': { label: 'Sleep' },
  '/guides/stress': { label: 'Stress' },
  '/guides/anxiety': { label: 'Anxiety' },
  '/guides/focus': { label: 'Focus & Cognition' },
  '/guides/metabolic-health': { label: 'Metabolic Health' },
  '/guides/herbs': { label: 'Herb Guides' },
  '/guides/best': { label: 'Best Supplements' },
  '/guides/compare': { label: 'Comparisons' },
  '/guides/other': { label: 'Supplement Topic Guides' },
  '/guides/[slug]': { label: 'Guide' },
  '/guides/[section]/[slug]': { label: 'Guide' },
  '/lead-magnets/adhd-supplement-starter-checklist': { label: 'ADHD Supplement Starter Checklist' },
  '/learn': { label: 'Learning Library' },
  '/learn/[slug]': { label: 'Learning Resource' },
  '/novel-psychoactive-substances': { label: 'Novel Psychoactive Substances' },
  '/safety': { label: 'Safety' },
  '/safety-checker': { label: 'Safety Checker' },
  '/evidence/evidence-checker': { label: 'Evidence Lookup' },
  '/evidence/evidence-report': { label: 'Evidence Report' },
  '/evidence/evidence-digest': { label: 'Evidence Digest' },
  '/info/methodology': { label: 'Methodology' },
  '/info/dosing': { label: 'Dosing Guide' },
  '/info/supplement-safety-checklist': { label: 'Supplement Checklist' },
  '/info/infographics': { label: 'Infographics' },
  '/info/about': { label: 'About' },
  '/info/author': { label: 'Author' },
  '/info/faq': { label: 'FAQ' },
  '/info/contact': { label: 'Contact' },
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

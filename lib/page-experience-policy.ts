const TOP_LEVEL_HUBS = new Set([
  '/start',
  '/explore',
  '/library',
  '/goals',
  '/guides',
  '/learn',
  '/articles',
  '/research',
  '/evidence',
  '/tools',
  '/herbs',
  '/compounds',
  '/info',
])

const GUIDE_HUBS = new Set([
  '/guides/mental-health',
  '/guides/adhd',
  '/guides/sleep',
  '/guides/anxiety',
  '/guides/stress',
  '/guides/focus',
  '/guides/cognition',
  '/guides/metabolic-health',
  '/guides/substance-use',
  '/guides/compare',
  '/guides/best',
  '/guides/herbs',
  '/guides/other',
  '/guides/forms',
  '/guides/interactions',
  '/guides/timing',
])

const UTILITY_PREFIXES = [
  '/search',
  '/safety-checker',
  '/evidence/evidence-checker',
  '/learn/citation-explorer',
  '/tools/botanical-activity-atlas',
  '/tools/evidence-matrices',
]

const RESEARCH_SURFACE_PREFIXES = [
  '/research',
  '/evidence',
  '/tools',
  '/info/methodology',
  '/info/reviews',
  '/info/research-roadmap',
  '/info/research-resources-for-writers',
]

const NON_EDITORIAL_INFO = new Set([
  '/privacy',
  '/terms',
  '/corrections',
  '/info/about',
  '/info/author',
  '/info/contact',
  '/info/faq',
  '/info/privacy',
  '/info/disclaimer',
  '/info/affiliate-disclosure',
  '/info/content-licensing',
  '/info/corrections',
  '/info/editorial-policy',
  '/info/newsletter',
])

function normalizePath(pathname: string) {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] || '/'
  if (withoutQuery === '/') return '/'
  return withoutQuery.replace(/\/+$/, '') || '/'
}

function pathMatchesPrefix(pathname: string, prefix: string) {
  const path = normalizePath(pathname)
  const normalizedPrefix = normalizePath(prefix)
  return path === normalizedPrefix || path.startsWith(normalizedPrefix + '/')
}

export function isProfileRoute(pathname: string) {
  const segments = normalizePath(pathname).split('/').filter(Boolean)
  return segments.length === 2 && (segments[0] === 'herbs' || segments[0] === 'compounds')
}

export function isHubRoute(pathname: string) {
  const path = normalizePath(pathname)
  if (TOP_LEVEL_HUBS.has(path) || GUIDE_HUBS.has(path)) return true

  const segments = path.split('/').filter(Boolean)
  if (segments[0] === 'goals' && segments.length <= 2) return true

  const isPaginatedIngredientIndex =
    segments.length === 3 &&
    (segments[0] === 'herbs' || segments[0] === 'compounds') &&
    segments[1] === 'page' &&
    /^\d+$/.test(segments[2])

  return isPaginatedIngredientIndex
}

export function isUtilityRoute(pathname: string) {
  return UTILITY_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))
}

export function isResearchSurface(pathname: string) {
  return RESEARCH_SURFACE_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))
}

export function shouldShowGlobalBreadcrumbs(pathname: string) {
  const path = normalizePath(pathname)
  if (path === '/') return false
  if (isHubRoute(path) || isUtilityRoute(path)) return false
  return true
}

export function shouldShowGlobalToc(pathname: string) {
  const path = normalizePath(pathname)
  if (path === '/') return false
  if (isHubRoute(path) || isUtilityRoute(path) || isProfileRoute(path)) return false
  return true
}

export function shouldShowGlobalLeadMagnet(pathname: string) {
  const path = normalizePath(pathname)
  if (path === '/') return false
  if (path.startsWith('/api/') || path.startsWith('/lead-magnets/')) return false
  if (isHubRoute(path) || isUtilityRoute(path) || isResearchSurface(path)) return false
  if (NON_EDITORIAL_INFO.has(path)) return false
  return true
}

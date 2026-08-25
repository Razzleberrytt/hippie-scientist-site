const ROUTE_PREFIXES = [
  '/guides/',
  '/compare/',
  '/comparisons/',
  '/research/',
  '/tools/',
  '/methodology/',
] as const

const EXACT_ROUTES = new Set([
  '/info/newsletter/',
])

// Keep the profile rollout intentionally selective. The Google preference is
// domain-level, so there is no benefit to rendering the control on every
// catalog page before we know which surfaces actually convert readers into a
// preference. These are high-interest / authority-candidate profiles and can be
// revised from Search Console cohort evidence without touching profile templates.
const PROFILE_ROUTES = new Set([
  '/herbs/ashwagandha/',
  '/herbs/matricaria-chamomilla/',
  '/herbs/piper-methysticum/',
  '/herbs/passiflora-incarnata/',
  '/herbs/hericium-erinaceus/',
  '/herbs/rhodiola-rosea/',
  '/herbs/valeriana-officinalis/',
  '/herbs/bacopa-monnieri/',
  '/herbs/ginkgo-biloba/',
  '/herbs/curcuma-longa/',
  '/herbs/panax-ginseng/',
  '/herbs/ocimum-tenuiflorum/',
  '/compounds/cannabidiol/',
  '/compounds/luteolin/',
  '/compounds/l-theanine/',
  '/compounds/melatonin/',
  '/compounds/glycine/',
  '/compounds/apigenin/',
  '/compounds/quercetin/',
  '/compounds/berberine/',
  '/compounds/coenzyme-q10/',
  '/compounds/n-acetylcysteine/',
  '/compounds/5-htp/',
  '/compounds/creatine/',
])

function normalizePathname(pathname: string) {
  const path = String(pathname || '/').split(/[?#]/, 1)[0] || '/'
  if (path === '/') return '/'
  return path.endsWith('/') ? path : `${path}/`
}

export function shouldShowPreferredSource(pathname: string) {
  const normalized = normalizePathname(pathname)
  if (EXACT_ROUTES.has(normalized) || PROFILE_ROUTES.has(normalized)) return true
  return ROUTE_PREFIXES.some(prefix => normalized.startsWith(prefix))
}

export const preferredSourceRollout = {
  exactRoutes: [...EXACT_ROUTES],
  routePrefixes: [...ROUTE_PREFIXES],
  profileRoutes: [...PROFILE_ROUTES],
}

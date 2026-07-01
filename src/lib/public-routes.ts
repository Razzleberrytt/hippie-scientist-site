export const PUBLIC_ROUTES = {
  home: '/',
  herbs: '/herbs/',
  compounds: '/compounds/',
  goals: '/guides/',
  build: '/build/',
  blog: '/learn/',
  researchNotes: '/learn/',
  articles: '/learn/',
  guides: '/guides/',
  learning: '/learn/',
  about: '/info/about/',
  contact: '/info/contact/',
  privacy: '/info/privacy/',
  disclaimer: '/info/disclaimer/',
} as const

export type PublicRouteKey = keyof typeof PUBLIC_ROUTES

export function herbDetailRoute(slug: string): string {
  return `${PUBLIC_ROUTES.herbs}${slug}/`
}

export function compoundDetailRoute(slug: string): string {
  return `${PUBLIC_ROUTES.compounds}${slug}/`
}

export const PUBLIC_ROUTES = {
  home: '/',
  herbs: '/herbs/',
  compounds: '/compounds/',
  goals: '/goals/',
  build: '/build/',
  blog: '/articles/',
  researchNotes: '/articles/',
  articles: '/articles/',
  guides: '/guides/',
  learning: '/learn/',
  about: '/info/info/about/',
  contact: '/info/info/contact/',
  privacy: '/info/info/privacy/',
  disclaimer: '/info/info/disclaimer/',
} as const

export type PublicRouteKey = keyof typeof PUBLIC_ROUTES

export function herbDetailRoute(slug: string): string {
  return `${PUBLIC_ROUTES.herbs}${slug}/`
}

export function compoundDetailRoute(slug: string): string {
  return `${PUBLIC_ROUTES.compounds}${slug}/`
}

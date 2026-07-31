export const PUBLIC_ROUTES = {
  home: '/',
  library: '/library/',
  herbs: '/herbs/',
  compounds: '/compounds/',
  goals: '/guides/',
  build: '/build/',
  blog: '/articles/',
  researchNotes: '/articles/',
  articles: '/articles/',
  guides: '/guides/',
  learning: '/learn/',
  about: '/info/about/',
  author: '/info/author/',
  faq: '/info/faq/',
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

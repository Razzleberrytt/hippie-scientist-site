export const PUBLIC_ROUTES = {
  start: '/start/',
  library: '/library/',
  herbs: '/herbs/',
  compounds: '/compounds/',
  articles: '/articles/',
  guides: '/guides/',
  about: '/info/about/',
  author: '/info/author/',
  faq: '/info/faq/',
  contact: '/info/contact/',
  privacy: '/info/privacy/',
  disclaimer: '/info/disclaimer/',
} as const

export function herbDetailRoute(slug: string): string {
  return `${PUBLIC_ROUTES.herbs}${slug}/`
}

export function compoundDetailRoute(slug: string): string {
  return `${PUBLIC_ROUTES.compounds}${slug}/`
}

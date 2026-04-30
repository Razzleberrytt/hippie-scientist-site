export const PUBLIC_ROUTES = {
  home: '/',
  herbs: '/herbs',
  compounds: '/compounds',
  build: '/build',
  blog: '/blog',
  learning: '/learning',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  disclaimer: '/disclaimer',
} as const

export type PublicRouteKey = keyof typeof PUBLIC_ROUTES

export function herbDetailRoute(slug: string): string {
  return `${PUBLIC_ROUTES.herbs}/${slug}`
}

export function compoundDetailRoute(slug: string): string {
  return `${PUBLIC_ROUTES.compounds}/${slug}`
}

import type { LocalizedPageData } from './localization'

export type LocalizedRouteParams = Promise<{ segments: string[] }>

export function generateLocalizedStaticParams(routeKeys: Record<string, string>) {
  return Object.keys(routeKeys).map((route) => ({ segments: route.split('/') }))
}

export async function resolveLocalizedPage<Key extends string>(
  params: LocalizedRouteParams,
  routeKeys: Record<string, Key>,
  pages: Record<Key, LocalizedPageData>,
): Promise<LocalizedPageData | null> {
  const { segments } = await params
  const key = routeKeys[segments.join('/')]
  return key ? pages[key] : null
}

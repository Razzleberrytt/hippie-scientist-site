import { DEPRECATED_HERB_CANONICALS } from './deprecated-herb-canonicals'

/**
 * Public herb route slug -> underlying runtime data slug.
 *
 * Some public common-name profiles are intentionally backed by a Latin-name
 * source record. The public route remains canonical when the source row itself
 * redirects back to that public slug.
 */
export const HERB_CANONICAL_SOURCE_ALIASES: Record<string, string> = {
  'lions-mane': 'hericium-erinaceus',
  passionflower: 'passiflora-incarnata',
  kava: 'piper-methysticum',
  'ashwagandha-withania-somnifera': 'ashwagandha',
}

export function getHerbSourceSlug(routeSlug: string): string {
  return HERB_CANONICAL_SOURCE_ALIASES[routeSlug] || routeSlug
}

export function getHerbCanonicalRouteSlug(routeSlug: string): string {
  const sourceSlug = HERB_CANONICAL_SOURCE_ALIASES[routeSlug]
  if (!sourceSlug) return routeSlug

  return DEPRECATED_HERB_CANONICALS[sourceSlug] === routeSlug
    ? routeSlug
    : sourceSlug
}

export function isCanonicalHerbAliasRoute(routeSlug: string): boolean {
  return Boolean(HERB_CANONICAL_SOURCE_ALIASES[routeSlug]) &&
    getHerbCanonicalRouteSlug(routeSlug) === routeSlug
}

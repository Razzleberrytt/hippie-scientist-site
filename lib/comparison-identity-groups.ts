const CANONICAL_IDENTITY_GROUPS: string[][] = [
  ['coptis', 'coptis-chinensis'],
  ['phellodendron', 'phellodendron-amurense'],
  ['hypericum-perforatum', 'st-johns-wort'],
  ['citrus-sinensis', 'orange-peel'],
  ['holy-basil', 'holy-basil-purple'],
]

const identityBySlug = new Map<string, string>()
for (const group of CANONICAL_IDENTITY_GROUPS) {
  const canonical = group[0]
  for (const slug of group) identityBySlug.set(slug, canonical)
}

export function canonicalComparisonIdentity(slug: string) {
  return identityBySlug.get(slug) ?? slug
}

export function isSameComparisonIdentity(aSlug: string, bSlug: string) {
  return canonicalComparisonIdentity(aSlug) === canonicalComparisonIdentity(bSlug)
}

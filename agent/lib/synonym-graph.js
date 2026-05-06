export const SYNONYM_GRAPH = {
  nac: ['n-acetylcysteine'],
  egcg: ['epigallocatechin gallate'],
  coq10: ['coenzyme q10'],
  ala: ['alpha lipoic acid'],
}

export function resolveCanonicalName(value = '') {
  const normalized = String(value).trim().toLowerCase()

  for (const [canonical, aliases] of Object.entries(SYNONYM_GRAPH)) {
    if (canonical === normalized) return canonical
    if (aliases.includes(normalized)) return canonical
  }

  return normalized
}

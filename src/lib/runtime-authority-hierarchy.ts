import {
  clampScore,
  safeArray,
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

function normalizeSupernodes(value: unknown) {
  return safeArray(value)
    .map((item) => safeText(item))
    .filter(Boolean)
}

function hierarchyWeight(supernodes: string[]) {
  if (supernodes.length >= 6) {
    return 96
  }

  if (supernodes.length >= 4) {
    return 84
  }

  if (supernodes.length >= 2) {
    return 72
  }

  return 48
}

function authorityDensity(record: any) {
  const pathways = safeArray(record?.pathways)
  const relationships = safeArray(record?.relationships)
  const compareGroups = safeArray(record?.compare_groups)

  return clampScore(
    pathways.length * 8 +
      relationships.length * 4 +
      compareGroups.length * 6,
    40,
  )
}

export function buildAuthorityHierarchy(source: unknown) {
  const record = safeObject(source)

  const supernodes = normalizeSupernodes(
    record?.authority_supernodes ||
      record?.supernodes ||
      record?.semantic_supernodes,
  )

  const hierarchyScore = hierarchyWeight(supernodes)
  const densityScore = authorityDensity(record)

  const authorityScore = clampScore(
    Math.round(
      hierarchyScore * 0.65 + densityScore * 0.35,
    ),
    44,
  )

  return {
    authorityScore,
    hierarchyScore,
    densityScore,
    supernodes,
    primarySupernode: supernodes[0] || 'emerging-domain',
  }
}

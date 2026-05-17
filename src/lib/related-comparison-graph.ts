import {
  buildCompareClusters,
  getRelatedComparisons,
  type CompareProfile,
  type RelatedComparison,
} from './compare-relationships'

export type ComparisonGraphNode<T extends CompareProfile> = {
  comparison: RelatedComparison<T>
  related: RelatedComparison<T>[]
}

const DEFAULT_LIMIT = 6

function normalizeCompareKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/-vs-/g, ':')
    .replace(/[^a-z0-9:]+/g, '')
}

function comparisonLoopKey(left: string, right: string): string {
  return [left, right].sort().join('|')
}

export function preventDuplicateCompareLoops<T extends CompareProfile>(comparisons: RelatedComparison<T>[]): RelatedComparison<T>[] {
  const seen = new Set<string>()

  return comparisons.filter(comparison => {
    const normalized = normalizeCompareKey(comparison.slug)
    const [left = '', right = ''] = normalized.split(':')
    const key = comparisonLoopKey(left, right)

    if (!left || !right || seen.has(key)) return false

    seen.add(key)
    return true
  })
}

export function buildRelatedComparisonGraph<T extends CompareProfile>(
  base: CompareProfile,
  comparisons: T[],
  limit = DEFAULT_LIMIT,
): ComparisonGraphNode<T>[] {
  const related = preventDuplicateCompareLoops(
    getRelatedComparisons(base, comparisons, limit * 2),
  ).slice(0, limit)

  return related.map(comparison => ({
    comparison,
    related: preventDuplicateCompareLoops(
      getRelatedComparisons(comparison.item, comparisons, limit),
    )
      .filter(item => item.slug !== comparison.slug)
      .slice(0, Math.max(2, limit - 2)),
  }))
}

export function getComparisonTraversalCandidates<T extends CompareProfile>(
  base: CompareProfile,
  comparisons: T[],
  limit = DEFAULT_LIMIT,
): RelatedComparison<T>[] {
  return preventDuplicateCompareLoops(
    getRelatedComparisons(base, comparisons, limit * 2),
  )
    .filter(comparison => {
      const signalDensity =
        comparison.sharedEffects.length +
        comparison.sharedMechanisms.length +
        comparison.sharedGoals.length

      // Conservative traversal philosophy:
      // only retain comparisons with meaningful semantic overlap.
      return signalDensity >= 2
    })
    .slice(0, limit)
}

export function buildComparisonRelationshipMap<T extends CompareProfile>(
  comparisons: T[],
  limit = DEFAULT_LIMIT,
): Record<string, RelatedComparison<T>[]> {
  const map: Record<string, RelatedComparison<T>[]> = {}

  comparisons.forEach(comparison => {
    if (!comparison.slug) return

    map[String(comparison.slug)] = getComparisonTraversalCandidates(
      comparison,
      comparisons,
      limit,
    )
  })

  return map
}

export function buildComparisonClusterMap<T extends CompareProfile>(
  comparisons: T[],
  limit = DEFAULT_LIMIT,
) {
  const map: Record<string, ReturnType<typeof buildCompareClusters<T>>> = {}

  comparisons.forEach(comparison => {
    if (!comparison.slug) return

    map[String(comparison.slug)] = buildCompareClusters(
      comparison,
      comparisons,
      limit,
    )
  })

  return map
}

export function createComparisonCardModel<T extends CompareProfile>(comparison: RelatedComparison<T>) {
  return {
    slug: comparison.slug,
    label: comparison.label,
    href: `/compare/${comparison.slug}`,
    score: comparison.score,
    reasons: comparison.reasons,
    sharedEffects: comparison.sharedEffects.slice(0, 3),
    sharedMechanisms: comparison.sharedMechanisms.slice(0, 3),
    sharedGoals: comparison.sharedGoals.slice(0, 2),
  }
}

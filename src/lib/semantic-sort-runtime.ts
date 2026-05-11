import { safeText } from '@/lib/runtime-render-guards'

export function deterministicTieBreak(
  left: unknown,
  right: unknown,
): number {
  return safeText(left).localeCompare(safeText(right))
}

export function numericScore(value: unknown): number {
  const score = Number(value)

  if (!Number.isFinite(score)) {
    return 0
  }

  return score
}

export function stableScoreSort<T>(
  items: T[],
  getScore: (item: T) => unknown,
  getTieBreak: (item: T) => unknown = (item) => safeText(item),
): T[] {
  return [...items].sort((left, right) => {
    const scoreDelta = numericScore(getScore(right)) - numericScore(getScore(left))

    if (scoreDelta !== 0) {
      return scoreDelta
    }

    return deterministicTieBreak(getTieBreak(left), getTieBreak(right))
  })
}

export function cappedSorted<T>(
  items: T[],
  limit: number,
  compare: (left: T, right: T) => number,
): T[] {
  const safeLimit = Math.max(0, Math.floor(numericScore(limit)))

  if (safeLimit === 0) {
    return []
  }

  return [...items].sort(compare).slice(0, safeLimit)
}

export function stableRelationshipRanking<T>(
  items: T[],
  getPrimaryScore: (item: T) => unknown,
  getLabel: (item: T) => unknown,
  limit = items.length,
): T[] {
  return stableScoreSort(items, getPrimaryScore, getLabel).slice(
    0,
    Math.max(0, Math.floor(numericScore(limit))),
  )
}

import { safeArray, safeText } from './runtime-render-guards'

export const SEMANTIC_EXPANSION_LIMITS = {
  maxDiscoverySignals: 24,
  maxBridgeExpansions: 32,
  maxCompareCandidates: 18,
  maxStackCandidates: 18,
  maxContinuities: 20,
}

export function enforceExpansionBudget<T>(
  items: T[],
  limit: number,
): T[] {
  const safeLimit = Math.max(0, Math.floor(Number(limit) || 0))

  return safeArray(items).slice(0, safeLimit)
}

export function cappedExpansion<T>(
  items: T[],
  limit: number,
): T[] {
  return enforceExpansionBudget(items, limit)
}

export function safeExpansionCount(value: unknown, fallback = 0): number {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return fallback
  }

  return Math.max(0, Math.floor(numeric))
}

export function stableSemanticKey(...parts: unknown[]): string {
  return parts
    .flatMap((part) => safeArray(part))
    .map((value) => safeText(value).toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 200)
    .join('|')
}

export const SEMANTIC_BUILD_LIMITS = {
  maxSignalsPerRecord: 32,
  maxSignalIndexRows: 120,
  maxRelatedProfiles: 12,
  maxComparisonCandidates: 8,
  maxStackCandidates: 8,
  maxAuthorityHubProfiles: 12,
  maxSerializedLabels: 12,
}

export function capBuildList<T>(values: T[], limit: number): T[] {
  const safeLimit = Math.max(0, Math.floor(Number(limit) || 0))
  return Array.isArray(values) ? values.slice(0, safeLimit) : []
}

export function stableBuildKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

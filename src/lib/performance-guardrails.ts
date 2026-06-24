export type PerformanceGuardrailReport = {
  label: string
  healthy: boolean
  count: number
  limit: number
  severity: 'ok' | 'watch' | 'high'
}

function severity(count: number, limit: number): PerformanceGuardrailReport['severity'] {
  if (count <= limit) return 'ok'
  if (count <= limit * 1.25) return 'watch'
  return 'high'
}

export function createGuardrailReport(
  label: string,
  count: number,
  limit: number,
): PerformanceGuardrailReport {
  return {
    label,
    count,
    limit,
    healthy: count <= limit,
    severity: severity(count, limit),
  }
}

export function clampForInitialRender<T>(items: T[], limit = 12) {
  return items.slice(0, limit)
}

export function clampForMobileRender<T>(items: T[], limit = 8) {
  return items.slice(0, limit)
}

export function clampForStaticExport<T>(items: T[], limit = 48) {
  return items.slice(0, limit)
}

export function getPerformanceGuardrails() {
  return {
    maxInitialCards: 12,
    maxMobileCards: 8,
    maxStaticCards: 48,
    maxGraphNodes: 18,
    maxGraphEdges: 36,
    maxSemanticRails: 6,
    maxArtworkPanelsAboveFold: 2,
  }
}

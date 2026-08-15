export type MetadataIntent = 'general' | 'safety' | 'dose' | 'timing' | 'comparison' | 'product-quality'

export type MetadataPerformance = {
  impressions: number
  clicks: number
  position: number
}

export type MetadataExperimentEligibility = {
  eligible: boolean
  actualCtr: number
  expectedCtr: number
  underperformanceRatio: number
  reason: string
}

const POSITION_CTR: Array<[number, number]> = [
  [1, 0.28], [2, 0.15], [3, 0.11], [4, 0.08], [5, 0.065], [6, 0.052], [7, 0.043],
  [8, 0.036], [9, 0.031], [10, 0.027], [11, 0.022], [12, 0.019], [13, 0.017], [14, 0.015],
  [15, 0.013], [20, 0.008],
]

export function expectedCtrForPosition(position: number): number {
  if (!Number.isFinite(position) || position <= 0) return 0
  const exact = POSITION_CTR.find(([rank]) => rank === Math.round(position))
  if (exact) return exact[1]

  for (let index = 0; index < POSITION_CTR.length - 1; index += 1) {
    const [aPos, aCtr] = POSITION_CTR[index]
    const [bPos, bCtr] = POSITION_CTR[index + 1]
    if (position > aPos && position < bPos) {
      const t = (position - aPos) / (bPos - aPos)
      return aCtr + (bCtr - aCtr) * t
    }
  }

  return position > 20 ? Math.max(0.002, 0.008 * (20 / position)) : POSITION_CTR[0][1]
}

export function classifyMetadataIntent(query: string): MetadataIntent {
  const value = query.toLowerCase()
  if (/\b(vs|versus|compare|comparison|alternative)\b/.test(value)) return 'comparison'
  if (/\b(dose|dosage|how much|mg|gram)\b/.test(value)) return 'dose'
  if (/\b(when|morning|night|time to take|before bed|with food|empty stomach)\b/.test(value)) return 'timing'
  if (/\b(safe|safety|interaction|side effect|risk|contraindication|warning)\b/.test(value)) return 'safety'
  if (/\b(best brand|buy|quality|extract|form|glycinate|citrate|standardized|third party|coa)\b/.test(value)) return 'product-quality'
  return 'general'
}

export function evaluateMetadataExperimentEligibility(
  performance: MetadataPerformance,
  options: { minImpressions?: number; maxPosition?: number; underperformanceThreshold?: number } = {},
): MetadataExperimentEligibility {
  const minImpressions = options.minImpressions ?? 100
  const maxPosition = options.maxPosition ?? 15
  const underperformanceThreshold = options.underperformanceThreshold ?? 0.72
  const actualCtr = performance.impressions > 0 ? performance.clicks / performance.impressions : 0
  const expectedCtr = expectedCtrForPosition(performance.position)
  const ratio = expectedCtr > 0 ? actualCtr / expectedCtr : 1

  if (performance.impressions < minImpressions) {
    return { eligible: false, actualCtr, expectedCtr, underperformanceRatio: ratio, reason: 'insufficient-impressions' }
  }
  if (performance.position <= 0 || performance.position > maxPosition) {
    return { eligible: false, actualCtr, expectedCtr, underperformanceRatio: ratio, reason: 'position-outside-test-window' }
  }
  if (ratio >= underperformanceThreshold) {
    return { eligible: false, actualCtr, expectedCtr, underperformanceRatio: ratio, reason: 'ctr-performing-at-or-above-threshold' }
  }
  return { eligible: true, actualCtr, expectedCtr, underperformanceRatio: ratio, reason: 'high-impression-ctr-underperformer' }
}

export function metadataDifferentiator(intent: MetadataIntent): string {
  switch (intent) {
    case 'safety': return 'Safety, Interactions & Evidence'
    case 'dose': return 'Studied Doses & Evidence'
    case 'timing': return 'Timing, Evidence & Safety'
    case 'comparison': return 'Evidence & Safety Comparison'
    case 'product-quality': return 'Forms, Quality & Evidence'
    default: return 'Evidence, Effects & Safety'
  }
}

export function compactExperimentTitle(primaryQuery: string, intent: MetadataIntent, max = 60): string {
  const query = primaryQuery.trim().replace(/\s+/g, ' ')
  const differentiator = metadataDifferentiator(intent)
  const title = `${query}: ${differentiator}`
  if (title.length <= max) return title
  if (query.length <= max) return query
  return `${query.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

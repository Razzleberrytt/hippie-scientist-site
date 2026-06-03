import { topicClusters } from '@/lib/ecosystem-context'
import { buildAdaptiveEcosystemPriorities } from '@/src/lib/adaptive-ecosystem-prioritization'
import { buildSemanticMomentum } from '@/src/lib/semantic-momentum-engine'
import { buildSemanticEcosystemBridges } from '@/src/lib/semantic-ecosystem-bridges'
import {
  clampScore,
  safeArray,
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

export type EcosystemStabilitySignal = {
  ecosystem: string
  stabilityScore: number
  continuityStability: number
  bridgeStability: number
  densityStability: number
  resilienceTier:
    | 'institutional'
    | 'stable'
    | 'volatile'
    | 'fragile'
}

function normalize(value: unknown) {
  return safeText(value).toLowerCase()
}

function tier(score: number): EcosystemStabilitySignal['resilienceTier'] {
  if (score >= 82) {
    return 'institutional'
  }

  if (score >= 64) {
    return 'stable'
  }

  if (score >= 44) {
    return 'volatile'
  }

  return 'fragile'
}

function average(values: number[], fallback = 0) {
  const safeValues = values.filter((value) => Number.isFinite(value))

  if (!safeValues.length) {
    return fallback
  }

  return safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length
}

function continuityDensity(records: unknown = [], ecosystem: string) {
  const normalized = normalize(ecosystem)
  const normalizedRecords = safeArray(records)

  const matches = normalizedRecords.filter((record) => {
    const source = safeObject(record)

    const fields = [
      source.summary,
      source.description,
      source.pathways,
      source.mechanisms,
      source.effects,
      source.topic_clusters,
      source.ecosystems,
    ]

    const haystack = fields
      .flatMap((field) => safeArray(field).length ? safeArray(field) : [field])
      .map((field) => safeText(field).toLowerCase())
      .join(' ')

    return haystack.includes(normalized)
  })

  return clampScore((matches.length / Math.max(normalizedRecords.length, 1)) * 100, 24)
}

export function buildEcosystemStability(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): EcosystemStabilitySignal[] {
  const adaptive = buildAdaptiveEcosystemPriorities(records, ecosystemClusters)
  const momentum = buildSemanticMomentum(records, ecosystemClusters)
  const bridges = buildSemanticEcosystemBridges(records, ecosystemClusters)

  return adaptive
    .map((priority) => {
      const momentumSignal = momentum.find(
        (signal) => normalize(signal.ecosystem) === normalize(priority.ecosystem),
      )

      const bridgeSignals = bridges.filter(
        (bridge) =>
          normalize(bridge.source) === normalize(priority.ecosystem) ||
          normalize(bridge.target) === normalize(priority.ecosystem),
      )

      const bridgeStability = clampScore(
        average(bridgeSignals.map((bridge) => bridge.bridgeScore), 18),
        18,
      )

      const continuityStability = clampScore(
        ((priority.continuityWeight || 0) +
          (momentumSignal?.continuityStrength || 0)) / 2,
        24,
      )

      const densityStability = continuityDensity(records, priority.ecosystem)

      const stabilityScore = clampScore(
        continuityStability * 0.38 +
          bridgeStability * 0.26 +
          densityStability * 0.16 +
          (priority.ecosystemScore || 0) * 0.2,
        28,
      )

      return {
        ecosystem: priority.ecosystem,
        stabilityScore,
        continuityStability,
        bridgeStability,
        densityStability,
        resilienceTier: tier(stabilityScore),
      }
    })
    .sort((a, b) => {
      if (b.stabilityScore !== a.stabilityScore) {
        return b.stabilityScore - a.stabilityScore
      }

      return a.ecosystem.localeCompare(b.ecosystem)
    })
}

import { topicClusters } from '@/lib/ecosystem-context'
import { buildAdaptiveEcosystemPriorities } from '@/src/lib/adaptive-ecosystem-prioritization'
import { buildSemanticMomentum } from '@/src/lib/semantic-momentum-engine'
import { buildSemanticEcosystemBridges } from '@/src/lib/semantic-ecosystem-bridges'
import { buildEcosystemStability } from '@/src/lib/ecosystem-stability-engine'
import {
  clampScore,
  safeArray,
  safeText,
} from './runtime-render-guards'

export type SemanticGovernanceSignal = {
  ecosystem: string
  governanceScore: number
  governanceTier:
    | 'canonical'
    | 'trusted'
    | 'developing'
    | 'restricted'
  discoveryScore: number
  continuityGovernance: number
  resilienceGovernance: number
  semanticCoverage: number
}

function normalize(value: unknown) {
  return safeText(value).toLowerCase()
}

function governanceTier(
  score: number,
): SemanticGovernanceSignal['governanceTier'] {
  if (score >= 84) {
    return 'canonical'
  }

  if (score >= 66) {
    return 'trusted'
  }

  if (score >= 46) {
    return 'developing'
  }

  return 'restricted'
}

function ecosystemCoverage(
  ecosystem: string,
  records: unknown[],
): number {
  const normalized = normalize(ecosystem)

  const matches = safeArray(records).filter((record: any) => {
    const searchable = [
      record?.summary,
      record?.description,
      ...(safeArray(record?.effects)),
      ...(safeArray(record?.mechanisms)),
      ...(safeArray(record?.pathways)),
      ...(safeArray(record?.topic_clusters)),
    ]
      .map((item) => normalize(item))
      .join(' ')

    return searchable.includes(normalized)
  })

  return clampScore(matches.length * 10, 12)
}

export function buildSemanticGovernanceRuntime(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): SemanticGovernanceSignal[] {
  const adaptive = buildAdaptiveEcosystemPriorities(
    records,
    ecosystemClusters,
  )

  const momentum = buildSemanticMomentum(
    records,
    ecosystemClusters,
  )

  const bridges = buildSemanticEcosystemBridges(
    records,
    ecosystemClusters,
  )

  const stability = buildEcosystemStability(
    records,
    ecosystemClusters,
  )

  return adaptive
    .map((priority) => {
      const semanticCoverage = ecosystemCoverage(
        priority.ecosystem,
        safeArray(records),
      )

      const momentumRecord = momentum.find(
        (entry: any) => entry?.ecosystem === priority.ecosystem,
      )

      const stabilityRecord = stability.find(
        (entry: any) => entry?.ecosystem === priority.ecosystem,
      )

      const bridgeSignals = bridges.filter(
        (entry: any) =>
          entry?.source === priority.ecosystem ||
          entry?.target === priority.ecosystem ||
          entry?.ecosystem === priority.ecosystem,
      )

      const bridgeScore = clampScore(
        bridgeSignals.reduce(
          (sum: number, entry: any) =>
            sum + Number(entry?.bridgeScore || 0),
          0,
        ) / Math.max(bridgeSignals.length, 1),
        12,
      )

      const continuity = clampScore(
        Number(priority.ecosystemScore || 0) * 0.45 +
          Number(momentumRecord?.continuityStrength || 0) * 0.55,
        20,
      )

      const resilienceGovernance = clampScore(
        Number(stabilityRecord?.stabilityScore || 0) * 0.72 +
          bridgeScore * 0.28,
        18,
      )

      const discoveryScore = clampScore(
        Number(priority.ecosystemScore || 0) * 0.5 +
          Number(momentumRecord?.momentumScore || 0) * 0.3 +
          bridgeScore * 0.2,
        18,
      )

      const governanceScore = clampScore(
        continuity * 0.34 +
          resilienceGovernance * 0.33 +
          semanticCoverage * 0.14 +
          discoveryScore * 0.19,
      )

      return {
        ecosystem: priority.ecosystem,
        governanceScore,
        governanceTier: governanceTier(governanceScore),
        discoveryScore,
        continuityGovernance: continuity,
        resilienceGovernance,
        semanticCoverage,
      }
    })
    .sort((a, b) => {
      if (b.governanceScore !== a.governanceScore) {
        return b.governanceScore - a.governanceScore
      }

      return a.ecosystem.localeCompare(b.ecosystem)
    })
}

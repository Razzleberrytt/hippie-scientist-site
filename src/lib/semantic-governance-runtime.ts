import { topicClusters } from '@/lib/ecosystem-context'
import {
  buildSemanticDiscoverySignals,
  type SemanticDiscoverySignal,
} from '@/src/lib/semantic-discovery-orchestrator'
import {
  clampScore,
  safeArray,
  safeText,
} from '@/lib/runtime-render-guards'

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

function continuityGovernance(signal: SemanticDiscoverySignal) {
  return clampScore(
    signal.discoveryScore * 0.55 + signal.stabilityScore * 0.45,
    20,
  )
}

export function buildSemanticGovernanceRuntime(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): SemanticGovernanceSignal[] {
  const discovery = buildSemanticDiscoverySignals(
    records,
    ecosystemClusters,
  )

  return discovery
    .map((signal) => {
      const semanticCoverage = ecosystemCoverage(
        signal.ecosystem,
        safeArray(records),
      )

      const continuity = continuityGovernance(signal)

      const resilienceGovernance = clampScore(
        signal.stabilityScore * 0.72 + signal.bridgeScore * 0.28,
        18,
      )

      const governanceScore = clampScore(
        continuity * 0.34 +
          resilienceGovernance * 0.33 +
          semanticCoverage * 0.14 +
          signal.discoveryScore * 0.19,
      )

      return {
        ecosystem: signal.ecosystem,
        governanceScore,
        governanceTier: governanceTier(governanceScore),
        discoveryScore: signal.discoveryScore,
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

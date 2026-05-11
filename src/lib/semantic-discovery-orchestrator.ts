import { topicClusters } from '@/lib/ecosystem-context'
import { buildAdaptiveEcosystemPriorities } from '@/src/lib/adaptive-ecosystem-prioritization'
import { buildSemanticMomentum } from '@/src/lib/semantic-momentum-engine'
import { buildSemanticEcosystemBridges } from '@/src/lib/semantic-ecosystem-bridges'
import { buildEcosystemStability } from '@/src/lib/ecosystem-stability-engine'
import { buildSemanticGovernanceRuntime } from '@/src/lib/semantic-governance-runtime'
import { clampScore, safeArray, safeText } from '@/lib/runtime-render-guards'

export type SemanticDiscoverySignal = {
  ecosystem: string
  discoveryScore: number
  adaptiveScore: number
  momentumScore: number
  bridgeScore: number
  stabilityScore: number
  governanceScore: number
  discoveryTier:
    | 'anchor'
    | 'strong'
    | 'supporting'
    | 'quiet'
}

function normalize(value: unknown) {
  return safeText(value).toLowerCase()
}

function tier(score: number): SemanticDiscoverySignal['discoveryTier'] {
  if (score >= 82) {
    return 'anchor'
  }

  if (score >= 64) {
    return 'strong'
  }

  if (score >= 44) {
    return 'supporting'
  }

  return 'quiet'
}

function strongestBridgeScore(
  ecosystem: string,
  bridges: ReturnType<typeof buildSemanticEcosystemBridges>,
) {
  const normalized = normalize(ecosystem)

  const bridge = bridges.find(
    (item) =>
      normalize(item.source) === normalized ||
      normalize(item.target) === normalized,
  )

  return bridge?.bridgeScore || 0
}

export function buildSemanticDiscoverySignals(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): SemanticDiscoverySignal[] {
  const adaptive = buildAdaptiveEcosystemPriorities(records, ecosystemClusters)
  const momentum = buildSemanticMomentum(records, ecosystemClusters)
  const bridges = buildSemanticEcosystemBridges(records, ecosystemClusters)
  const stability = buildEcosystemStability(records, ecosystemClusters)
  const governance = buildSemanticGovernanceRuntime(records, ecosystemClusters)

  return adaptive
    .map((priority) => {
      const ecosystem = priority.ecosystem

      const momentumSignal = momentum.find(
        (signal) => normalize(signal.ecosystem) === normalize(ecosystem),
      )

      const stabilitySignal = stability.find(
        (signal) => normalize(signal.ecosystem) === normalize(ecosystem),
      )

      const governanceSignal = governance.find(
        (signal) => normalize(signal.ecosystem) === normalize(ecosystem),
      )

      const adaptiveScore = priority.ecosystemScore || 0
      const momentumScore = momentumSignal?.momentumScore || 0
      const bridgeScore = strongestBridgeScore(ecosystem, bridges)
      const stabilityScore = stabilitySignal?.stabilityScore || 0
      const governanceScore = governanceSignal?.governanceScore || 0

      const discoveryScore = clampScore(
        Math.round(
          adaptiveScore * 0.2 +
            momentumScore * 0.22 +
            bridgeScore * 0.16 +
            stabilityScore * 0.2 +
            governanceScore * 0.22,
        ),
      )

      return {
        ecosystem,
        discoveryScore,
        adaptiveScore,
        momentumScore,
        bridgeScore,
        stabilityScore,
        governanceScore,
        discoveryTier: tier(discoveryScore),
      }
    })
    .sort((a, b) => {
      if (b.discoveryScore !== a.discoveryScore) {
        return b.discoveryScore - a.discoveryScore
      }

      if (b.governanceScore !== a.governanceScore) {
        return b.governanceScore - a.governanceScore
      }

      return a.ecosystem.localeCompare(b.ecosystem)
    })
}

export function buildPrioritizedEcosystemSignals(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
  limit = 10,
): string[] {
  const signals = buildSemanticDiscoverySignals(records, ecosystemClusters)
    .filter((signal) => signal.discoveryTier !== 'quiet')
    .map((signal) => normalize(signal.ecosystem))

  return safeArray(signals).slice(0, limit)
}

export function sortGraphLinksBySemanticDiscovery<
  T extends { label: string },
>(
  links: T[],
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): T[] {
  const discovery = buildSemanticDiscoverySignals(
    records,
    ecosystemClusters,
  )

  return [...links].sort((a, b) => {
    const aSignal = discovery.find(
      (signal) => normalize(signal.ecosystem) === normalize(a.label),
    )

    const bSignal = discovery.find(
      (signal) => normalize(signal.ecosystem) === normalize(b.label),
    )

    const aScore = aSignal?.discoveryScore || 0
    const bScore = bSignal?.discoveryScore || 0

    if (bScore !== aScore) {
      return bScore - aScore
    }

    return a.label.localeCompare(b.label)
  })
}

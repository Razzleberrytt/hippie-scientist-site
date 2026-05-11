import { topicClusters } from '@/lib/ecosystem-context'
import { buildSemanticMomentum } from '@/src/lib/semantic-momentum-engine'
import {
  clampScore,
  safeArray,
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

export type SemanticEcosystemBridge = {
  source: string
  target: string
  bridgeScore: number
  sharedSignals: string[]
  bridgeTier:
    | 'core'
    | 'reinforced'
    | 'adjacent'
    | 'weak'
}

type Cluster = {
  label: string
  keywords: string[]
  systems: string[]
}

function normalize(value: unknown) {
  return safeText(value).toLowerCase()
}

function normalizeList(value: unknown) {
  return safeArray(value)
    .map((item) => normalize(item))
    .filter(Boolean)
}

function normalizeClusters(clusters: unknown): Cluster[] {
  return safeArray(clusters)
    .map((cluster) => {
      const record = safeObject(cluster)

      return {
        label: safeText(record.label || record.slug),
        keywords: normalizeList(record.keywords),
        systems: normalizeList(record.systems),
      }
    })
    .filter((cluster) => cluster.label.length > 0)
}

function overlap(a: string[], b: string[]) {
  const aSet = new Set(a)

  return b.filter((item) => aSet.has(item))
}

function tier(score: number): SemanticEcosystemBridge['bridgeTier'] {
  if (score >= 78) {
    return 'core'
  }

  if (score >= 60) {
    return 'reinforced'
  }

  if (score >= 40) {
    return 'adjacent'
  }

  return 'weak'
}

export function buildSemanticEcosystemBridges(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): SemanticEcosystemBridge[] {
  const clusters = normalizeClusters(ecosystemClusters)
  const momentum = buildSemanticMomentum(records, ecosystemClusters)

  const bridges: SemanticEcosystemBridge[] = []

  for (let index = 0; index < clusters.length; index += 1) {
    const source = clusters[index]

    for (let inner = index + 1; inner < clusters.length; inner += 1) {
      const target = clusters[inner]

      const sharedSignals = overlap(
        [...source.keywords, ...source.systems],
        [...target.keywords, ...target.systems],
      )

      const sourceMomentum = momentum.find(
        (signal) => normalize(signal.ecosystem) === normalize(source.label),
      )

      const targetMomentum = momentum.find(
        (signal) => normalize(signal.ecosystem) === normalize(target.label),
      )

      const momentumStrength = (
        (sourceMomentum?.momentumScore || 0) +
        (targetMomentum?.momentumScore || 0)
      ) / 2

      const bridgeScore = clampScore(
        sharedSignals.length * 18 + momentumStrength * 0.55,
        22,
      )

      bridges.push({
        source: source.label,
        target: target.label,
        bridgeScore,
        sharedSignals: sharedSignals.slice(0, 6),
        bridgeTier: tier(bridgeScore),
      })
    }
  }

  return bridges.sort((a, b) => {
    if (b.bridgeScore !== a.bridgeScore) {
      return b.bridgeScore - a.bridgeScore
    }

    return `${a.source}-${a.target}`.localeCompare(
      `${b.source}-${b.target}`,
    )
  })
}

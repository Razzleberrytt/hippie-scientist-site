import { topicClusters } from '@/lib/ecosystem-context'
import { buildAdaptiveEcosystemPriorities } from '@/src/lib/adaptive-ecosystem-prioritization'
import { buildAuthorityHierarchy } from '@/lib/runtime-authority-hierarchy'
import { buildEvidenceConfidence } from '@/lib/runtime-evidence-confidence'
import { buildRuntimeGovernance } from '@/lib/runtime-governance'
import {
  clampScore,
  safeArray,
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

export type SemanticMomentumSignal = {
  ecosystem: string
  momentumScore: number
  continuityStrength: number
  bridgeStrength: number
  authorityReinforcement: number
  evidenceReinforcement: number
  momentumTier:
    | 'dominant'
    | 'stable'
    | 'emerging'
    | 'weak'
}

type MomentumCluster = {
  label: string
  slug: string
  keywords: string[]
  systems: string[]
  index: number
}

type RecordMatch = {
  record: Record<string, any>
  searchText: string
  matchScore: number
}

type MomentumAccumulator = SemanticMomentumSignal & {
  recurrenceDensity: number
  adjacencyScore: number
  adaptiveScore: number
  index: number
}

function normalizeToken(value: unknown) {
  return safeText(value).toLowerCase()
}

function normalizeList(value: unknown) {
  return safeArray(value)
    .map((item) => normalizeToken(item))
    .filter(Boolean)
}

function normalizeClusters(clusters: unknown): MomentumCluster[] {
  return safeArray(clusters)
    .map((cluster, index) => {
      const record = safeObject(cluster)
      const label = safeText(record.label || record.title || record.slug)
      const slug = safeText(
        record.slug,
        label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      )
      const keywords = normalizeList(record.keywords)
      const systems = normalizeList(record.systems)

      return {
        label: label || slug || `Ecosystem ${index + 1}`,
        slug: slug || `ecosystem-${index}`,
        keywords: keywords.length ? keywords : normalizeList([label, slug]),
        systems,
        index,
      }
    })
    .filter((cluster) => safeText(cluster.label).length > 0)
}

function textFromField(value: unknown): string[] {
  const values = safeArray(value).length ? safeArray(value) : [value]

  return values
    .map((item) => safeText(item))
    .filter(Boolean)
}

function recordSearchText(source: unknown) {
  const record = safeObject(source)
  const fields = [
    record.name,
    record.slug,
    record.summary,
    record.description,
    record.best_for,
    record.avoid_if,
    record.primary_effect,
    record.primary_effects,
    record.effects,
    record.pathways,
    record.mechanisms,
    record.mechanism_of_action,
    record.topic_clusters,
    record.topics,
    record.ecosystems,
    record.authority_supernodes,
    record.semantic_supernodes,
    record.supernodes,
    record.compare_groups,
    record.relationships,
    record.related_compounds,
    record.related_herbs,
  ]

  return fields
    .flatMap(textFromField)
    .join(' ')
    .toLowerCase()
}

function clusterTokens(cluster: MomentumCluster) {
  return [
    normalizeToken(cluster.label),
    normalizeToken(cluster.slug).replace(/-/g, ' '),
    ...cluster.keywords,
    ...cluster.systems,
  ].filter(Boolean)
}

function matchScore(cluster: MomentumCluster, searchText: string) {
  if (!searchText) {
    return 0
  }

  const tokens = clusterTokens(cluster)
  const hits = tokens.filter((token) => searchText.includes(token)).length
  const labelHit = normalizeToken(cluster.label) && searchText.includes(normalizeToken(cluster.label)) ? 1 : 0

  return clampScore(hits * 14 + labelHit * 24)
}

function matchedRecords(records: Record<string, any>[], cluster: MomentumCluster): RecordMatch[] {
  return records
    .map((record) => {
      const searchText = recordSearchText(record)

      return {
        record,
        searchText,
        matchScore: matchScore(cluster, searchText),
      }
    })
    .filter((match) => match.matchScore > 0)
}

function average(values: number[], fallback = 0) {
  const safeValues = values.filter((value) => Number.isFinite(value))

  if (!safeValues.length) {
    return fallback
  }

  return safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length
}

function overlapScore(a: MomentumCluster, b: MomentumCluster) {
  const aTokens = new Set(clusterTokens(a))
  const bTokens = clusterTokens(b)
  const overlap = bTokens.filter((token) => aTokens.has(token)).length
  const denominator = Math.max(Math.min(aTokens.size, bTokens.length), 1)

  return clampScore((overlap / denominator) * 100)
}

function inferredAdjacencyScore(
  cluster: MomentumCluster,
  clusters: MomentumCluster[],
  matches: RecordMatch[],
) {
  const directOverlap = average(
    clusters
      .filter((candidate) => candidate.label !== cluster.label)
      .map((candidate) => overlapScore(cluster, candidate)),
    0,
  )

  const bridgeMatches = average(
    matches.map((match) => {
      const additionalClusters = clusters.filter((candidate) => {
        if (candidate.label === cluster.label) {
          return false
        }

        return matchScore(candidate, match.searchText) > 0
      }).length

      return clampScore(additionalClusters * 18)
    }),
    0,
  )

  return clampScore(directOverlap * 0.35 + bridgeMatches * 0.65, 20)
}

function continuityStrength(matches: RecordMatch[]) {
  return clampScore(
    average(
      matches.map((match) => {
        const record = match.record
        const pathways = safeArray(record.pathways).length
        const mechanisms = safeArray(record.mechanisms || record.mechanism_of_action).length
        const relationships = safeArray(record.relationships).length
        const related = safeArray(record.related_compounds || record.related_herbs).length

        return clampScore(
          match.matchScore * 0.4 +
            Math.min(pathways, 6) * 7 +
            Math.min(mechanisms, 6) * 6 +
            Math.min(relationships, 8) * 4 +
            Math.min(related, 8) * 3,
          28,
        )
      }),
      28,
    ),
    28,
  )
}

function tierFor(score: number): SemanticMomentumSignal['momentumTier'] {
  if (score >= 80) {
    return 'dominant'
  }

  if (score >= 62) {
    return 'stable'
  }

  if (score >= 44) {
    return 'emerging'
  }

  return 'weak'
}

function buildMomentumAccumulator(
  cluster: MomentumCluster,
  clusters: MomentumCluster[],
  records: Record<string, any>[],
  adaptiveScore: number,
): MomentumAccumulator {
  const matches = matchedRecords(records, cluster)
  const relevant = matches.length ? matches : records.slice(0, 3).map((record) => ({
    record,
    searchText: recordSearchText(record),
    matchScore: 0,
  }))

  const recurrenceDensity = clampScore((matches.length / Math.max(records.length, 1)) * 100, 18)
  const bridgeStrength = inferredAdjacencyScore(cluster, clusters, matches)
  const continuity = continuityStrength(relevant)
  const authorityReinforcement = clampScore(
    average(relevant.map((match) => buildAuthorityHierarchy(match.record).authorityScore), 46),
    46,
  )
  const evidenceReinforcement = clampScore(
    average(relevant.map((match) => buildEvidenceConfidence(match.record).confidenceScore), 42),
    42,
  )
  const governanceFreshness = clampScore(
    average(relevant.map((match) => buildRuntimeGovernance(match.record).freshnessScore), 62),
    62,
  )

  const momentumScore = clampScore(Math.round(
    recurrenceDensity * 0.16 +
      continuity * 0.24 +
      bridgeStrength * 0.2 +
      authorityReinforcement * 0.16 +
      evidenceReinforcement * 0.16 +
      governanceFreshness * 0.08 +
      adaptiveScore * 0.12,
  ))

  return {
    ecosystem: cluster.label,
    momentumScore,
    continuityStrength: continuity,
    bridgeStrength,
    authorityReinforcement,
    evidenceReinforcement,
    momentumTier: tierFor(momentumScore),
    recurrenceDensity,
    adjacencyScore: bridgeStrength,
    adaptiveScore,
    index: cluster.index,
  }
}

export function buildSemanticMomentum(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): SemanticMomentumSignal[] {
  const safeRecords = safeArray(records).map((record) => safeObject(record))
  const clusters = normalizeClusters(ecosystemClusters)
  const adaptivePriorities = buildAdaptiveEcosystemPriorities(safeRecords, ecosystemClusters)

  return clusters
    .map((cluster) => {
      const adaptive = adaptivePriorities.find((priority) =>
        normalizeToken(priority.ecosystem) === normalizeToken(cluster.label),
      )

      return buildMomentumAccumulator(
        cluster,
        clusters,
        safeRecords,
        adaptive?.ecosystemScore || 0,
      )
    })
    .sort((a, b) => {
      if (b.momentumScore !== a.momentumScore) {
        return b.momentumScore - a.momentumScore
      }

      if (b.continuityStrength !== a.continuityStrength) {
        return b.continuityStrength - a.continuityStrength
      }

      if (b.bridgeStrength !== a.bridgeStrength) {
        return b.bridgeStrength - a.bridgeStrength
      }

      return a.index - b.index
    })
    .map(({ recurrenceDensity: _recurrenceDensity, adjacencyScore: _adjacencyScore, adaptiveScore: _adaptiveScore, index: _index, ...signal }) => signal)
}

import { topicClusters } from '@/lib/ecosystem-context'
import { buildAuthorityHierarchy } from '@/lib/runtime-authority-hierarchy'
import { buildEvidenceConfidence } from '@/lib/runtime-evidence-confidence'
import { buildRuntimeGovernance } from '@/lib/runtime-governance'
import {
  clampScore,
  safeArray,
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

export type AdaptiveEcosystemPriority = {
  ecosystem: string
  ecosystemScore: number
  authorityWeight: number
  evidenceWeight: number
  freshnessWeight: number
  continuityWeight: number
  priorityTier:
    | 'primary'
    | 'secondary'
    | 'emerging'
    | 'suppressed'
}

type EcosystemCluster = {
  slug: string
  label: string
  keywords: string[]
}

type EcosystemAccumulator = {
  ecosystem: string
  ecosystemScore: number
  authorityWeight: number
  evidenceWeight: number
  freshnessWeight: number
  continuityWeight: number
  densityWeight: number
  priorityTier: AdaptiveEcosystemPriority['priorityTier']
  index: number
}

function normalizeToken(value: unknown) {
  return safeText(value).toLowerCase()
}

function normalizeKeywords(value: unknown) {
  return safeArray(value)
    .map((item) => normalizeToken(item))
    .filter(Boolean)
}

function normalizeEcosystemClusters(clusters: unknown): EcosystemCluster[] {
  return safeArray(clusters)
    .map((cluster, index) => {
      const record = safeObject(cluster)
      const label = safeText(record.label || record.title || record.slug)
      const slug = safeText(record.slug, label.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      const keywords = normalizeKeywords(record.keywords)

      return {
        slug: slug || `ecosystem-${index}`,
        label: label || slug || `Ecosystem ${index + 1}`,
        keywords: keywords.length ? keywords : normalizeKeywords([label, slug]),
      }
    })
    .filter((cluster) => safeText(cluster.label).length > 0)
}

function recordSearchText(source: unknown) {
  const record = safeObject(source)
  const fields = [
    record.name,
    record.slug,
    record.summary,
    record.description,
    record.best_for,
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
  ]

  return fields
    .flatMap((field) => safeArray(field).length ? safeArray(field) : [field])
    .map((field) => safeText(field))
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function clusterMatchScore(cluster: EcosystemCluster, searchText: string) {
  if (!searchText) {
    return 0
  }

  const label = normalizeToken(cluster.label)
  const slug = normalizeToken(cluster.slug).replace(/-/g, ' ')
  const keywords = normalizeKeywords(cluster.keywords)
  const keywordHits = keywords.filter((keyword) => searchText.includes(keyword)).length
  const labelHit = label && searchText.includes(label) ? 1 : 0
  const slugHit = slug && searchText.includes(slug) ? 1 : 0

  return clampScore(keywordHits * 18 + labelHit * 28 + slugHit * 20)
}

function semanticContinuityScore(record: unknown, cluster: EcosystemCluster, searchText: string) {
  const source = safeObject(record)
  const pathways = safeArray(source.pathways).length
  const mechanisms = safeArray(source.mechanisms || source.mechanism_of_action).length
  const relationships = safeArray(source.relationships).length
  const related = safeArray(source.related_compounds || source.related_herbs).length
  const matchScore = clusterMatchScore(cluster, searchText)

  return clampScore(
    matchScore * 0.45 +
      Math.min(pathways, 5) * 8 +
      Math.min(mechanisms, 5) * 7 +
      Math.min(relationships, 8) * 4 +
      Math.min(related, 6) * 3,
    34,
  )
}

function scoreTier(score: number): AdaptiveEcosystemPriority['priorityTier'] {
  if (score >= 78) {
    return 'primary'
  }

  if (score >= 60) {
    return 'secondary'
  }

  if (score >= 42) {
    return 'emerging'
  }

  return 'suppressed'
}

function average(values: number[], fallback = 0) {
  const safeValues = values.filter((value) => Number.isFinite(value))

  if (!safeValues.length) {
    return fallback
  }

  return safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length
}

function buildAccumulator(
  cluster: EcosystemCluster,
  records: unknown[],
  index: number,
): EcosystemAccumulator {
  const matched = records
    .map((record) => {
      const searchText = recordSearchText(record)
      const matchScore = clusterMatchScore(cluster, searchText)

      return {
        record,
        searchText,
        matchScore,
      }
    })
    .filter((match) => match.matchScore > 0)

  const relevant = matched.length ? matched : records.slice(0, 3).map((record) => ({
    record,
    searchText: recordSearchText(record),
    matchScore: 0,
  }))

  const densityWeight = clampScore((matched.length / Math.max(records.length, 1)) * 100, 28)
  const authorityWeight = clampScore(
    average(relevant.map((match) => buildAuthorityHierarchy(match.record).authorityScore), 48),
    48,
  )
  const evidenceWeight = clampScore(
    average(relevant.map((match) => buildEvidenceConfidence(match.record).confidenceScore), 42),
    42,
  )
  const freshnessWeight = clampScore(
    average(relevant.map((match) => buildRuntimeGovernance(match.record).freshnessScore), 62),
    62,
  )
  const continuityWeight = clampScore(
    average(
      relevant.map((match) =>
        semanticContinuityScore(match.record, cluster, match.searchText),
      ),
      34,
    ),
    34,
  )

  const ecosystemScore = clampScore(Math.round(
    densityWeight * 0.18 +
      authorityWeight * 0.24 +
      evidenceWeight * 0.24 +
      freshnessWeight * 0.12 +
      continuityWeight * 0.22,
  ))

  return {
    ecosystem: cluster.label,
    ecosystemScore,
    authorityWeight,
    evidenceWeight,
    freshnessWeight,
    continuityWeight,
    densityWeight,
    priorityTier: scoreTier(ecosystemScore),
    index,
  }
}

export function buildAdaptiveEcosystemPriorities(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): AdaptiveEcosystemPriority[] {
  const safeRecords = safeArray(records).map((record) => safeObject(record))
  const clusters = normalizeEcosystemClusters(ecosystemClusters)

  return clusters
    .map((cluster, index) => buildAccumulator(cluster, safeRecords, index))
    .sort((a, b) => {
      if (b.ecosystemScore !== a.ecosystemScore) {
        return b.ecosystemScore - a.ecosystemScore
      }

      if (b.continuityWeight !== a.continuityWeight) {
        return b.continuityWeight - a.continuityWeight
      }

      if (b.authorityWeight !== a.authorityWeight) {
        return b.authorityWeight - a.authorityWeight
      }

      return a.index - b.index
    })
    .map(({ densityWeight: _densityWeight, index: _index, ...priority }) => priority)
}

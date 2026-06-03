import { buildAuthoritySupernodes } from './authority-supernodes'
import { buildMultiHopTraversal } from './multi-hop-traversal'
import { buildRuntimeRecommendations } from './runtime-recommendation-adapter'

export type SemanticAnalyticsReport = {
  runtimeAnalytics: {
    totalNodes: number
    authorityNodes: number
    continuityNodes: number
  }
  traversalAnalytics: {
    primaryHops: number
    continuityHops: number
    bridgeHops: number
  }
  recommendationAnalytics: {
    primaryRecommendations: number
    secondaryRecommendations: number
    supportingRecommendations: number
  }
  continuityRetention: {
    highContinuityNodes: number
    moderateContinuityNodes: number
  }
  authorityHeatmap: {
    foundational: number
    canonical: number
    emerging: number
  }
  ecosystemEngagement: Record<string, number>
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
}

export function buildSemanticAnalyticsReport(
  source: any,
  records: any[],
): SemanticAnalyticsReport {
  const supernodes = buildAuthoritySupernodes(records)
  const traversals = buildMultiHopTraversal(source, records)
  const recommendations = buildRuntimeRecommendations(source, records)

  const ecosystemEngagement: Record<string, number> = {}

  let authorityNodes = 0
  let continuityNodes = 0

  for (const record of records) {
    const ecosystems = normalizeList(record?.ecosystem_taxonomy)

    if (ecosystems.length >= 2) {
      continuityNodes += 1
    }

    for (const ecosystem of ecosystems) {
      const normalized = normalizeText(ecosystem)

      ecosystemEngagement[normalized] =
        (ecosystemEngagement[normalized] || 0) + 1
    }
  }

  for (const node of supernodes) {
    if (
      node.authorityTier === 'foundational' ||
      node.authorityTier === 'canonical'
    ) {
      authorityNodes += 1
    }
  }

  return {
    runtimeAnalytics: {
      totalNodes: records.length,
      authorityNodes,
      continuityNodes,
    },
    traversalAnalytics: {
      primaryHops: traversals.filter(
        (item) => item.traversalRole === 'primary-hop',
      ).length,
      continuityHops: traversals.filter(
        (item) => item.traversalRole === 'continuity-hop',
      ).length,
      bridgeHops: traversals.filter(
        (item) => item.traversalRole === 'bridge-hop',
      ).length,
    },
    recommendationAnalytics: {
      primaryRecommendations: recommendations.filter(
        (item) => item.retrievalTier === 'primary',
      ).length,
      secondaryRecommendations: recommendations.filter(
        (item) => item.retrievalTier === 'secondary',
      ).length,
      supportingRecommendations: recommendations.filter(
        (item) => item.retrievalTier === 'supporting',
      ).length,
    },
    continuityRetention: {
      highContinuityNodes: records.filter(
        (record) => normalizeList(record?.ecosystem_taxonomy).length >= 3,
      ).length,
      moderateContinuityNodes: records.filter(
        (record) => normalizeList(record?.ecosystem_taxonomy).length === 2,
      ).length,
    },
    authorityHeatmap: {
      foundational: supernodes.filter(
        (item) => item.authorityTier === 'foundational',
      ).length,
      canonical: supernodes.filter(
        (item) => item.authorityTier === 'canonical',
      ).length,
      emerging: supernodes.filter(
        (item) => item.authorityTier === 'emerging',
      ).length,
    },
    ecosystemEngagement,
  }
}

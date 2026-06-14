import { buildComparisonRecommendations } from './buildComparisonRecommendations'
import { buildProfileRecommendations } from './buildProfileRecommendations'
import { buildProtocolRecommendations } from './buildProtocolRecommendations'
import { buildTopicContinuity } from './buildTopicContinuity'
import { mergeSemanticDiscovery } from './mergeSemanticDiscovery'
import { getMemoizedSemanticValue } from './memoizedSemanticRuntime'

type RuntimeRecord = Record<string, unknown>

type UnifiedSemanticDiscoveryInput = {
  current: RuntimeRecord
  herbs?: RuntimeRecord[]
  compounds?: RuntimeRecord[]
}

function entityRoute(record: RuntimeRecord) {
  if (record?.entityType === 'compound') {
    return '/compounds'
  }

  return '/herbs'
}

export function buildUnifiedSemanticDiscovery({
  current,
  herbs = [],
  compounds = [],
}: UnifiedSemanticDiscoveryInput) {
  const cacheKey = `unified-semantic:${current?.entityType || 'profile'}:${current?.slug || 'unknown'}`

  return getMemoizedSemanticValue({
    key: cacheKey,
    compute: () => {
      const sameTypeCandidates = current?.entityType === 'compound'
        ? compounds
        : herbs

      const adjacentCandidates = current?.entityType === 'compound'
        ? herbs
        : compounds

      const profileRecommendations = buildProfileRecommendations({
        current,
        candidates: sameTypeCandidates,
        basePath: entityRoute(current),
        limit: 6,
      })

      const adjacentProfileRecommendations = buildProfileRecommendations({
        current,
        candidates: adjacentCandidates,
        basePath: current?.entityType === 'compound' ? '/herbs' : '/compounds',
        limit: 6,
      })

      const protocolRecommendations = buildProtocolRecommendations(current).map((item) => ({
        ...item,
        score: 1,
        rationale: item.summary,
        overlap: item.tags || [],
      }))

      const comparisonRecommendations = buildComparisonRecommendations(current).map((item) => ({
        ...item,
        score: 1,
      }))

      const topicContinuity = buildTopicContinuity(current).map((item) => ({
        href: item.href,
        title: item.label,
        score: 1,
        rationale: 'Related topic continuity generated from semantic profile metadata.',
        overlap: [item.label],
      }))

      return {
        profileRecommendations,
        adjacentProfileRecommendations,
        protocolRecommendations,
        comparisonRecommendations,
        topicContinuity,
        unified: mergeSemanticDiscovery(
          profileRecommendations,
          adjacentProfileRecommendations,
          protocolRecommendations,
          comparisonRecommendations,
          topicContinuity,
        ),
      }
    },
  })
}

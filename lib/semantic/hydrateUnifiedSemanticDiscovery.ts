import { buildUnifiedSemanticDiscovery } from './buildUnifiedSemanticDiscovery'
import { buildSemanticEntityMetadata } from './buildSemanticEntityMetadata'

type RuntimeRecord = Record<string, any>

export function hydrateUnifiedSemanticDiscovery({
  current,
  herbs = [],
  compounds = [],
}: {
  current: RuntimeRecord
  herbs?: RuntimeRecord[]
  compounds?: RuntimeRecord[]
}) {
  const semanticMetadata = buildSemanticEntityMetadata(current)

  const discovery = buildUnifiedSemanticDiscovery({
    current,
    herbs,
    compounds,
  })

  return {
    semanticMetadata,

    semanticDiscovery: discovery.unified,

    profileRecommendations: discovery.profileRecommendations,

    adjacentProfileRecommendations:
      discovery.adjacentProfileRecommendations,

    protocolRecommendations:
      discovery.protocolRecommendations,

    comparisonRecommendations:
      discovery.comparisonRecommendations,

    topicContinuity:
      discovery.topicContinuity,
  }
}

import { hydrateUnifiedSemanticDiscovery } from './hydrateUnifiedSemanticDiscovery'

type RuntimeRecord = Record<string, unknown>

export function createProfileSemanticPayload({
  current,
  herbs = [],
  compounds = [],
}: {
  current: RuntimeRecord
  herbs?: RuntimeRecord[]
  compounds?: RuntimeRecord[]
}) {
  const hydrated = hydrateUnifiedSemanticDiscovery({
    current,
    herbs,
    compounds,
  })

  return {
    semanticMetadata: hydrated.semanticMetadata,

    semanticDiscovery: hydrated.semanticDiscovery,

    protocolRecommendations:
      hydrated.protocolRecommendations,

    comparisonRecommendations:
      hydrated.comparisonRecommendations,

    topicContinuity:
      hydrated.topicContinuity,

    semanticPanels: {
      hasSemanticDiscovery:
        hydrated.semanticDiscovery.length > 0,

      hasProtocolRecommendations:
        hydrated.protocolRecommendations.length > 0,

      hasComparisonRecommendations:
        hydrated.comparisonRecommendations.length > 0,

      hasTopicContinuity:
        hydrated.topicContinuity.length > 0,
    },
  }
}

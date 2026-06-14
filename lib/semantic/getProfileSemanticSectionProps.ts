import { createProfileSemanticPayload } from './createProfileSemanticPayload'

type RuntimeRecord = Record<string, unknown>

export function getProfileSemanticSectionProps({
  current,
  herbs = [],
  compounds = [],
}: {
  current: RuntimeRecord
  herbs?: RuntimeRecord[]
  compounds?: RuntimeRecord[]
}) {
  const payload = createProfileSemanticPayload({
    current,
    herbs,
    compounds,
  })

  return {
    semanticMetadata: payload.semanticMetadata,

    semanticDiscovery: payload.semanticDiscovery,

    protocolRecommendations:
      payload.protocolRecommendations,

    comparisonRecommendations:
      payload.comparisonRecommendations,

    topicContinuity:
      payload.topicContinuity,

    semanticPanels:
      payload.semanticPanels,
  }
}

import ProfileSemanticDiscoverySection from '@/components/authority/ProfileSemanticDiscoverySection'
import { getProfileSemanticSectionProps } from '@/lib/semantic/getProfileSemanticSectionProps'

type RuntimeRecord = Record<string, any>

export default function RenderProfileSemanticDiscovery({
  current,
  herbs = [],
  compounds = [],
}: {
  current: RuntimeRecord
  herbs?: RuntimeRecord[]
  compounds?: RuntimeRecord[]
}) {
  const semanticProps = getProfileSemanticSectionProps({
    current,
    herbs,
    compounds,
  })

  const hasSemanticContent =
    semanticProps.semanticPanels.hasSemanticDiscovery ||
    semanticProps.semanticPanels.hasProtocolRecommendations ||
    semanticProps.semanticPanels.hasComparisonRecommendations ||
    semanticProps.semanticPanels.hasTopicContinuity

  if (!hasSemanticContent) {
    return null
  }

  return (
    <ProfileSemanticDiscoverySection
      semanticMetadata={semanticProps.semanticMetadata}
      semanticDiscovery={semanticProps.semanticDiscovery}
      protocolRecommendations={semanticProps.protocolRecommendations}
      comparisonRecommendations={semanticProps.comparisonRecommendations}
      topicContinuity={semanticProps.topicContinuity}
    />
  )
}

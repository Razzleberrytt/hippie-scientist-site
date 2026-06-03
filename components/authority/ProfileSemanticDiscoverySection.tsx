import UnifiedSemanticDiscoveryPanel from '@/components/authority/UnifiedSemanticDiscoveryPanel'
import SemanticEntitySignals from '@/components/authority/SemanticEntitySignals'
import ProtocolRecommendations from '@/components/authority/ProtocolRecommendations'
import ComparisonRecommendations from '@/components/authority/ComparisonRecommendations'
import TopicContinuityLinks from '@/components/authority/TopicContinuityLinks'

export default function ProfileSemanticDiscoverySection({
  semanticMetadata,
  semanticDiscovery = [],
  protocolRecommendations = [],
  comparisonRecommendations = [],
  topicContinuity = [],
}: any) {
  return (
    <div className="space-y-10">
      <SemanticEntitySignals
        effects={semanticMetadata?.semanticEffects || []}
        mechanisms={semanticMetadata?.semanticMechanisms || []}
        pathways={semanticMetadata?.semanticPathways || []}
        ecosystems={semanticMetadata?.semanticEcosystems || []}
      />

      <UnifiedSemanticDiscoveryPanel
        title="Related Semantic Discovery"
        items={semanticDiscovery}
      />

      <ProtocolRecommendations
        items={protocolRecommendations}
      />

      <ComparisonRecommendations
        items={comparisonRecommendations}
      />

      <TopicContinuityLinks
        items={topicContinuity}
      />
    </div>
  )
}

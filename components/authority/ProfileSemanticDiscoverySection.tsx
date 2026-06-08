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
}: {
  semanticMetadata?: Record<string, unknown>
  semanticDiscovery?: unknown[]
  protocolRecommendations?: unknown[]
  comparisonRecommendations?: unknown[]
  topicContinuity?: unknown[]
}) {
  return (
    <div className="space-y-10">
      <SemanticEntitySignals
        effects={(semanticMetadata?.semanticEffects as unknown[] | undefined) || []}
        mechanisms={(semanticMetadata?.semanticMechanisms as unknown[] | undefined) || []}
        pathways={(semanticMetadata?.semanticPathways as unknown[] | undefined) || []}
        ecosystems={(semanticMetadata?.semanticEcosystems as unknown[] | undefined) || []}
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

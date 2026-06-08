import UnifiedSemanticDiscoveryPanel from '@/components/authority/UnifiedSemanticDiscoveryPanel'
import SemanticEntitySignals from '@/components/authority/SemanticEntitySignals'
import ProtocolRecommendations from '@/components/authority/ProtocolRecommendations'
import ComparisonRecommendations from '@/components/authority/ComparisonRecommendations'
import TopicContinuityLinks from '@/components/authority/TopicContinuityLinks'
import { safeArray, safeObject } from '@/lib/search-safe'

type DiscoveryItem = {
  href: string
  title: string
  rationale?: string
  overlap?: string[]
}

type ProtocolRecommendation = {
  href: string
  title: string
  summary?: string
  tags?: string[]
}

type TopicLink = {
  href: string
  label: string
}

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
  const metadata = safeObject(semanticMetadata)
  const discoveryItems: DiscoveryItem[] = safeArray(semanticDiscovery)
    .map((item) => {
      const record = safeObject(item)
      return {
        href: String(record.href || ''),
        title: String(record.title || ''),
        rationale: typeof record.rationale === 'string' ? record.rationale : undefined,
        overlap: safeArray<string>(record.overlap),
      }
    })
    .filter((item) => item.href && item.title)
  const protocolItems: ProtocolRecommendation[] = safeArray(protocolRecommendations)
    .map((item) => {
      const record = safeObject(item)
      return {
        href: String(record.href || ''),
        title: String(record.title || ''),
        summary: typeof record.summary === 'string' ? record.summary : undefined,
        tags: safeArray<string>(record.tags),
      }
    })
    .filter((item) => item.href && item.title)
  const comparisonItems: DiscoveryItem[] = safeArray(comparisonRecommendations)
    .map((item) => {
      const record = safeObject(item)
      return {
        href: String(record.href || ''),
        title: String(record.title || ''),
        rationale: typeof record.rationale === 'string' ? record.rationale : undefined,
        overlap: safeArray<string>(record.overlap),
      }
    })
    .filter((item) => item.href && item.title)
  const topicItems: TopicLink[] = safeArray(topicContinuity)
    .map((item) => {
      const record = safeObject(item)
      return {
        href: String(record.href || ''),
        label: String(record.label || record.title || ''),
      }
    })
    .filter((item) => item.href && item.label)

  return (
    <div className="space-y-10">
      <SemanticEntitySignals
        effects={safeArray<string>(metadata.semanticEffects)}
        mechanisms={safeArray<string>(metadata.semanticMechanisms)}
        pathways={safeArray<string>(metadata.semanticPathways)}
        ecosystems={safeArray<string>(metadata.semanticEcosystems)}
      />

      <UnifiedSemanticDiscoveryPanel
        title="Related Semantic Discovery"
        items={discoveryItems}
      />

      <ProtocolRecommendations
        items={protocolItems}
      />

      <ComparisonRecommendations
        items={comparisonItems}
      />

      <TopicContinuityLinks
        items={topicItems}
      />
    </div>
  )
}

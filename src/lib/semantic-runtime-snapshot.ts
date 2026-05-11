import { topicClusters } from '@/lib/ecosystem-context'
import { getSemanticDiscoveryCache } from '@/src/lib/semantic-discovery-cache'
import { sortGraphLinksBySemanticDiscovery } from '@/src/lib/semantic-discovery-orchestrator'
import { safeArray } from '@/lib/runtime-render-guards'
import {
  SEMANTIC_EXPANSION_LIMITS,
  cappedExpansion,
} from '@/src/lib/semantic-expansion-budget'

export type SemanticRuntimeSnapshot = {
  createdAt: number
  discoverySignals: ReturnType<typeof getSemanticDiscoveryCache>['discoverySignals']
  prioritizedSignals: ReturnType<typeof getSemanticDiscoveryCache>['prioritizedSignals']
  prioritizedGraphLinks: Array<{ label: string; href: string; description?: string }>
}

export function buildSemanticRuntimeSnapshot(
  records: unknown = [],
  graphLinks: Array<{ label: string; href: string; description?: string }> = [],
  ecosystemClusters: unknown = topicClusters,
): SemanticRuntimeSnapshot {
  const boundedRecords = cappedExpansion(
    safeArray(records),
    SEMANTIC_EXPANSION_LIMITS.maxDiscoverySignals,
  )

  const boundedLinks = cappedExpansion(
    safeArray(graphLinks),
    SEMANTIC_EXPANSION_LIMITS.maxBridgeExpansions,
  )

  const cache = getSemanticDiscoveryCache(
    boundedRecords,
    ecosystemClusters,
  )

  return {
    createdAt: Date.now(),
    discoverySignals: cache.discoverySignals,
    prioritizedSignals: cache.prioritizedSignals,
    prioritizedGraphLinks: sortGraphLinksBySemanticDiscovery(
      boundedLinks,
      boundedRecords,
      ecosystemClusters,
    ).slice(0, SEMANTIC_EXPANSION_LIMITS.maxContinuities),
  }
}

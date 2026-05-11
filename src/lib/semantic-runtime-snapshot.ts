import { topicClusters } from '@/lib/ecosystem-context'
import { getSemanticDiscoveryCache } from '@/src/lib/semantic-discovery-cache'
import { sortGraphLinksBySemanticDiscovery } from '@/src/lib/semantic-discovery-orchestrator'
import { safeArray } from '@/lib/runtime-render-guards'

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
  const cache = getSemanticDiscoveryCache(records, ecosystemClusters)

  return {
    createdAt: Date.now(),
    discoverySignals: cache.discoverySignals,
    prioritizedSignals: cache.prioritizedSignals,
    prioritizedGraphLinks: sortGraphLinksBySemanticDiscovery(
      safeArray(graphLinks),
      records,
      ecosystemClusters,
    ),
  }
}

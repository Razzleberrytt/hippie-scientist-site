import { topicClusters } from '@/lib/ecosystem-context'
import {
  buildSemanticDiscoverySignals,
  buildPrioritizedEcosystemSignals,
} from '@/src/lib/semantic-discovery-orchestrator'
import {
  safeArray,
  safeText,
} from '@/lib/runtime-render-guards'

export type SemanticDiscoveryCacheEntry = {
  key: string
  createdAt: number
  discoverySignals: ReturnType<typeof buildSemanticDiscoverySignals>
  prioritizedSignals: ReturnType<typeof buildPrioritizedEcosystemSignals>
}

const runtimeCache = new Map<string, SemanticDiscoveryCacheEntry>()

function normalize(value: unknown) {
  return safeText(value).toLowerCase().trim()
}

function buildCacheKey(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
) {
  const recordSignature = safeArray(records)
    .slice(0, 50)
    .map((record: any) => {
      return [
        normalize(record?.slug),
        normalize(record?.name),
        normalize(record?.summary),
      ].join('|')
    })
    .join('::')

  const clusterSignature = safeArray(ecosystemClusters)
    .slice(0, 50)
    .map((cluster: any) => normalize(cluster?.label || cluster?.slug))
    .join('|')

  return `${recordSignature}__${clusterSignature}`
}

export function getSemanticDiscoveryCache(
  records: unknown = [],
  ecosystemClusters: unknown = topicClusters,
): SemanticDiscoveryCacheEntry {
  const key = buildCacheKey(records, ecosystemClusters)

  const existing = runtimeCache.get(key)

  if (existing) {
    return existing
  }

  const entry: SemanticDiscoveryCacheEntry = {
    key,
    createdAt: Date.now(),
    discoverySignals: buildSemanticDiscoverySignals(
      records,
      ecosystemClusters,
    ),
    prioritizedSignals: buildPrioritizedEcosystemSignals(
      records,
      ecosystemClusters,
      10,
    ),
  }

  runtimeCache.set(key, entry)

  return entry
}

export function clearSemanticDiscoveryCache() {
  runtimeCache.clear()
}

import { buildRuntimeSemanticSnapshot } from './runtime-semantic-orchestrator'

export type RuntimeOrchestrationCacheEntry = {
  slug: string
  generatedAt: string
  snapshot: ReturnType<typeof buildRuntimeSemanticSnapshot>
}

const runtimeSemanticCache = new Map<string, RuntimeOrchestrationCacheEntry>()

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildCachedRuntimeSnapshot(
  source: any,
  candidates: any[],
): RuntimeOrchestrationCacheEntry {
  const slug = normalizeText(source?.slug || 'discovery')

  const existing = runtimeSemanticCache.get(slug)

  if (existing) {
    return existing
  }

  const snapshot = buildRuntimeSemanticSnapshot(source, candidates)

  const entry: RuntimeOrchestrationCacheEntry = {
    slug,
    generatedAt: new Date().toISOString(),
    snapshot,
  }

  runtimeSemanticCache.set(slug, entry)

  return entry
}

export function clearRuntimeSemanticCache() {
  runtimeSemanticCache.clear()
}

export function getRuntimeSemanticCacheSize() {
  return runtimeSemanticCache.size
}

export function exportRuntimeSemanticSnapshots() {
  return Array.from(runtimeSemanticCache.values())
}

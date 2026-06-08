import { buildRetrievalPriorities } from './retrieval-prioritization'
import { buildAuthoritySupernodes } from './authority-supernodes'
import { buildSemanticDebugSnapshot } from './semantic-debug'

export type RuntimeDiscoveryNode = {
  slug: string
  discoveryPriority: number
  retrievalTier: 'primary' | 'secondary' | 'supporting' | 'suppressed'
  authorityTier: 'foundational' | 'canonical' | 'emerging' | 'standard'
  discoveryRole:
    | 'authority-anchor'
    | 'ecosystem-bridge'
    | 'continuity-node'
    | 'supporting-node'
  recommendationReasons: string[]
  debug: ReturnType<typeof buildSemanticDebugSnapshot>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimeDiscovery(
  source: any,
  candidates: any[],
): RuntimeDiscoveryNode[] {
  const retrievals = buildRetrievalPriorities(source, candidates)
  const supernodes = buildAuthoritySupernodes(candidates)

  return candidates
    .map((candidate) => {
      const retrieval = retrievals.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const supernode = supernodes.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const debug = buildSemanticDebugSnapshot(source, candidate)

      let authorityTier: RuntimeDiscoveryNode['authorityTier'] = 'standard'

      if (supernode) {
        authorityTier = supernode.authorityTier
      }

      let discoveryRole: RuntimeDiscoveryNode['discoveryRole'] = 'supporting-node'

      if (authorityTier === 'foundational') {
        discoveryRole = 'authority-anchor'
      } else if (authorityTier === 'canonical') {
        discoveryRole = 'ecosystem-bridge'
      } else if (
        retrieval?.retrievalTier === 'primary'
      ) {
        discoveryRole = 'continuity-node'
      }

      let authorityWeight = 0

      if (authorityTier === 'foundational') {
        authorityWeight = 28
      } else if (authorityTier === 'canonical') {
        authorityWeight = 18
      } else if (authorityTier === 'emerging') {
        authorityWeight = 8
      }

      const discoveryPriority = Math.max(
        0,
        Math.min(
          Math.round(
            (retrieval?.retrievalScore || 40) * 0.65 +
            authorityWeight,
          ),
          100,
        ),
      )

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        discoveryPriority,
        retrievalTier: retrieval?.retrievalTier || 'supporting',
        authorityTier,
        discoveryRole,
        recommendationReasons: debug.reasons.slice(0, 8),
        debug,
      }
    })
    .filter((item) => item.retrievalTier !== 'suppressed')
    .sort((a, b) => b.discoveryPriority - a.discoveryPriority)
}

import { buildAuthoritySupernodes } from './authority-supernodes'
import { buildMultiHopTraversal } from './multi-hop-traversal'
import { buildSemanticDebugSnapshot } from './semantic-debug'

export type RuntimeNavigationNode = {
  slug: string
  navigationPriority: number
  navigationRole:
    | 'supernode-hub'
    | 'pathway-anchor'
    | 'continuity-chain'
    | 'graph-bridge'
  authorityTier: 'foundational' | 'canonical' | 'emerging' | 'standard'
  continuityStrength: number
  graphAnchorEligible: boolean
  recommendationReasons: string[]
  debug: ReturnType<typeof buildSemanticDebugSnapshot>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimeNavigation(
  source: any,
  candidates: any[],
): RuntimeNavigationNode[] {
  const supernodes = buildAuthoritySupernodes(candidates)
  const traversals = buildMultiHopTraversal(source, candidates)

  return candidates
    .map((candidate) => {
      const supernode = supernodes.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const traversal = traversals.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const debug = buildSemanticDebugSnapshot(source, candidate)

      let authorityTier: RuntimeNavigationNode['authorityTier'] = 'standard'

      if (supernode) {
        authorityTier = supernode.authorityTier
      }

      let navigationRole: RuntimeNavigationNode['navigationRole'] = 'graph-bridge'

      if (authorityTier === 'foundational') {
        navigationRole = 'supernode-hub'
      } else if (authorityTier === 'canonical') {
        navigationRole = 'pathway-anchor'
      } else if (
        traversal?.traversalRole === 'continuity-hop'
      ) {
        navigationRole = 'continuity-chain'
      }

      let authorityWeight = 0

      if (authorityTier === 'foundational') {
        authorityWeight = 32
      } else if (authorityTier === 'canonical') {
        authorityWeight = 22
      } else if (authorityTier === 'emerging') {
        authorityWeight = 12
      }

      const continuityStrength =
        traversal?.continuityStrength || 40

      const navigationPriority = Math.max(
        0,
        Math.min(
          Math.round(
            continuityStrength * 0.45 +
            authorityWeight +
            (traversal?.traversalScore || 40) * 0.25,
          ),
          100,
        ),
      )

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        navigationPriority,
        navigationRole,
        authorityTier,
        continuityStrength,
        graphAnchorEligible:
          authorityTier === 'foundational' ||
          authorityTier === 'canonical',
        recommendationReasons: debug.reasons.slice(0, 8),
        debug,
      }
    })
    .sort((a, b) => b.navigationPriority - a.navigationPriority)
}

import { buildMultiHopTraversal } from './multi-hop-traversal'
import { buildRuntimeRecommendations } from './runtime-recommendation-adapter'
import { buildSemanticDebugSnapshot } from './semantic-debug'

export type RuntimePathwayContinuityNode = {
  slug: string
  continuityPriority: number
  continuityRole:
    | 'primary-continuity'
    | 'ecosystem-bridge'
    | 'supporting-pathway'
  traversalRole: string
  recommendationVisibility: 'full' | 'moderate' | 'restricted'
  recommendationReasons: string[]
  debug: ReturnType<typeof buildSemanticDebugSnapshot>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimePathwayContinuity(
  source: any,
  candidates: any[],
): RuntimePathwayContinuityNode[] {
  const traversals = buildMultiHopTraversal(source, candidates)
  const recommendations = buildRuntimeRecommendations(source, candidates)

  return candidates
    .map((candidate) => {
      const traversal = traversals.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const recommendation = recommendations.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const debug = buildSemanticDebugSnapshot(source, candidate)

      let continuityRole: RuntimePathwayContinuityNode['continuityRole'] = 'supporting-pathway'

      if (traversal?.traversalRole === 'primary-hop') {
        continuityRole = 'primary-continuity'
      } else if (
        traversal?.traversalRole === 'continuity-hop'
      ) {
        continuityRole = 'ecosystem-bridge'
      }

      let recommendationVisibility: RuntimePathwayContinuityNode['recommendationVisibility'] = 'restricted'

      if ((recommendation?.renderPriority || 0) >= 80) {
        recommendationVisibility = 'full'
      } else if ((recommendation?.renderPriority || 0) >= 55) {
        recommendationVisibility = 'moderate'
      }

      const continuityPriority = Math.max(
        0,
        Math.min(
          Math.round(
            (traversal?.traversalScore || 40) * 0.65 +
            (recommendation?.renderPriority || 40) * 0.35,
          ),
          100,
        ),
      )

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        continuityPriority,
        continuityRole,
        traversalRole:
          traversal?.traversalRole || 'bridge-hop',
        recommendationVisibility,
        recommendationReasons: debug.reasons.slice(0, 8),
        debug,
      }
    })
    .sort((a, b) => b.continuityPriority - a.continuityPriority)
}

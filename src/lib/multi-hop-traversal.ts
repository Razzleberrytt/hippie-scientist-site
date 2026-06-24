import { buildRetrievalPriorities } from './retrieval-prioritization'
import { buildSemanticRouteDecision } from './semantic-routing'
import { evaluateSemanticSuppression } from './semantic-suppression'

export type MultiHopTraversalNode = {
  slug: string
  hopDepth: number
  traversalScore: number
  traversalRole:
    | 'primary-hop'
    | 'continuity-hop'
    | 'bridge-hop'
    | 'suppressed-hop'
  continuityStrength: number
  redundancyPenalty: number
  reasons: string[]
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildMultiHopTraversal(
  source: any,
  candidates: any[],
  hopDepth = 2,
): MultiHopTraversalNode[] {
  const retrievals = buildRetrievalPriorities(source, candidates)

  return candidates
    .map((candidate) => {
      const routing = buildSemanticRouteDecision(candidate)
      const suppression = evaluateSemanticSuppression(source, candidate)

      const ecosystems = normalizeList(candidate?.ecosystem_taxonomy)
      const pathways = normalizeList(candidate?.pathways)

      const retrieval = retrievals.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const reasons: string[] = []

      let continuityStrength =
        ecosystems.length * 14 +
        pathways.length * 12

      if (routing.routingMode === 'continuity-first') {
        continuityStrength += 24
        reasons.push('continuity-oriented-routing')
      }

      if (routing.routingMode === 'comparison-first') {
        continuityStrength += 12
        reasons.push('comparison-bridge')
      }

      let traversalScore =
        (retrieval?.retrievalScore || 40) * 0.5 +
        continuityStrength * 0.35 +
        hopDepth * 4

      traversalScore -= suppression.redundancyPenalty * 0.4

      traversalScore = Math.max(
        0,
        Math.min(Math.round(traversalScore), 100),
      )

      let traversalRole: MultiHopTraversalNode['traversalRole'] = 'bridge-hop'

      if (!suppression.allowed) {
        traversalRole = 'suppressed-hop'
        reasons.push('suppressed-for-redundancy')
      } else if (traversalScore >= 78) {
        traversalRole = 'primary-hop'
      } else if (traversalScore >= 55) {
        traversalRole = 'continuity-hop'
      }

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        hopDepth,
        traversalScore,
        traversalRole,
        continuityStrength,
        redundancyPenalty: suppression.redundancyPenalty,
        reasons,
      }
    })
    .sort((a, b) => b.traversalScore - a.traversalScore)
}

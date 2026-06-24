import { calculateSemanticConfidence } from './semantic-confidence'
import { calculateSemanticFreshness } from './semantic-freshness'
import { evaluateSemanticAuthority } from './semantic-authority'
import { evaluateSemanticSuppression } from './semantic-suppression'
import { buildSemanticRouteDecision } from './semantic-routing'
import { buildRetrievalPriorities } from './retrieval-prioritization'
import { buildMultiHopTraversal } from './multi-hop-traversal'

export type SemanticDebugSnapshot = {
  sourceSlug: string
  candidateSlug?: string
  routingMode: string
  routeConfidence: number
  authorityConfidence: string
  freshnessConfidence: string
  semanticConfidence: string
  semanticScore: number
  retrievalTier?: string
  retrievalScore?: number
  traversalRole?: string
  traversalScore?: number
  suppressionAllowed?: boolean
  suppressionScore?: number
  redundancyPenalty?: number
  reasons: string[]
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function uniqueReasons(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

export function buildSemanticDebugSnapshot(
  source: any,
  candidate?: any,
): SemanticDebugSnapshot {
  const target = candidate || source

  const confidence = calculateSemanticConfidence(target)
  const freshness = calculateSemanticFreshness(target)
  const authority = evaluateSemanticAuthority(target)
  const routing = buildSemanticRouteDecision(target)

  const retrieval = candidate
    ? buildRetrievalPriorities(source, [candidate])[0]
    : undefined

  const traversal = candidate
    ? buildMultiHopTraversal(source, [candidate])[0]
    : undefined

  const suppression = candidate
    ? evaluateSemanticSuppression(source, candidate)
    : undefined

  const reasons = uniqueReasons([
    ...confidence.reasons,
    ...freshness.reasons,
    ...authority.reasons,
    ...routing.reasons,
    ...(retrieval?.reasons || []),
    ...(traversal?.reasons || []),
    ...(suppression?.reasons || []),
  ])

  return {
    sourceSlug: normalizeText(source?.slug || 'discovery'),
    candidateSlug: candidate ? normalizeText(candidate?.slug || 'candidate') : undefined,
    routingMode: routing.routingMode,
    routeConfidence: routing.confidence,
    authorityConfidence: authority.confidence,
    freshnessConfidence: freshness.confidence,
    semanticConfidence: confidence.confidence,
    semanticScore: confidence.score,
    retrievalTier: retrieval?.retrievalTier,
    retrievalScore: retrieval?.retrievalScore,
    traversalRole: traversal?.traversalRole,
    traversalScore: traversal?.traversalScore,
    suppressionAllowed: suppression?.allowed,
    suppressionScore: suppression?.suppressionScore,
    redundancyPenalty: suppression?.redundancyPenalty,
    reasons,
  }
}

export function buildSemanticDebugTable(
  source: any,
  candidates: any[],
): SemanticDebugSnapshot[] {
  return candidates
    .map((candidate) => buildSemanticDebugSnapshot(source, candidate))
    .sort((a, b) => (b.retrievalScore || 0) - (a.retrievalScore || 0))
}

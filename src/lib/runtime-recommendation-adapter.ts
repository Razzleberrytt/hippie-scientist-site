import { buildRetrievalPriorities } from './retrieval-prioritization'
import { buildSemanticDebugSnapshot } from './semantic-debug'
import { buildConfidenceAwareRendering } from './confidence-aware-rendering'

export type RuntimeRecommendation = {
  slug: string
  retrievalTier: 'primary' | 'secondary' | 'supporting' | 'suppressed'
  retrievalScore: number
  renderPriority: number
  renderMode: string
  recommendationReasons: string[]
  debug: ReturnType<typeof buildSemanticDebugSnapshot>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimeRecommendations(
  source: any,
  candidates: any[],
): RuntimeRecommendation[] {
  const retrievals = buildRetrievalPriorities(source, candidates)

  return candidates
    .map((candidate) => {
      const retrieval = retrievals.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const rendering = buildConfidenceAwareRendering(candidate)

      const debug = buildSemanticDebugSnapshot(source, candidate)

      const renderPriority = Math.min(
        Math.round(
          (retrieval?.retrievalScore || 40) * 0.7 +
          rendering.authorityStrength * 0.3,
        ),
        100,
      )

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        retrievalTier: retrieval?.retrievalTier || 'supporting',
        retrievalScore: retrieval?.retrievalScore || 0,
        renderPriority,
        renderMode: rendering.renderMode,
        recommendationReasons: debug.reasons.slice(0, 8),
        debug,
      }
    })
    .filter((item) => item.retrievalTier !== 'suppressed')
    .sort((a, b) => b.renderPriority - a.renderPriority)
}

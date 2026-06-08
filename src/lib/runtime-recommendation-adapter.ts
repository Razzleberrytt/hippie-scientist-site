import { buildRetrievalPriorities } from './retrieval-prioritization'
import { buildSemanticDebugSnapshot } from './semantic-debug'
import { buildConfidenceAwareRendering } from './confidence-aware-rendering'
import { evaluateSemanticSuppression } from './semantic-suppression'
import { evaluateSemanticAuthority } from './semantic-authority'

export type RuntimeRecommendation = {
  slug: string
  retrievalTier: 'primary' | 'secondary' | 'supporting' | 'suppressed'
  retrievalScore: number
  renderPriority: number
  renderMode: string
  authorityConfidence: 'low' | 'moderate' | 'strong'
  suppressionPenalty: number
  diversityAllowed: boolean
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

      const suppression = evaluateSemanticSuppression(source, candidate)

      const authority = evaluateSemanticAuthority(candidate)

      let authorityWeight = 0

      if (authority.confidence === 'strong') {
        authorityWeight = 24
      } else if (authority.confidence === 'moderate') {
        authorityWeight = 12
      } else {
        authorityWeight = -8
      }

      let renderPriority =
        (retrieval?.retrievalScore || 40) * 0.55 +
        rendering.authorityStrength * 0.25 +
        authorityWeight

      renderPriority -= suppression.redundancyPenalty * 0.45

      renderPriority = Math.max(
        0,
        Math.min(Math.round(renderPriority), 100),
      )

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        retrievalTier: retrieval?.retrievalTier || 'supporting',
        retrievalScore: retrieval?.retrievalScore || 0,
        renderPriority,
        renderMode: rendering.renderMode,
        authorityConfidence: authority.confidence,
        suppressionPenalty: suppression.redundancyPenalty,
        diversityAllowed: suppression.allowed,
        recommendationReasons: debug.reasons.slice(0, 8),
        debug,
      }
    })
    .filter((item) => item.retrievalTier !== 'suppressed')
    .filter((item) => item.diversityAllowed)
    .sort((a, b) => b.renderPriority - a.renderPriority)
}

import { calculateSemanticConfidence } from './semantic-confidence'
import { calculateSemanticFreshness } from './semantic-freshness'
import { evaluateSemanticAuthority } from './semantic-authority'
import { buildRetrievalPriorities } from './retrieval-prioritization'

export type AIAnswerRoute = {
  slug: string
  answerConfidence: number
  retrievalTier: 'primary' | 'secondary' | 'supporting' | 'suppressed'
  answerRole: 'core-evidence' | 'supporting-context' | 'continuity-node' | 'low-confidence'
  semanticReliability: number
  freshnessReliability: number
  authorityReliability: number
  reasons: string[]
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildAIAnswerRoutes(
  source: any,
  candidates: any[],
): AIAnswerRoute[] {
  const retrievals = buildRetrievalPriorities(source, candidates)

  return candidates
    .map((candidate) => {
      const confidence = calculateSemanticConfidence(candidate)
      const freshness = calculateSemanticFreshness(candidate)
      const authority = evaluateSemanticAuthority(candidate)

      const retrieval = retrievals.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const reasons: string[] = [
        ...confidence.reasons,
        ...freshness.reasons,
        ...authority.reasons,
      ]

      const semanticReliability = confidence.retrievalConfidence
      const freshnessReliability = freshness.authorityFreshness
      const authorityReliability =
        authority.confidence === 'strong'
          ? 92
          : authority.confidence === 'moderate'
            ? 68
            : 34

      let answerConfidence =
        semanticReliability * 0.45 +
        freshnessReliability * 0.25 +
        authorityReliability * 0.3

      answerConfidence = Math.max(
        0,
        Math.min(Math.round(answerConfidence), 100),
      )

      let answerRole: AIAnswerRoute['answerRole'] = 'low-confidence'

      if (answerConfidence >= 82) {
        answerRole = 'core-evidence'
      } else if (answerConfidence >= 62) {
        answerRole = 'supporting-context'
      } else if (answerConfidence >= 45) {
        answerRole = 'continuity-node'
      }

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        answerConfidence,
        retrievalTier: retrieval?.retrievalTier || 'supporting',
        answerRole,
        semanticReliability,
        freshnessReliability,
        authorityReliability,
        reasons,
      }
    })
    .sort((a, b) => b.answerConfidence - a.answerConfidence)
}

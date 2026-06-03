import { buildMultiHopTraversal } from './multi-hop-traversal'
import { buildRuntimeRecommendations } from './runtime-recommendation-adapter'

export type AdaptiveSessionProfile = {
  sessionId: string
  viewedSlugs: string[]
  continuityAnchors: string[]
  adaptiveExplorationPaths: string[]
  onboardingFlow: 'introductory' | 'intermediate' | 'advanced'
  recommendationBias:
    | 'authority-first'
    | 'continuity-first'
    | 'exploration-first'
}

const sessionMemory = new Map<string, AdaptiveSessionProfile>()

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
}

export function buildAdaptiveSession(
  sessionId: string,
  source: any,
  candidates: any[],
): AdaptiveSessionProfile {
  const existing = sessionMemory.get(sessionId)

  const traversals = buildMultiHopTraversal(source, candidates)
  const recommendations = buildRuntimeRecommendations(source, candidates)

  const viewedSlugs = existing?.viewedSlugs || []

  const currentSlug = normalizeText(source?.slug || 'discovery')

  if (!viewedSlugs.includes(currentSlug)) {
    viewedSlugs.push(currentSlug)
  }

  const continuityAnchors = traversals
    .filter((item) => item.traversalRole === 'continuity-hop')
    .slice(0, 6)
    .map((item) => item.slug)

  const adaptiveExplorationPaths = recommendations
    .slice(0, 8)
    .map((item) => item.slug)

  let onboardingFlow: AdaptiveSessionProfile['onboardingFlow'] = 'introductory'

  if (viewedSlugs.length >= 8) {
    onboardingFlow = 'advanced'
  } else if (viewedSlugs.length >= 4) {
    onboardingFlow = 'intermediate'
  }

  let recommendationBias: AdaptiveSessionProfile['recommendationBias'] = 'exploration-first'

  if (continuityAnchors.length >= 4) {
    recommendationBias = 'continuity-first'
  }

  if (
    recommendations.filter(
      (item) => item.authorityConfidence === 'strong',
    ).length >= 5
  ) {
    recommendationBias = 'authority-first'
  }

  const profile: AdaptiveSessionProfile = {
    sessionId,
    viewedSlugs,
    continuityAnchors,
    adaptiveExplorationPaths,
    onboardingFlow,
    recommendationBias,
  }

  sessionMemory.set(sessionId, profile)

  return profile
}

export function clearAdaptiveSession(sessionId: string) {
  sessionMemory.delete(sessionId)
}

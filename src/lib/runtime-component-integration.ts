import { buildRuntimeRenderingState } from './runtime-rendering-adapter'
import { buildRuntimeRecommendations } from './runtime-recommendation-adapter'
import { buildRuntimeNavigation } from './runtime-navigation-adapter'

export type RuntimeComponentIntegration = {
  slug: string
  componentMode:
    | 'expanded'
    | 'standard'
    | 'conservative'
    | 'minimal'
  recommendationModulesEnabled: boolean
  continuityModulesEnabled: boolean
  navigationModulesEnabled: boolean
  authorityHighlightsEnabled: boolean
  freshnessNoticeEnabled: boolean
  recommendationCount: number
  navigationCount: number
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimeComponentIntegration(
  source: any,
  candidates: any[],
): RuntimeComponentIntegration {
  const rendering = buildRuntimeRenderingState(source)

  const recommendations = buildRuntimeRecommendations(
    source,
    candidates,
  )

  const navigation = buildRuntimeNavigation(
    source,
    candidates,
  )

  let componentMode: RuntimeComponentIntegration['componentMode'] = 'minimal'

  if (rendering.renderMode === 'expanded-authority') {
    componentMode = 'expanded'
  } else if (
    rendering.renderMode === 'standard-authority'
  ) {
    componentMode = 'standard'
  } else if (
    rendering.renderMode === 'conservative-authority'
  ) {
    componentMode = 'conservative'
  }

  return {
    slug: normalizeText(source?.slug || 'discovery'),
    componentMode,
    recommendationModulesEnabled:
      recommendations.length > 0 &&
      rendering.recommendationVisibility !== 'restricted',
    continuityModulesEnabled:
      rendering.continuityModulesEnabled,
    navigationModulesEnabled:
      navigation.length > 0,
    authorityHighlightsEnabled:
      rendering.authorityStrength >= 72,
    freshnessNoticeEnabled:
      rendering.freshnessNoticeEnabled,
    recommendationCount: recommendations.length,
    navigationCount: navigation.length,
  }
}

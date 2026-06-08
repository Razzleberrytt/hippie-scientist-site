import { buildRuntimeHomepageModules } from './runtime-homepage-adapter'
import { buildRuntimeNavigation } from './runtime-navigation-adapter'
import { buildRuntimeRecommendations } from './runtime-recommendation-adapter'
import { buildRuntimeRenderingState } from './runtime-rendering-adapter'

export type RuntimeUIIntegration = {
  rendering: ReturnType<typeof buildRuntimeRenderingState>
  recommendations: ReturnType<typeof buildRuntimeRecommendations>
  homepageModules: ReturnType<typeof buildRuntimeHomepageModules>
  navigation: ReturnType<typeof buildRuntimeNavigation>
}

export function buildRuntimeUIIntegration(
  source: any,
  candidates: any[],
): RuntimeUIIntegration {
  return {
    rendering: buildRuntimeRenderingState(source),
    recommendations: buildRuntimeRecommendations(source, candidates),
    homepageModules: buildRuntimeHomepageModules(source, candidates),
    navigation: buildRuntimeNavigation(source, candidates),
  }
}

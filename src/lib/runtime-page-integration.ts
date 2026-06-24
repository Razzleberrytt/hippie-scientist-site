import { buildRuntimeHomepageModules } from './runtime-homepage-adapter'
import { buildRuntimeRecommendations } from './runtime-recommendation-adapter'
import { buildRuntimeNavigation } from './runtime-navigation-adapter'
import { buildRuntimeComponentIntegration } from './runtime-component-integration'

export type RuntimePageIntegration = {
  homepage: {
    enabled: boolean
    moduleCount: number
    modules: ReturnType<typeof buildRuntimeHomepageModules>
  }
  detailPages: {
    enabled: boolean
    recommendationCount: number
    recommendations: ReturnType<typeof buildRuntimeRecommendations>
  }
  ecosystemNavigation: {
    enabled: boolean
    navigationCount: number
    navigation: ReturnType<typeof buildRuntimeNavigation>
  }
  componentIntegration: ReturnType<typeof buildRuntimeComponentIntegration>
}

export function buildRuntimePageIntegration(
  source: any,
  candidates: any[],
): RuntimePageIntegration {
  const homepageModules = buildRuntimeHomepageModules(
    source,
    candidates,
  )

  const recommendations = buildRuntimeRecommendations(
    source,
    candidates,
  )

  const navigation = buildRuntimeNavigation(
    source,
    candidates,
  )

  const componentIntegration = buildRuntimeComponentIntegration(
    source,
    candidates,
  )

  return {
    homepage: {
      enabled: homepageModules.length > 0,
      moduleCount: homepageModules.length,
      modules: homepageModules,
    },
    detailPages: {
      enabled: recommendations.length > 0,
      recommendationCount: recommendations.length,
      recommendations,
    },
    ecosystemNavigation: {
      enabled: navigation.length > 0,
      navigationCount: navigation.length,
      navigation,
    },
    componentIntegration,
  }
}

import { buildRuntimeUIIntegration } from './runtime-ui-integration'

export type RuntimeHydrationState = {
  hydrated: boolean
  hydrationSafe: boolean
  fallbackMode: boolean
  generatedAt: string
  integrity: {
    recommendationsReady: boolean
    homepageReady: boolean
    navigationReady: boolean
    renderingReady: boolean
  }
}

export function buildRuntimeHydrationState(
  source: any,
  candidates: any[],
): RuntimeHydrationState {
  const integration = buildRuntimeUIIntegration(
    source,
    candidates,
  )

  const integrity = {
    recommendationsReady:
      integration.recommendations.length > 0,
    homepageReady:
      integration.homepageModules.length > 0,
    navigationReady:
      integration.navigation.length > 0,
    renderingReady:
      Boolean(integration.rendering),
  }

  const hydrationSafe =
    integrity.recommendationsReady &&
    integrity.homepageReady &&
    integrity.navigationReady &&
    integrity.renderingReady

  return {
    hydrated: hydrationSafe,
    hydrationSafe,
    fallbackMode: !hydrationSafe,
    generatedAt: new Date().toISOString(),
    integrity,
  }
}

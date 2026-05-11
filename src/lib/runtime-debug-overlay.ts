import { buildSemanticDebugTable } from './semantic-debug'
import { buildRuntimeUIIntegration } from './runtime-ui-integration'

export type RuntimeDebugOverlay = {
  enabled: boolean
  generatedAt: string
  semanticSummary: {
    recommendationCount: number
    homepageModuleCount: number
    navigationNodeCount: number
  }
  debugTable: ReturnType<typeof buildSemanticDebugTable>
  uiIntegration: ReturnType<typeof buildRuntimeUIIntegration>
}

export function buildRuntimeDebugOverlay(
  source: any,
  candidates: any[],
): RuntimeDebugOverlay {
  const uiIntegration = buildRuntimeUIIntegration(
    source,
    candidates,
  )

  const debugTable = buildSemanticDebugTable(
    source,
    candidates,
  )

  return {
    enabled: process.env.NODE_ENV !== 'production',
    generatedAt: new Date().toISOString(),
    semanticSummary: {
      recommendationCount:
        uiIntegration.recommendations.length,
      homepageModuleCount:
        uiIntegration.homepageModules.length,
      navigationNodeCount:
        uiIntegration.navigation.length,
    },
    debugTable,
    uiIntegration,
  }
}

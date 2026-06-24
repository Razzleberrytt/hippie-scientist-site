import { buildRuntimeDebugOverlay } from './runtime-debug-overlay'
import { buildRuntimeHydrationState } from './runtime-hydration-guard'
import { buildSemanticAnalyticsReport } from './semantic-analytics'
import { buildSemanticQAReport } from './semantic-qa'

export type RuntimeDevtoolsSnapshot = {
  generatedAt: string
  debugOverlay: ReturnType<typeof buildRuntimeDebugOverlay>
  hydration: ReturnType<typeof buildRuntimeHydrationState>
  analytics: ReturnType<typeof buildSemanticAnalyticsReport>
  qa: ReturnType<typeof buildSemanticQAReport>
}

export function buildRuntimeDevtoolsSnapshot(
  source: any,
  candidates: any[],
): RuntimeDevtoolsSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    debugOverlay: buildRuntimeDebugOverlay(
      source,
      candidates,
    ),
    hydration: buildRuntimeHydrationState(
      source,
      candidates,
    ),
    analytics: buildSemanticAnalyticsReport(
      source,
      candidates,
    ),
    qa: buildSemanticQAReport(candidates),
  }
}

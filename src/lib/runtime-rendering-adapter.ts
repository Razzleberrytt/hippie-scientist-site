import { buildConfidenceAwareRendering } from './confidence-aware-rendering'
import { buildSemanticDebugSnapshot } from './semantic-debug'

export type RuntimeRenderingState = {
  slug: string
  renderMode:
    | 'expanded-authority'
    | 'standard-authority'
    | 'conservative-authority'
    | 'minimal-authority'
  expandedAuthorityEnabled: boolean
  conservativeRenderingEnabled: boolean
  freshnessNoticeEnabled: boolean
  suppressionBehaviorEnabled: boolean
  continuityModulesEnabled: boolean
  protocolModulesEnabled: boolean
  indexingEligible: boolean
  authorityStrength: number
  recommendationVisibility:
    | 'full'
    | 'moderate'
    | 'restricted'
  debug: ReturnType<typeof buildSemanticDebugSnapshot>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimeRenderingState(
  source: any,
): RuntimeRenderingState {
  const rendering = buildConfidenceAwareRendering(source)

  const debug = buildSemanticDebugSnapshot(source)

  let recommendationVisibility: RuntimeRenderingState['recommendationVisibility'] = 'restricted'

  if (rendering.authorityStrength >= 78) {
    recommendationVisibility = 'full'
  } else if (rendering.authorityStrength >= 52) {
    recommendationVisibility = 'moderate'
  }

  return {
    slug: normalizeText(source?.slug || 'discovery'),
    renderMode: rendering.renderMode,
    expandedAuthorityEnabled:
      rendering.renderMode === 'expanded-authority',
    conservativeRenderingEnabled:
      rendering.renderMode === 'conservative-authority' ||
      rendering.renderMode === 'minimal-authority',
    freshnessNoticeEnabled: rendering.showFreshnessNotice,
    suppressionBehaviorEnabled:
      rendering.suppressAggressiveRecommendations,
    continuityModulesEnabled:
      rendering.showContinuityModules,
    protocolModulesEnabled:
      rendering.showProtocolModules,
    indexingEligible: rendering.indexingEligible,
    authorityStrength: rendering.authorityStrength,
    recommendationVisibility,
    debug,
  }
}

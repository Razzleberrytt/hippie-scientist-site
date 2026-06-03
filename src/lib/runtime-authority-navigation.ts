import { buildAuthoritySupernodes } from './authority-supernodes'
import { buildRuntimeNavigation } from './runtime-navigation-adapter'
import { buildSemanticDebugSnapshot } from './semantic-debug'

export type RuntimeAuthorityHub = {
  slug: string
  authorityPriority: number
  authorityRole:
    | 'foundational-hub'
    | 'canonical-hub'
    | 'emerging-hub'
  navigationPriority: number
  continuityEligible: boolean
  recommendationReasons: string[]
  debug: ReturnType<typeof buildSemanticDebugSnapshot>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimeAuthorityNavigation(
  source: any,
  candidates: any[],
): RuntimeAuthorityHub[] {
  const supernodes = buildAuthoritySupernodes(candidates)
  const navigation = buildRuntimeNavigation(source, candidates)

  return supernodes
    .map((node) => {
      const navigationNode = navigation.find(
        (item) => item.slug === normalizeText(node.slug),
      )

      const candidate = candidates.find(
        (item) =>
          normalizeText(item?.slug) === normalizeText(node.slug),
      )

      const debug = buildSemanticDebugSnapshot(
        source,
        candidate,
      )

      let authorityRole: RuntimeAuthorityHub['authorityRole'] = 'emerging-hub'

      if (node.authorityTier === 'foundational') {
        authorityRole = 'foundational-hub'
      } else if (node.authorityTier === 'canonical') {
        authorityRole = 'canonical-hub'
      }

      const authorityPriority = Math.max(
        0,
        Math.min(
          Math.round(
            node.traversalWeight * 0.6 +
            (navigationNode?.navigationPriority || 40) * 0.4,
          ),
          100,
        ),
      )

      return {
        slug: normalizeText(node.slug),
        authorityPriority,
        authorityRole,
        navigationPriority:
          navigationNode?.navigationPriority || 0,
        continuityEligible:
          (navigationNode?.continuityStrength || 0) >= 55,
        recommendationReasons: debug.reasons.slice(0, 8),
        debug,
      }
    })
    .sort((a, b) => b.authorityPriority - a.authorityPriority)
}

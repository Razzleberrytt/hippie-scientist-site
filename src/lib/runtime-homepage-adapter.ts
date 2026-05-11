import { buildAdaptiveHomepageClusters } from './adaptive-homepage'
import { buildAuthoritySupernodes } from './authority-supernodes'
import { calculateSemanticFreshness } from './semantic-freshness'
import { buildSemanticDebugSnapshot } from './semantic-debug'

export type RuntimeHomepageModule = {
  slug: string
  homepagePriority: number
  homepageRole:
    | 'authority-hub'
    | 'ecosystem-continuity'
    | 'emerging-focus'
    | 'foundational-discovery'
  authorityTier: 'foundational' | 'canonical' | 'emerging' | 'standard'
  freshnessConfidence: 'low' | 'moderate' | 'strong'
  recommendationReasons: string[]
  debug: ReturnType<typeof buildSemanticDebugSnapshot>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimeHomepageModules(
  source: any,
  candidates: any[],
): RuntimeHomepageModule[] {
  const homepageClusters = buildAdaptiveHomepageClusters(candidates)
  const supernodes = buildAuthoritySupernodes(candidates)

  return candidates
    .map((candidate) => {
      const cluster = homepageClusters.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const supernode = supernodes.find(
        (item) => item.slug === normalizeText(candidate?.slug),
      )

      const freshness = calculateSemanticFreshness(candidate)

      const debug = buildSemanticDebugSnapshot(source, candidate)

      let authorityTier: RuntimeHomepageModule['authorityTier'] = 'standard'

      if (supernode) {
        authorityTier = supernode.authorityTier
      }

      let homepageRole: RuntimeHomepageModule['homepageRole'] = 'foundational-discovery'

      if (authorityTier === 'foundational') {
        homepageRole = 'authority-hub'
      } else if (authorityTier === 'canonical') {
        homepageRole = 'ecosystem-continuity'
      } else if (freshness.confidence === 'strong') {
        homepageRole = 'emerging-focus'
      }

      let authorityWeight = 0

      if (authorityTier === 'foundational') {
        authorityWeight = 30
      } else if (authorityTier === 'canonical') {
        authorityWeight = 20
      } else if (authorityTier === 'emerging') {
        authorityWeight = 10
      }

      const homepagePriority = Math.max(
        0,
        Math.min(
          Math.round(
            (cluster?.routingWeight || 40) * 0.45 +
            (cluster?.authorityWeight || 40) * 0.35 +
            authorityWeight,
          ),
          100,
        ),
      )

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        homepagePriority,
        homepageRole,
        authorityTier,
        freshnessConfidence: freshness.confidence,
        recommendationReasons: debug.reasons.slice(0, 8),
        debug,
      }
    })
    .sort((a, b) => b.homepagePriority - a.homepagePriority)
}

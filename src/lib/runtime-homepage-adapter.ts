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
  ecosystemContinuity: number
  continuityModuleEligible: boolean
  recommendationReasons: string[]
  debug: ReturnType<typeof buildSemanticDebugSnapshot>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
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

      const ecosystems = normalizeList(candidate?.ecosystem_taxonomy)
      const pathways = normalizeList(candidate?.pathways)

      const ecosystemContinuity = Math.min(
        ecosystems.length * 14 + pathways.length * 12,
        100,
      )

      let authorityTier: RuntimeHomepageModule['authorityTier'] = 'standard'

      if (supernode) {
        authorityTier = supernode.authorityTier
      }

      let homepageRole: RuntimeHomepageModule['homepageRole'] = 'foundational-discovery'

      if (authorityTier === 'foundational') {
        homepageRole = 'authority-hub'
      } else if (
        authorityTier === 'canonical' ||
        ecosystemContinuity >= 55
      ) {
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
            (cluster?.routingWeight || 40) * 0.4 +
            (cluster?.authorityWeight || 40) * 0.3 +
            ecosystemContinuity * 0.2 +
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
        ecosystemContinuity,
        continuityModuleEligible: ecosystemContinuity >= 45,
        recommendationReasons: debug.reasons.slice(0, 8),
        debug,
      }
    })
    .sort((a, b) => b.homepagePriority - a.homepagePriority)
}

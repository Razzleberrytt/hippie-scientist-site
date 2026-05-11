import { buildRuntimeHomepageModules } from './runtime-homepage-adapter'
import { buildRuntimeAuthorityNavigation } from './runtime-authority-navigation'
import { buildRuntimePathwayContinuity } from './runtime-pathway-continuity'

export type RuntimeHomepageOrchestration = {
  authorityPriority: number
  ecosystemPriority: number
  continuityPriority: number
  freshnessPriority: number
  adaptiveSections: {
    authorityVisible: boolean
    ecosystemVisible: boolean
    continuityVisible: boolean
    emergingVisible: boolean
  }
  prioritizedModules: ReturnType<typeof buildRuntimeHomepageModules>
}

export function buildRuntimeHomepageOrchestration(
  source: any,
  candidates: any[],
): RuntimeHomepageOrchestration {
  const homepageModules = buildRuntimeHomepageModules(
    source,
    candidates,
  )

  const authority = buildRuntimeAuthorityNavigation(
    source,
    candidates,
  )

  const continuity = buildRuntimePathwayContinuity(
    source,
    candidates,
  )

  const authorityPriority = Math.min(
    authority.reduce(
      (accumulator, item) =>
        accumulator + item.authorityPriority,
      0,
    ) / Math.max(authority.length, 1),
    100,
  )

  const ecosystemPriority = Math.min(
    homepageModules.reduce(
      (accumulator, item) =>
        accumulator + item.ecosystemContinuity,
      0,
    ) / Math.max(homepageModules.length, 1),
    100,
  )

  const continuityPriority = Math.min(
    continuity.reduce(
      (accumulator, item) =>
        accumulator + item.continuityPriority,
      0,
    ) / Math.max(continuity.length, 1),
    100,
  )

  const freshnessPriority = Math.min(
    homepageModules.filter(
      (item) => item.freshnessConfidence === 'strong',
    ).length * 15,
    100,
  )

  return {
    authorityPriority,
    ecosystemPriority,
    continuityPriority,
    freshnessPriority,
    adaptiveSections: {
      authorityVisible: authorityPriority >= 40,
      ecosystemVisible: ecosystemPriority >= 40,
      continuityVisible: continuityPriority >= 45,
      emergingVisible: freshnessPriority >= 30,
    },
    prioritizedModules: homepageModules.sort(
      (a, b) => b.homepagePriority - a.homepagePriority,
    ),
  }
}

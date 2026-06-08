import { normalizeTopicSlug } from '@/lib/canonical-route-taxonomy'
import { list, text, unique } from '@/lib/display-utils'
import { seoEntryPages } from '@/app/seo-entry-pages'
import { getValidComparisonSlug } from '@/lib/comparison-utils'

function normalize(values: unknown[]) {
  return unique(values.map(text).filter(Boolean))
}

function getValidGuideRoute(goal: string): string | undefined {
  const normalized = normalizeTopicSlug(goal)
  
  // Try exact match in route (either route equals normalized, or route is guides/normalized)
  let found = seoEntryPages.find(page => {
    const routeLower = page.route.toLowerCase()
    return routeLower === normalized || routeLower === `guides/${normalized}`
  })
  if (found) return `/${found.route}`

  // Try exact match on goalSlug
  found = seoEntryPages.find(page => page.goalSlug.toLowerCase() === normalized)
  if (found) return `/${found.route}`

  // Fallback: substring match on the route
  found = seoEntryPages.find(page => {
    const routeLower = page.route.toLowerCase()
    return routeLower.endsWith(`-${normalized}`) || 
           routeLower.includes(`-${normalized}-`) || 
           routeLower.startsWith(`${normalized}-`)
  })
  if (found) return `/${found.route}`

  return undefined
}

function getValidEcosystemRoute(goal: string): string | undefined {
  const normalized = normalizeTopicSlug(goal)
  
  if (normalized.includes('sleep') || normalized.includes('night') || normalized.includes('insomnia')) {
    return '/ecosystems/sleep'
  }
  if (normalized.includes('stress') || normalized.includes('anxiety') || normalized.includes('calm') || normalized.includes('mood') || normalized.includes('adaptogen')) {
    return '/ecosystems/stress'
  }
  if (normalized.includes('cognition') || normalized.includes('focus') || normalized.includes('nootropic') || normalized.includes('brain') || normalized.includes('memory') || normalized.includes('longevity')) {
    return '/ecosystems/cognition'
  }
  if (normalized.includes('recovery') || normalized.includes('performance') || normalized.includes('energy') || normalized.includes('fatigue') || normalized.includes('exercise') || normalized.includes('muscle') || normalized.includes('athletic')) {
    return '/ecosystems/recovery'
  }
  
  return undefined
}

export function buildInternalLinkDensity(record: Record<string, unknown>) {
  const goals = normalize([
    ...list(record?.best_for),
    ...list(record?.primary_effects),
  ]).slice(0, 5)

  const pathways = normalize([
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ]).slice(0, 5)

  const guides = goals
    .map((goal) => {
      const href = getValidGuideRoute(goal)
      if (!href) return null
      return {
        label: `${goal} guide`,
        href,
      }
    })
    .filter((x): x is { label: string; href: string } => x !== null)

  const ecosystems = goals
    .map((goal) => {
      const href = getValidEcosystemRoute(goal)
      if (!href) return null
      return {
        label: `${goal} ecosystem`,
        href,
      }
    })
    .filter((x): x is { label: string; href: string } => x !== null)

  // Deduplicate ecosystems by href
  const uniqueEcosystems: typeof ecosystems = []
  const seenEcosystems = new Set<string>()
  for (const eco of ecosystems) {
    if (!seenEcosystems.has(eco.href)) {
      seenEcosystems.add(eco.href)
      uniqueEcosystems.push(eco)
    }
  }

  const compares = pathways
    .map((pathway) => {
      const validSlug = getValidComparisonSlug(String(record?.slug ?? ''), pathway)
      if (!validSlug) return null
      return {
        label: `Compare ${record?.slug} alternatives`,
        href: `/compare/${validSlug}`,
      }
    })
    .filter((x): x is { label: string; href: string } => x !== null)
    .slice(0, 3)

  return {
    guides,
    ecosystems: uniqueEcosystems,
    compares,
  }
}


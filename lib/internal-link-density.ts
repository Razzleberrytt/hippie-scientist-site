import { buildCanonicalCompareRoute, buildCanonicalEcosystemRoute, buildCanonicalGuideRoute } from '@/lib/canonical-route-taxonomy'
import { list, text, unique } from '@/lib/display-utils'

function normalize(values: unknown[]) {
  return unique(values.map(text).filter(Boolean))
}

export function buildInternalLinkDensity(record: any) {
  const goals = normalize([
    ...list(record?.best_for),
    ...list(record?.primary_effects),
  ]).slice(0, 5)

  const pathways = normalize([
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ]).slice(0, 5)

  return {
    guides: goals.map((goal) => ({
      label: `${goal} guide`,
      href: buildCanonicalGuideRoute(goal),
    })),
    ecosystems: goals.map((goal) => ({
      label: `${goal} ecosystem`,
      href: buildCanonicalEcosystemRoute(goal),
    })),
    compares: pathways.slice(0, 3).map((pathway) => ({
      label: `Compare ${record?.slug} alternatives`,
      href: buildCanonicalCompareRoute(record?.slug, pathway),
    })),
  }
}

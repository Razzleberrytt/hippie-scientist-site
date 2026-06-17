import { cleanEditorialText, dedupeEditorialItems, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
import { isBuiltComparisonSlug } from '@/lib/comparison-utils'
type RuntimeRecord = Record<string, unknown>

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupeEditorialItems(value)
  }

  if (typeof value === 'string') {
    return dedupeEditorialItems(value.split(/,|;|\|/))
  }

  return []
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function buildSignals(record: RuntimeRecord) {
  return unique([
    ...asList(record?.primary_effects),
    ...asList(record?.mechanisms),
    ...asList(record?.pathways),
  ])
}

export function buildComparisonRecommendations(record: RuntimeRecord) {
  const signals = buildSignals(record)
  const name = cleanEditorialText(record?.name || record?.slug)
  const slug = cleanEditorialText(record?.slug)

  if (!isRenderableText(name) || !isRenderableText(slug)) return []

  return signals
    .slice(0, 6)
    .map((signal) => {
      const comparisonSlug = `${slug}-vs-${signal.toLowerCase().replace(/\s+/g, '-')}`
      return {
        comparisonSlug,
        href: `/compare/${comparisonSlug}`,
        title: cleanEditorialText(`${name} vs ${signal}`),
        rationale: cleanEditorialText(`Semantic comparison generated through overlap in ${signal}.`),
        overlap: [signal],
      }
    })
    // Only surface comparisons that are actually built. Signals (mechanisms,
    // pathways, effects) are not comparison pages, so these would 404 — the
    // historical source of the "/compare/*" not-found cluster in Search Console.
    .filter((item) => isBuiltComparisonSlug(item.comparisonSlug))
    .filter((item) => shouldRenderCard(item.title, item.rationale))
}

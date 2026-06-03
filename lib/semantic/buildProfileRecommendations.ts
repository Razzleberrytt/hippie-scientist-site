import { cleanEditorialText, dedupeEditorialItems, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
type RuntimeRecord = Record<string, any>

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

function getSignals(record: RuntimeRecord) {
  return unique([
    ...asList(record?.primary_effects),
    ...asList(record?.mechanisms),
    ...asList(record?.pathways),
    ...asList(record?.topic_ecosystems),
  ])
}

function overlap(left: string[], right: string[]) {
  const rightSet = new Set(right.map((v) => v.toLowerCase()))

  return left.filter((v) => rightSet.has(v.toLowerCase()))
}

export function buildProfileRecommendations({
  current,
  candidates,
  basePath,
  limit = 6,
}: {
  current: RuntimeRecord
  candidates: RuntimeRecord[]
  basePath: string
  limit?: number
}) {
  const currentSignals = getSignals(current)

  return candidates
    .filter((candidate) => isRenderableText(candidate?.slug) && candidate.slug !== current?.slug)
    .map((candidate) => {
      const matches = overlap(currentSignals, getSignals(candidate))

      return {
        href: `${basePath}/${candidate.slug}`,
        title: cleanEditorialText(candidate.title || candidate.name || candidate.slug),
        overlap: dedupeEditorialItems(matches, 4),
        rationale: matches.length
          ? `Connected through ${matches.slice(0, 3).join(', ')}.`
          : 'Related through semantic ecosystem continuity.',
        score: matches.length,
      }
    })
    .filter((candidate) => candidate.score > 0 && shouldRenderCard(candidate.title, candidate.rationale))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      return a.title.localeCompare(b.title)
    })
    .slice(0, limit)
}

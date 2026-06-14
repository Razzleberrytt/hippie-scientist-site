import { cleanEditorialText, dedupeEditorialItems, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
type RuntimeRecord = Record<string, unknown>

type ContinuityCandidate = {
  slug: string
  title: string
  href: string
  score: number
  overlap: string[]
  rationale: string
}

const MAX_RESULTS = 6

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

function buildSignalSet(record: RuntimeRecord) {
  return unique([
    ...asList(record?.primary_effects),
    ...asList(record?.mechanisms),
    ...asList(record?.pathways),
    ...asList(record?.topic_ecosystems),
    ...asList(record?.comparison_groups),
    ...asList(record?.stack_synergies),
  ])
}

function overlap(a: string[], b: string[]) {
  const right = new Set(b.map((item) => item.toLowerCase()))

  return a.filter((item) => right.has(item.toLowerCase()))
}

function scoreOverlap(matches: string[]) {
  return matches.length
}

function buildRationale(matches: string[]) {
  if (!matches.length) {
    return 'Related through broader semantic ecosystem continuity.'
  }

  if (matches.length === 1) {
    return `Connected through ${matches[0]}.`
  }

  return `Connected through ${matches.slice(0, 3).join(', ')}.`
}

export function getEcosystemContinuity({
  current,
  candidates,
  routeBase = '/herbs',
}: {
  current: RuntimeRecord
  candidates: RuntimeRecord[]
  routeBase?: string
}): ContinuityCandidate[] {
  const currentSignals = buildSignalSet(current)

  return candidates
    .filter((candidate) => isRenderableText(candidate?.slug) && candidate.slug !== current?.slug)
    .map((candidate) => {
      const candidateSlug = String(candidate.slug || '')
      const candidateSignals = buildSignalSet(candidate)
      const matches = overlap(currentSignals, candidateSignals)

      return {
        slug: candidateSlug,
        title: cleanEditorialText(candidate.title || candidate.name || candidateSlug),
        href: `${routeBase}/${candidateSlug}`,
        overlap: dedupeEditorialItems(matches, 4),
        rationale: buildRationale(matches),
        score: scoreOverlap(matches),
      }
    })
    .filter((candidate) => candidate.score > 0 && shouldRenderCard(candidate.title, candidate.rationale))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      return a.title.localeCompare(b.title)
    })
    .slice(0, MAX_RESULTS)
}

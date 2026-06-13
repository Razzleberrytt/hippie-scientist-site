import { dedupeEditorialItems, isRenderableText, shouldRenderCard } from '@/lib/editorial-rendering'
type RuntimeRecord = Record<string, any>

type ProtocolItem = {
  href: string
  title: string
  summary: string
  tags: string[]
}

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

function buildTags(record: RuntimeRecord) {
  return unique([
    ...asList(record?.primary_effects),
    ...asList(record?.topic_ecosystems),
    ...asList(record?.pathways),
  ])
}

// Maps tag keywords to valid /goals/:slug routes. Only tags that resolve to a
// known goal slug produce a card; all others are silently dropped so we never
// render a dead link.
const TAG_TO_GOAL: Record<string, string> = {
  sleep: 'sleep',
  insomnia: 'sleep',
  'sleep quality': 'sleep',
  stress: 'stress',
  anxiety: 'anxiety',
  cortisol: 'stress',
  burnout: 'stress',
  'stress resilience': 'stress',
  focus: 'focus',
  cognition: 'cognition',
  'cognitive function': 'cognition',
  attention: 'focus',
  memory: 'cognition',
  energy: 'energy',
  fatigue: 'energy',
  inflammation: 'inflammation',
  'anti-inflammatory': 'inflammation',
  pain: 'pain',
  longevity: 'longevity',
  'gut health': 'gut-health',
  digestion: 'gut-health',
  'joint support': 'joint-support',
  recovery: 'recovery',
  testosterone: 'testosterone-support',
  'blood pressure': 'blood-pressure',
  'fat loss': 'fat-loss',
  weight: 'fat-loss',
}

function tagToGoalSlug(tag: string): string | null {
  const normalised = tag.trim().toLowerCase()
  return TAG_TO_GOAL[normalised] || null
}

export function buildProtocolRecommendations(record: RuntimeRecord) {
  const tags = buildTags(record)
  const seen = new Set<string>()

  const items = tags
    .filter(isRenderableText)
    .reduce<ProtocolItem[]>((acc, tag: string) => {
      const goalSlug = tagToGoalSlug(tag)
      if (!goalSlug || seen.has(goalSlug)) return acc
      seen.add(goalSlug)
      acc.push({
        href: `/goals/${goalSlug}`,
        title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Goal Guide`,
        summary:
          'Evidence-informed goal exploration generated from semantic ecosystem overlap and pathway continuity.',
        tags: [tag],
      })
      return acc
    }, [])

  return items
    .filter((item: ProtocolItem) => shouldRenderCard(item.title, item.summary))
    .slice(0, 4)
}

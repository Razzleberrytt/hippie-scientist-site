export const CORE_COMPETITOR_PUBLISHERS = [
  'Examine',
  'NIH/NCCIH',
  'Healthline',
] as const

export type CompetitorPublisher = (typeof CORE_COMPETITOR_PUBLISHERS)[number] | string

export type GapIntent =
  | 'generic-definition'
  | 'long-tail-decision'
  | 'form-extract'
  | 'evidence-comparison'
  | 'mechanism-vs-human-evidence'
  | 'interaction-research'
  | 'comparison'
  | 'structured-data'
  | 'interactive-tool'
  | 'evidence-synthesis'
  | 'other'

export interface TopicCoverage {
  topic: string
  publisher: CompetitorPublisher
  url?: string
  intent?: GapIntent
  authorityTier?: 'medical-authority' | 'evidence-specialist' | 'consumer-publisher' | 'other'
}

export interface SiteTopic {
  topic: string
  url: string
  intent?: GapIntent
  capabilities?: Array<
    'structured-data' | 'comparison' | 'interactive-tool' | 'evidence-synthesis' | 'source-level-safety'
  >
}

export interface CompetitorGap {
  topic: string
  normalizedTopic: string
  competitorPublishers: string[]
  competitorUrls: string[]
  siteUrls: string[]
  intent: GapIntent
  distinctivenessScore: number
  decision: 'pursue' | 'protect' | 'avoid-generic-head-term'
  reasons: string[]
}

const DISTINCTIVE_INTENTS = new Set<GapIntent>([
  'long-tail-decision',
  'form-extract',
  'evidence-comparison',
  'mechanism-vs-human-evidence',
  'interaction-research',
  'comparison',
  'structured-data',
  'interactive-tool',
  'evidence-synthesis',
])

const CAPABILITY_WEIGHTS: Record<NonNullable<SiteTopic['capabilities']>[number], number> = {
  'structured-data': 3,
  comparison: 3,
  'interactive-tool': 4,
  'evidence-synthesis': 4,
  'source-level-safety': 4,
}

export function normalizeTopicKey(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function inferIntent(topic: string): GapIntent {
  const value = topic.toLowerCase()
  // A topic that sets mechanism against human evidence is an evidence-distinction
  // piece, not an ingredient comparison. The generic `vs` test ran first and
  // swallowed it, routing 'mechanism vs human evidence' to `comparison` - which
  // would plan a compare page for the one boundary this site is most careful
  // about. Both concepts must be present, so 'ashwagandha vs rhodiola' is still
  // a comparison.
  if (/\b(mechanism|pathway)\b/.test(value) && /\b(human|clinical)\s+evidence\b/.test(value)) {
    return 'mechanism-vs-human-evidence'
  }
  if (/\b(vs|versus|compare|comparison)\b/.test(value)) return 'comparison'
  if (/\b(extract|glycinate|citrate|oxide|threonate|standardized|form)\b/.test(value)) return 'form-extract'
  if (/\b(interaction|together|with medication|drug)\b/.test(value)) return 'interaction-research'
  if (/\b(mechanism|pathway|human evidence|clinical evidence)\b/.test(value)) {
    return 'mechanism-vs-human-evidence'
  }
  if (/\b(which|should|better|best time|morning|night|with food|without food|how long)\b/.test(value)) {
    return 'long-tail-decision'
  }
  if (/\b(what is|definition|overview)\b/.test(value)) return 'generic-definition'
  return 'other'
}

function strongerIntent(intents: GapIntent[]): GapIntent {
  return intents.find((intent) => DISTINCTIVE_INTENTS.has(intent)) ?? intents[0] ?? 'other'
}

export function buildCompetitorContentGapReport(
  siteTopics: SiteTopic[],
  competitorTopics: TopicCoverage[],
): CompetitorGap[] {
  const siteByTopic = new Map<string, SiteTopic[]>()
  const competitorByTopic = new Map<string, TopicCoverage[]>()

  for (const item of siteTopics) {
    const key = normalizeTopicKey(item.topic)
    if (!key) continue
    const bucket = siteByTopic.get(key) ?? []
    bucket.push(item)
    siteByTopic.set(key, bucket)
  }

  for (const item of competitorTopics) {
    const key = normalizeTopicKey(item.topic)
    if (!key) continue
    const bucket = competitorByTopic.get(key) ?? []
    bucket.push(item)
    competitorByTopic.set(key, bucket)
  }

  const keys = new Set([...siteByTopic.keys(), ...competitorByTopic.keys()])
  const gaps: CompetitorGap[] = []

  for (const key of keys) {
    const site = siteByTopic.get(key) ?? []
    const competitors = competitorByTopic.get(key) ?? []
    if (!competitors.length) continue

    const topic = competitors[0]?.topic ?? site[0]?.topic ?? key
    const intents = [...competitors.map((item) => item.intent), ...site.map((item) => item.intent)].filter(
      (intent): intent is GapIntent => Boolean(intent),
    )
    const intent = strongerIntent(intents.length ? intents : [inferIntent(topic)])
    const capabilities = new Set(site.flatMap((item) => item.capabilities ?? []))
    const hasMedicalAuthority = competitors.some((item) => item.authorityTier === 'medical-authority')

    let distinctivenessScore = 0
    const reasons: string[] = []

    if (!site.length) {
      distinctivenessScore += 2
      reasons.push('Competitors cover this topic but The Hippie Scientist does not yet have a matching indexed topic.')
    } else {
      distinctivenessScore += 1
      reasons.push('The site already covers this topic, so the opportunity is to protect or deepen the winning URL.')
    }

    if (DISTINCTIVE_INTENTS.has(intent)) {
      distinctivenessScore += 5
      reasons.push('The query supports a differentiated decision, evidence, comparison, form, or interaction experience.')
    }

    for (const capability of capabilities) {
      distinctivenessScore += CAPABILITY_WEIGHTS[capability]
    }

    if (capabilities.size) {
      reasons.push(`Existing site capabilities can add a moat: ${[...capabilities].join(', ')}.`)
    }

    if (intent === 'generic-definition' && hasMedicalAuthority) {
      distinctivenessScore -= 8
      reasons.push('A medical authority already owns this generic-definition intent; avoid a me-too definition page.')
    }

    const decision: CompetitorGap['decision'] = site.length
      ? 'protect'
      : intent === 'generic-definition' && hasMedicalAuthority
        ? 'avoid-generic-head-term'
        : 'pursue'

    gaps.push({
      topic,
      normalizedTopic: key,
      competitorPublishers: [...new Set(competitors.map((item) => item.publisher))].sort(),
      competitorUrls: [...new Set(competitors.map((item) => item.url).filter((url): url is string => Boolean(url)))],
      siteUrls: [...new Set(site.map((item) => item.url))],
      intent,
      distinctivenessScore,
      decision,
      reasons,
    })
  }

  return gaps.sort(
    (a, b) =>
      (a.decision === 'pursue' ? 0 : a.decision === 'protect' ? 1 : 2) -
        (b.decision === 'pursue' ? 0 : b.decision === 'protect' ? 1 : 2) ||
      b.distinctivenessScore - a.distinctivenessScore ||
      a.normalizedTopic.localeCompare(b.normalizedTopic),
  )
}

import {
  CORE_COMPETITOR_PUBLISHERS,
  buildCompetitorContentGapReport,
  type CompetitorGap,
  type GapIntent,
  type SiteTopic,
  type TopicCoverage,
} from './competitor-content-gap'

export interface RouteManifestEntry {
  route: string
  type?: string
  meta_title?: string
  canonical_url?: string
}

export interface CompetitorCoverageDataset {
  generatedAt?: string
  methodology?: string
  topics: TopicCoverage[]
}

export interface PublisherCoverageSummary {
  publisher: string
  topicCount: number
  present: boolean
}

export interface CompetitorGapReportArtifact {
  generatedAt: string
  indexedTopicCount: number
  competitorTopicCount: number
  publisherCoverage: PublisherCoverageSummary[]
  decisionCounts: Record<CompetitorGap['decision'], number>
  gaps: CompetitorGap[]
}

const STRIP_ROUTE_PREFIXES = new Set([
  'herbs',
  'compounds',
  'guides',
  'compare',
  'safety',
  'interactions',
  'tools',
  'evidence',
  'learn',
])

function humanizeSlug(value: string): string {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function routeTopic(route: string, metaTitle?: string): string {
  const segments = route.split(/[?#]/)[0].split('/').filter(Boolean)
  const useful = segments.filter((segment, index) => index !== 0 || !STRIP_ROUTE_PREFIXES.has(segment))
  const slugTopic = humanizeSlug(useful.join(' '))
  if (slugTopic) return slugTopic

  return String(metaTitle || '')
    .replace(/\s*[|—-]\s*The Hippie Scientist.*$/i, '')
    .trim()
}

function routeIntent(route: string): GapIntent | undefined {
  const value = route.toLowerCase()
  if (value.includes('/compare/') || value === '/compare') return 'comparison'
  if (value.includes('/safety') || value.includes('/interaction')) return 'interaction-research'
  if (value.includes('/tools/')) return 'interactive-tool'
  if (value.includes('/evidence')) return 'evidence-synthesis'
  if (/\b(?:dose|dosage)\b/.test(value)) return 'long-tail-decision'
  return undefined
}

function routeCapabilities(route: string): NonNullable<SiteTopic['capabilities']> {
  const value = route.toLowerCase()
  const capabilities: NonNullable<SiteTopic['capabilities']> = []
  if (value.includes('/compare/') || value === '/compare') capabilities.push('comparison')
  if (value.includes('/tools/')) capabilities.push('interactive-tool')
  if (value.includes('/evidence')) capabilities.push('structured-data', 'evidence-synthesis')
  if (value.includes('/safety') || value.includes('/interaction')) capabilities.push('source-level-safety')
  return capabilities
}

export function siteTopicsFromRouteManifest(routes: RouteManifestEntry[]): SiteTopic[] {
  return routes
    .filter((entry) => Boolean(entry?.route))
    .map((entry) => ({
      topic: routeTopic(entry.route, entry.meta_title),
      url: entry.canonical_url || entry.route,
      intent: routeIntent(entry.route),
      capabilities: routeCapabilities(entry.route),
    }))
    .filter((entry) => Boolean(entry.topic))
}

export function summarizePublisherCoverage(topics: TopicCoverage[]): PublisherCoverageSummary[] {
  const counts = new Map<string, number>()
  for (const topic of topics) {
    const publisher = String(topic.publisher || '').trim()
    if (!publisher) continue
    counts.set(publisher, (counts.get(publisher) || 0) + 1)
  }

  const orderedPublishers = [
    ...CORE_COMPETITOR_PUBLISHERS,
    ...[...counts.keys()].filter((publisher) => !CORE_COMPETITOR_PUBLISHERS.includes(publisher as never)).sort(),
  ]

  return [...new Set(orderedPublishers)].map((publisher) => ({
    publisher,
    topicCount: counts.get(publisher) || 0,
    present: counts.has(publisher),
  }))
}

export function buildCompetitorGapArtifact(
  routes: RouteManifestEntry[],
  competitorDataset: CompetitorCoverageDataset,
  generatedAt = new Date().toISOString(),
): CompetitorGapReportArtifact {
  const siteTopics = siteTopicsFromRouteManifest(routes)
  const competitorTopics = competitorDataset.topics || []
  const gaps = buildCompetitorContentGapReport(siteTopics, competitorTopics)

  const decisionCounts: CompetitorGapReportArtifact['decisionCounts'] = {
    pursue: 0,
    protect: 0,
    'avoid-generic-head-term': 0,
  }
  for (const gap of gaps) decisionCounts[gap.decision] += 1

  return {
    generatedAt,
    indexedTopicCount: siteTopics.length,
    competitorTopicCount: competitorTopics.length,
    publisherCoverage: summarizePublisherCoverage(competitorTopics),
    decisionCounts,
    gaps,
  }
}

function markdownRows(gaps: CompetitorGap[]): string {
  if (!gaps.length) return '_None._'
  return gaps
    .map((gap) => {
      const publishers = gap.competitorPublishers.join(', ') || '—'
      const site = gap.siteUrls.join(', ') || 'Gap'
      return `| ${gap.topic.replace(/\|/g, '\\|')} | ${gap.intent} | ${gap.distinctivenessScore} | ${publishers} | ${site} |`
    })
    .join('\n')
}

export function renderCompetitorGapMarkdown(report: CompetitorGapReportArtifact): string {
  const missingCore = report.publisherCoverage
    .filter((row) => CORE_COMPETITOR_PUBLISHERS.includes(row.publisher as never) && !row.present)
    .map((row) => row.publisher)

  const sections: Array<[string, CompetitorGap['decision']]> = [
    ['Pursue: differentiated gaps', 'pursue'],
    ['Protect: topics already covered', 'protect'],
    ['Avoid: generic medical head terms', 'avoid-generic-head-term'],
  ]

  return [
    '# Competitor Content Gap Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Indexed topics analyzed: **${report.indexedTopicCount}**  `,
    `Competitor topic observations: **${report.competitorTopicCount}**  `,
    `Decisions: **${report.decisionCounts.pursue} pursue**, **${report.decisionCounts.protect} protect**, **${report.decisionCounts['avoid-generic-head-term']} avoid generic**`,
    '',
    '## Publisher coverage',
    '',
    ...report.publisherCoverage.map((row) => `- ${row.publisher}: ${row.topicCount} topic observation${row.topicCount === 1 ? '' : 's'}`),
    '',
    missingCore.length
      ? `> Coverage warning: the input dataset is missing ${missingCore.join(', ')}. Treat this report as incomplete until those publishers are sampled.`
      : '> Core comparison coverage includes Examine, NIH/NCCIH, and Healthline.',
    '',
    ...sections.flatMap(([heading, decision]) => {
      const rows = report.gaps.filter((gap) => gap.decision === decision)
      return [
        `## ${heading}`,
        '',
        '| Topic | Intent | Distinctiveness | Competitors | Hippie Scientist |',
        '|---|---|---:|---|---|',
        markdownRows(rows),
        '',
      ]
    }),
    '## Interpretation rule',
    '',
    'Prefer long-tail decisions, form/extract questions, evidence comparisons, mechanism-vs-human-evidence questions, careful interaction research, structured data, comparisons, interactive tools, and evidence synthesis. Do not create me-too generic definitions merely because an authoritative medical publisher ranks for them.',
    '',
  ].join('\n')
}

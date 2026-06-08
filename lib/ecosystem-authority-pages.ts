import { list, text, unique } from '@/lib/display-utils'
import { buildSemanticLinkSuggestions } from '@/lib/semantic-internal-linking'
import { buildResearchKnowledgeReport } from '@/lib/research-knowledge-layer'
import { buildProgrammaticTopicClusters } from '@/lib/programmatic-topic-clusters'
import type { RuntimeRecord } from '@/types/content'

export type EcosystemAuthorityPage = {
  slug: string
  title: string
  executiveSummary: string
  pathwayOverview: string[]
  beginnerGuide: string[]
  researchHighlights: string[]
  compareMatrix: {
    label: string
    bestFor: string
    evidence: string
    caution: string
  }[]
  internalLinks: ReturnType<typeof buildSemanticLinkSuggestions>
}

function slugify(value: unknown) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function recordName(record: RuntimeRecord) {
  return title(record?.displayName || record?.name || record?.slug)
}

function recordSignals(record: RuntimeRecord) {
  return unique([
    ...list(record?.best_for),
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(title).filter(Boolean))
}

export function buildEcosystemExecutiveSummary(ecosystem: string, records: RuntimeRecord[] = []) {
  const label = title(ecosystem)
  const topSignals = unique(records.flatMap(recordSignals)).slice(0, 5)

  return `${label} is best explored as an ecosystem: connected profiles, pathways, evidence maturity, safety context, and realistic expectations. Key signals include ${topSignals.join(', ') || 'mechanism, evidence, safety, and practical fit'}.`
}

export function buildEcosystemPathwayOverview(ecosystem: string, records: RuntimeRecord[] = []) {
  const signals = unique(records.flatMap(recordSignals)).slice(0, 8)

  return signals.length
    ? signals.map((signal) => `${signal}: review connected profiles, evidence context, and practical fit before choosing a supplement.`)
    : [`${title(ecosystem)}: review connected mechanisms, evidence strength, and safety considerations before drawing conclusions.`]
}

export function buildEcosystemBeginnerGuide(ecosystem: string) {
  const label = title(ecosystem)

  return [
    `Start with your goal inside the ${label} ecosystem, not with a random ingredient list.`,
    'Check which outcomes are actually supported by human evidence versus mostly mechanistic or traditional context.',
    'Compare adjacent options before stacking multiple compounds together.',
    'Review medication interactions, pregnancy status, medical conditions, and sensitivity concerns before use.',
  ]
}

export function buildEcosystemResearchHighlights(records: RuntimeRecord[] = []) {
  return records
    .map((record) => ({
      name: recordName(record),
      report: buildResearchKnowledgeReport(record),
    }))
    .sort((a, b) => b.report.evidenceWeight - a.report.evidenceWeight)
    .slice(0, 6)
    .map((item) => `${item.name}: ${item.report.summary}`)
}

export function buildEcosystemCompareMatrix(records: RuntimeRecord[] = []) {
  return records.slice(0, 8).map((record) => {
    const signals = recordSignals(record)
    const evidence = buildResearchKnowledgeReport(record)

    return {
      label: recordName(record),
      bestFor: signals.slice(0, 3).join(', ') || 'Context-dependent use',
      evidence: evidence.evidenceWeight >= 24 ? 'stronger evidence context' : evidence.evidenceWeight >= 12 ? 'developing evidence context' : 'limited evidence context',
      caution: text(record?.safety_level || record?.warnings || record?.contraindications || 'Review safety and interactions'),
    }
  })
}

export function buildEcosystemAuthorityPage(ecosystem: string, records: RuntimeRecord[] = []): EcosystemAuthorityPage {
  const seed = {
    slug: slugify(ecosystem),
    name: ecosystem,
    effects: [ecosystem],
    mechanisms: [ecosystem],
    pathways: [ecosystem],
  }

  return {
    slug: slugify(ecosystem),
    title: `${title(ecosystem)} Ecosystem Guide`,
    executiveSummary: buildEcosystemExecutiveSummary(ecosystem, records),
    pathwayOverview: buildEcosystemPathwayOverview(ecosystem, records),
    beginnerGuide: buildEcosystemBeginnerGuide(ecosystem),
    researchHighlights: buildEcosystemResearchHighlights(records),
    compareMatrix: buildEcosystemCompareMatrix(records),
    internalLinks: buildSemanticLinkSuggestions(seed, records, 12),
  }
}

export function buildPriorityEcosystemAuthorityPages(records: RuntimeRecord[] = []) {
  const priority = ['sleep', 'cognition', 'stress', 'inflammation', 'mitochondrial support', 'longevity', 'metabolic health']
  const clusters = buildProgrammaticTopicClusters(records, 24)

  return priority.map((ecosystem) => {
    const slug = slugify(ecosystem)
    const cluster = clusters.find((item) => item.slug === slug || item.signals.some((signal) => slugify(signal) === slug))
    const clusterRecords = cluster
      ? records.filter((record) => recordSignals(record).some((signal) => cluster.signals.map(slugify).includes(slugify(signal))))
      : records.filter((record) => recordSignals(record).some((signal) => slugify(signal).includes(slug) || slug.includes(slugify(signal))))

    return buildEcosystemAuthorityPage(ecosystem, clusterRecords)
  })
}

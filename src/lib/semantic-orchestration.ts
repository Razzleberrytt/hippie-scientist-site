import { list, text, unique } from '@/lib/display-utils'

export type SemanticRuntimeRecord = Record<string, unknown>

export type SemanticOrchestrationSignals = {
  evidenceScore: number
  safetyPenalty: number
  mechanismDensity: number
  outcomeDensity: number
  ecosystemDensity: number
  translationalPenalty: number
  uncertaintyPenalty: number
  authorityScore: number
  discoveryScore: number
}

export type SemanticRecommendationCandidate<T extends SemanticRuntimeRecord = SemanticRuntimeRecord> = {
  record: T
  score: number
  reasons: string[]
  signals: SemanticOrchestrationSignals
}

const STRONG_PATTERN = /strong|high|clinical|human|meta|systematic|rct/i
const MODERATE_PATTERN = /moderate|promising|developing|limited/i
const WEAK_PATTERN = /sparse|early|preliminary|insufficient|minimal|research[-\s]?pending|unknown|not specified/i
const CAUTION_PATTERN = /avoid|caution|interaction|contraindication|warning|risk|pregnancy|liver|kidney|sedat|bleed/i
const TRANSLATIONAL_PATTERN = /animal|rodent|mouse|mice|rat|in vitro|cell|preclinical|mechanistic/i
const MIXED_PATTERN = /mixed|conflict|inconsistent|heterogeneous|variable|uncertain/i

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function normalizedList(...values: unknown[]) {
  return unique(values.flatMap((value) => list(value)).map((item) => text(item)).filter(Boolean))
}

function recordCorpusText(record: SemanticRuntimeRecord) {
  return [
    text(record.name),
    text(record.slug),
    text(record.summary),
    text(record.description),
    text(record.evidence_tier),
    text(record.evidenceTier),
    text(record.confidence),
    normalizedList(record.primary_effects, record.effects, record.mechanisms, record.pathways, record.topics).join(' '),
  ].join(' ')
}

function densityScore(items: string[], divisor: number) {
  return clamp(items.length / divisor)
}

export function getSemanticOrchestrationSignals(record: SemanticRuntimeRecord): SemanticOrchestrationSignals {
  const corpus = recordCorpusText(record)
  const effects = normalizedList(record.primary_effects, record.effects, record.best_for)
  const mechanisms = normalizedList(record.mechanisms, record.pathways)
  const ecosystems = normalizedList(record.topics, record.topic_ecosystems, record.pathway_ecosystems, record.compare_groups, record.comparison_candidates)

  const evidenceScore = STRONG_PATTERN.test(corpus)
    ? 1
    : MODERATE_PATTERN.test(corpus)
      ? 0.68
      : WEAK_PATTERN.test(corpus)
        ? 0.25
        : 0.45

  const safetyPenalty = CAUTION_PATTERN.test(corpus) ? 0.28 : 0
  const translationalPenalty = TRANSLATIONAL_PATTERN.test(corpus) && !STRONG_PATTERN.test(corpus) ? 0.22 : 0
  const uncertaintyPenalty = MIXED_PATTERN.test(corpus) ? 0.18 : WEAK_PATTERN.test(corpus) ? 0.12 : 0
  const mechanismDensity = densityScore(mechanisms, 6)
  const outcomeDensity = densityScore(effects, 5)
  const ecosystemDensity = densityScore(ecosystems, 4)

  const authorityScore = clamp(
    evidenceScore * 0.45 +
    outcomeDensity * 0.18 +
    mechanismDensity * 0.15 +
    ecosystemDensity * 0.12 -
    safetyPenalty -
    translationalPenalty -
    uncertaintyPenalty,
  )

  const discoveryScore = clamp(
    evidenceScore * 0.3 +
    outcomeDensity * 0.22 +
    mechanismDensity * 0.18 +
    ecosystemDensity * 0.2 -
    safetyPenalty * 0.5 -
    translationalPenalty * 0.5 -
    uncertaintyPenalty * 0.35,
  )

  return {
    evidenceScore,
    safetyPenalty,
    mechanismDensity,
    outcomeDensity,
    ecosystemDensity,
    translationalPenalty,
    uncertaintyPenalty,
    authorityScore,
    discoveryScore,
  }
}

function overlapScore(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) return 0
  const bSet = new Set(b.map((item) => item.toLowerCase()))
  const overlap = a.filter((item) => bSet.has(item.toLowerCase())).length
  return clamp(overlap / Math.max(a.length, b.length))
}

function relationReasons(scoreParts: { effects: number; mechanisms: number; ecosystems: number; authority: number }) {
  const reasons: string[] = []

  if (scoreParts.effects > 0) reasons.push('shared outcome context')
  if (scoreParts.mechanisms > 0) reasons.push('mechanism or pathway overlap')
  if (scoreParts.ecosystems > 0) reasons.push('ecosystem continuity')
  if (scoreParts.authority >= 0.65) reasons.push('stronger authority signal')
  if (reasons.length === 0) reasons.push('semantic fallback match')

  return reasons
}

export function scoreSemanticRecommendation<T extends SemanticRuntimeRecord>(
  source: SemanticRuntimeRecord,
  candidate: T,
): SemanticRecommendationCandidate<T> {
  const sourceEffects = normalizedList(source.primary_effects, source.effects, source.best_for)
  const candidateEffects = normalizedList(candidate.primary_effects, candidate.effects, candidate.best_for)
  const sourceMechanisms = normalizedList(source.mechanisms, source.pathways)
  const candidateMechanisms = normalizedList(candidate.mechanisms, candidate.pathways)
  const sourceEcosystems = normalizedList(source.topics, source.topic_ecosystems, source.pathway_ecosystems, source.compare_groups)
  const candidateEcosystems = normalizedList(candidate.topics, candidate.topic_ecosystems, candidate.pathway_ecosystems, candidate.compare_groups)

  const signals = getSemanticOrchestrationSignals(candidate)
  const effects = overlapScore(sourceEffects, candidateEffects)
  const mechanisms = overlapScore(sourceMechanisms, candidateMechanisms)
  const ecosystems = overlapScore(sourceEcosystems, candidateEcosystems)

  const score = clamp(
    effects * 0.28 +
    mechanisms * 0.24 +
    ecosystems * 0.22 +
    signals.discoveryScore * 0.16 +
    signals.authorityScore * 0.1,
  )

  return {
    record: candidate,
    score,
    signals,
    reasons: relationReasons({ effects, mechanisms, ecosystems, authority: signals.authorityScore }),
  }
}

export function rankSemanticRecommendations<T extends SemanticRuntimeRecord>(
  source: SemanticRuntimeRecord,
  candidates: T[],
  limit = 8,
) {
  const sourceSlug = text(source.slug).toLowerCase()
  const sourceName = text(source.name).toLowerCase()

  return candidates
    .filter((candidate) => {
      const slug = text(candidate.slug).toLowerCase()
      const name = text(candidate.name).toLowerCase()
      return slug !== sourceSlug && name !== sourceName
    })
    .map((candidate) => scoreSemanticRecommendation(source, candidate))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return text(a.record.name || a.record.slug).localeCompare(text(b.record.name || b.record.slug))
    })
    .slice(0, limit)
}

import { list, text, unique } from '@/lib/display-utils'

export type SemanticRuntimeRecord = Record<string, unknown>

export type SemanticOrchestrationSignals = {
  evidenceScore: number
  safetyPenalty: number
  mechanismDensity: number
  outcomeDensity: number
  ecosystemDensity: number
  supernodeScore: number
  propagationScore: number
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
const SUPERNODE_PATTERN = /authority|supernode|hub|anchor|pillar|canonical|ecosystem/i

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
    text(record.authority_supernode),
    text(record.authoritySupernode),
    normalizedList(
      record.primary_effects,
      record.effects,
      record.mechanisms,
      record.pathways,
      record.topics,
      record.topic_ecosystems,
      record.pathway_ecosystems,
      record.authority_signals,
      record.ecosystem_anchors,
      record.supernodes,
    ).join(' '),
  ].join(' ')
}

function densityScore(items: string[], divisor: number) {
  return clamp(items.length / divisor)
}

function truthySignal(value: unknown) {
  const signal = text(value).toLowerCase()
  return signal === 'true' || signal === 'yes' || signal === '1' || signal === 'authority' || signal === 'supernode'
}

function getSupernodeScore(record: SemanticRuntimeRecord, ecosystemDensity: number) {
  const authoritySignals = normalizedList(
    record.authority_signals,
    record.authoritySignals,
    record.ecosystem_anchors,
    record.ecosystemAnchors,
    record.supernodes,
    record.topic_ecosystems,
    record.pathway_ecosystems,
  )
  const corpus = recordCorpusText(record)
  const explicitSupernode = truthySignal(record.authority_supernode) || truthySignal(record.authoritySupernode)
  const signalDensity = densityScore(authoritySignals, 5)
  const lexicalSignal = SUPERNODE_PATTERN.test(corpus) ? 0.22 : 0

  return clamp((explicitSupernode ? 0.55 : 0) + signalDensity * 0.28 + ecosystemDensity * 0.12 + lexicalSignal)
}

function getPropagationScore(record: SemanticRuntimeRecord, supernodeScore: number, ecosystemDensity: number, mechanismDensity: number) {
  const neighbors = normalizedList(
    record.semantic_neighbors,
    record.semanticNeighbors,
    record.related_topics,
    record.relatedTopics,
    record.comparison_candidates,
    record.compare_groups,
    record.pathway_companions,
  )
  const relationshipDensity = densityScore(neighbors, 8)

  return clamp(supernodeScore * 0.35 + ecosystemDensity * 0.28 + mechanismDensity * 0.18 + relationshipDensity * 0.19)
}

export function getSemanticOrchestrationSignals(record: SemanticRuntimeRecord): SemanticOrchestrationSignals {
  const corpus = recordCorpusText(record)
  const effects = normalizedList(record.primary_effects, record.effects, record.best_for)
  const mechanisms = normalizedList(record.mechanisms, record.pathways)
  const ecosystems = normalizedList(
    record.topics,
    record.topic_ecosystems,
    record.pathway_ecosystems,
    record.compare_groups,
    record.comparison_candidates,
    record.ecosystem_anchors,
    record.authority_signals,
  )

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
  const ecosystemDensity = densityScore(ecosystems, 6)
  const supernodeScore = getSupernodeScore(record, ecosystemDensity)
  const propagationScore = getPropagationScore(record, supernodeScore, ecosystemDensity, mechanismDensity)

  const authorityScore = clamp(
    evidenceScore * 0.36 +
    outcomeDensity * 0.16 +
    mechanismDensity * 0.13 +
    ecosystemDensity * 0.11 +
    supernodeScore * 0.14 +
    propagationScore * 0.1 -
    safetyPenalty -
    translationalPenalty -
    uncertaintyPenalty,
  )

  const discoveryScore = clamp(
    evidenceScore * 0.25 +
    outcomeDensity * 0.2 +
    mechanismDensity * 0.16 +
    ecosystemDensity * 0.17 +
    supernodeScore * 0.09 +
    propagationScore * 0.13 -
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
    supernodeScore,
    propagationScore,
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

function relationReasons(scoreParts: { effects: number; mechanisms: number; ecosystems: number; authority: number; supernode: number; propagation: number }) {
  const reasons: string[] = []

  if (scoreParts.effects > 0) reasons.push('shared outcome context')
  if (scoreParts.mechanisms > 0) reasons.push('mechanism or pathway overlap')
  if (scoreParts.ecosystems > 0) reasons.push('ecosystem continuity')
  if (scoreParts.authority >= 0.65) reasons.push('stronger authority signal')
  if (scoreParts.supernode >= 0.5) reasons.push('authority supernode proximity')
  if (scoreParts.propagation >= 0.5) reasons.push('graph propagation continuity')
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
  const sourceEcosystems = normalizedList(source.topics, source.topic_ecosystems, source.pathway_ecosystems, source.compare_groups, source.ecosystem_anchors)
  const candidateEcosystems = normalizedList(candidate.topics, candidate.topic_ecosystems, candidate.pathway_ecosystems, candidate.compare_groups, candidate.ecosystem_anchors)

  const signals = getSemanticOrchestrationSignals(candidate)
  const effects = overlapScore(sourceEffects, candidateEffects)
  const mechanisms = overlapScore(sourceMechanisms, candidateMechanisms)
  const ecosystems = overlapScore(sourceEcosystems, candidateEcosystems)

  const score = clamp(
    effects * 0.24 +
    mechanisms * 0.21 +
    ecosystems * 0.2 +
    signals.discoveryScore * 0.14 +
    signals.authorityScore * 0.09 +
    signals.supernodeScore * 0.06 +
    signals.propagationScore * 0.06,
  )

  return {
    record: candidate,
    score,
    signals,
    reasons: relationReasons({
      effects,
      mechanisms,
      ecosystems,
      authority: signals.authorityScore,
      supernode: signals.supernodeScore,
      propagation: signals.propagationScore,
    }),
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
      if (b.signals.propagationScore !== a.signals.propagationScore) return b.signals.propagationScore - a.signals.propagationScore
      if (b.signals.supernodeScore !== a.signals.supernodeScore) return b.signals.supernodeScore - a.signals.supernodeScore
      return text(a.record.name || a.record.slug).localeCompare(text(b.record.name || b.record.slug))
    })
    .slice(0, limit)
}

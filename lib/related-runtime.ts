import { list, text, unique } from '@/lib/display-utils'
import { safeArray, safeLower, safeScore, safeSlug } from '@/lib/search-safe'
import { calculateDiscoveryScore } from '@/lib/discovery-score'

const MAX_RELATED_PROFILES = 6
const MAX_COMPARISON_CANDIDATES = 4
const MAX_STACK_CANDIDATES = 4

type RuntimeRecord = Record<string, any>

function clampLimit(value: unknown, fallback: number, max: number) {
  const parsed = safeScore(value, fallback)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(0, Math.floor(parsed)))
}

function normalize(value: unknown) {
  return safeLower(value)
}

function normalizeSignals(values: unknown[]) {
  return unique(values.flatMap((value) => list(value)).map(normalize).filter(Boolean))
}

function collectEcosystemSignals(record: RuntimeRecord) {
  return normalizeSignals([
    record?.topic_clusters,
    record?.ecosystem_tags,
    record?.pathway_companions,
    record?.comparison_candidates,
    record?.synergy_relationships,
    record?.authority_supernode,
    record?.semantic_neighbors,
    record?.ecosystem_anchors,
    record?.related_topics,
    record?.pathway_ecosystems,
    record?.mechanism_ecosystems,
    record?.clusters,
    record?.compound_cluster,
    record?.comparison_group,
    record?.internal_link_cluster,
    record?.herb_internal_link_cluster,
    record?.pathway_bucket,
    record?.pathways_v2,
  ])
}

function collectSignals(record: RuntimeRecord) {
  return normalizeSignals([
    record?.primary_effects,
    record?.primaryEffects,
    record?.effects,
    record?.secondary_effects,
    record?.mechanism,
    record?.mechanisms,
    record?.mechanism_targets,
    record?.pathways,
    record?.pathwayTargets,
    record?.mechanismTags,
    record?.topics,
    record?.topicTags,
    record?.targets,
    record?.biologicalTargets,
    record?.compoundClass,
    record?.compound_class,
    record?.class,
    record?.foundIn,
    record?.activeCompounds,
    record?.active_constituents,
    record?.traditionalUses,
    record?.traditional_uses,
    collectEcosystemSignals(record),
  ])
}

function explicitRelatedSlugs(record: RuntimeRecord) {
  return unique([
    ...list(record?.related_compounds),
    ...list(record?.related_herbs),
    ...list(record?.semantic_neighbors),
    ...list(record?.comparison_candidates),
    ...list(record?.synergy_relationships),
    ...list(record?.pathway_companions),
  ].map(safeSlug).filter(Boolean))
}

function overlapSignals(sourceSignals: string[], candidateSignals: string[]) {
  const source = new Set(sourceSignals)
  return unique(candidateSignals.filter((signal) => source.has(signal)))
}

function scoreRecord(source: RuntimeRecord, candidate: RuntimeRecord, overlap: string[], explicitSlugs: string[]) {
  const candidateSlug = safeSlug(candidate?.slug)
  const explicitBoost = explicitSlugs.includes(candidateSlug) ? 8 : 0
  const evidenceBoost = text(candidate?.evidence_grade || candidate?.evidence_tier || candidate?.evidence_level) ? 1 : 0
  const authorityBoost = text(candidate?.authority_status || candidate?.evidence_authority_status || candidate?.authority_supernode) ? 1 : 0

  return (
    overlap.length * 3 +
    explicitBoost +
    evidenceBoost +
    authorityBoost +
    calculateDiscoveryScore(source, candidate)
  )
}

function sortRelated(a: RuntimeRecord, b: RuntimeRecord) {
  const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)
  if (scoreDelta !== 0) return scoreDelta

  const nameDelta = safeLower(a?.name).localeCompare(safeLower(b?.name))
  if (nameDelta !== 0) return nameDelta

  return safeSlug(a?.slug).localeCompare(safeSlug(b?.slug))
}

function enrichRelatedRecord(source: RuntimeRecord, candidate: RuntimeRecord, sourceSignals: string[], explicitSlugs: string[]) {
  const candidateSignals = collectSignals(candidate)
  const overlap = overlapSignals(sourceSignals, candidateSignals)
  const relatedGraphKinds = []

  if (explicitSlugs.includes(safeSlug(candidate?.slug))) {
    relatedGraphKinds.push('workbook-explicit')
  }

  if (overlap.some((signal) => collectEcosystemSignals(source).includes(signal))) {
    relatedGraphKinds.push('ecosystem')
  }

  return {
    ...candidate,
    relatedOverlap: overlap,
    relatedGraphKinds,
    relatedScore: scoreRecord(source, candidate, overlap, explicitSlugs),
  }
}

export function getRelatedRuntimeRecords(record: RuntimeRecord, records: RuntimeRecord[], limit = MAX_RELATED_PROFILES) {
  const sourceSlug = safeSlug(record?.slug)
  const sourceSignals = collectSignals(record)
  const explicitSlugs = explicitRelatedSlugs(record)
  const requestedLimit = clampLimit(limit, MAX_RELATED_PROFILES, MAX_RELATED_PROFILES)

  if (!sourceSlug || requestedLimit === 0) return []

  const seen = new Set<string>()

  return safeArray<RuntimeRecord>(records)
    .map((candidate) => {
      const candidateSlug = safeSlug(candidate?.slug)
      if (!candidate || !candidateSlug || candidateSlug === sourceSlug || seen.has(candidateSlug)) return null

      const enriched = enrichRelatedRecord(record, candidate, sourceSignals, explicitSlugs)
      const hasSignalOverlap = safeArray(enriched.relatedOverlap).length > 0
      const isExplicit = explicitSlugs.includes(candidateSlug)

      if (!hasSignalOverlap && !isExplicit) return null

      seen.add(candidateSlug)
      return enriched
    })
    .filter(Boolean)
    .sort(sortRelated)
    .slice(0, requestedLimit)
}

function candidateList(record: RuntimeRecord, kind: 'comparison' | 'stack') {
  if (kind === 'comparison') {
    return unique([
      ...list(record?.comparison_candidates),
      ...list(record?.semantic_neighbors),
      ...list(record?.related_compounds),
      ...list(record?.related_herbs),
    ].map(safeSlug).filter(Boolean))
  }

  return unique([
    ...list(record?.synergy_relationships),
    ...list(record?.pathway_companions),
    ...list(record?.semantic_neighbors),
    ...list(record?.related_compounds),
    ...list(record?.related_herbs),
  ].map(safeSlug).filter(Boolean))
}

function getCandidateRuntimeRecords(record: RuntimeRecord, records: RuntimeRecord[], kind: 'comparison' | 'stack', limit: number) {
  const sourceSlug = safeSlug(record?.slug)
  const requestedLimit = clampLimit(
    limit,
    kind === 'comparison' ? MAX_COMPARISON_CANDIDATES : MAX_STACK_CANDIDATES,
    kind === 'comparison' ? MAX_COMPARISON_CANDIDATES : MAX_STACK_CANDIDATES
  )

  if (!sourceSlug || requestedLimit === 0) return []

  const preferred = candidateList(record, kind)
  const related = getRelatedRuntimeRecords(record, records, MAX_RELATED_PROFILES)
  const orderedSlugs = unique([...preferred, ...related.map((item) => safeSlug(item?.slug))].filter(Boolean))
  const bySlug = new Map(safeArray<RuntimeRecord>(records).map((item) => [safeSlug(item?.slug), item]))
  const sourceSignals = collectSignals(record)

  return orderedSlugs
    .map((slug) => bySlug.get(slug))
    .filter(Boolean)
    .filter((candidate) => safeSlug(candidate?.slug) !== sourceSlug)
    .map((candidate) => {
      const enriched = enrichRelatedRecord(record, candidate as RuntimeRecord, sourceSignals, preferred)
      return {
        ...enriched,
        graphCandidateType: kind,
        relatedGraphKinds: unique([
          ...safeArray<string>(enriched.relatedGraphKinds),
          kind === 'comparison' ? 'comparison-candidate' : 'stack-candidate',
        ]),
      }
    })
    .sort(sortRelated)
    .slice(0, requestedLimit)
}

export function getComparisonRuntimeRecords(record: RuntimeRecord, records: RuntimeRecord[], limit = MAX_COMPARISON_CANDIDATES) {
  return getCandidateRuntimeRecords(record, records, 'comparison', limit)
}

export function getStackRuntimeRecords(record: RuntimeRecord, records: RuntimeRecord[], limit = MAX_STACK_CANDIDATES) {
  return getCandidateRuntimeRecords(record, records, 'stack', limit)
}

export function getRelatedLabel(record: RuntimeRecord) {
  const primary = collectSignals(record)[0]
  return primary ? `Related to ${text(primary)}` : 'Related Research Profiles'
}

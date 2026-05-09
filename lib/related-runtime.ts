import { list, text, unique } from '@/lib/display-utils'
import { safeArray, safeLower, safeScore, safeSlug } from '@/lib/search-safe'
import { calculateDiscoveryScore } from '@/lib/discovery-score'

const MAX_RELATED_PROFILES = 6
const MAX_COMPARISON_CANDIDATES = 4
const MAX_STACK_CANDIDATES = 4
const MAX_RELATED_CANDIDATE_POOL = 60
const MAX_GRAPH_CANDIDATE_POOL = 40

type RuntimeRecord = Record<string, any>

type EnrichedRuntimeRecord = RuntimeRecord & {
  relatedOverlap: string[]
  relatedGraphKinds: string[]
  relatedScore: number
}

type SignalBundle = {
  ecosystem: string[]
  mechanisms: string[]
  pathways: string[]
  all: string[]
  explicitSlugs: string[]
}

type RuntimeRecordIndex = {
  bySlug: Map<string, RuntimeRecord>
  byEcosystemSignal: Map<string, RuntimeRecord[]>
  byMechanismSignal: Map<string, RuntimeRecord[]>
  byPathwaySignal: Map<string, RuntimeRecord[]>
}

const signalCache = new WeakMap<RuntimeRecord, SignalBundle>()
const recordIndexCache = new WeakMap<RuntimeRecord[], RuntimeRecordIndex>()

function clampLimit(value: unknown, fallback: number, max: number) {
  const parsed = safeScore(value, fallback)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(0, Math.floor(parsed)))
}

function normalize(value: unknown) {
  return safeLower(value)
}

function normalizeSignals(values: unknown[]) {
  const seen = new Set<string>()
  const signals: string[] = []

  for (const value of values) {
    for (const item of list(value)) {
      const normalized = normalize(item)
      if (!normalized || seen.has(normalized)) continue
      seen.add(normalized)
      signals.push(normalized)
    }
  }

  return signals
}

function collectEcosystemSignalsUncached(record: RuntimeRecord) {
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

function collectMechanismSignalsUncached(record: RuntimeRecord) {
  return normalizeSignals([
    record?.mechanism,
    record?.mechanisms,
    record?.mechanism_targets,
    record?.mechanismTags,
    record?.targets,
    record?.biologicalTargets,
    record?.mechanism_ecosystems,
  ])
}

function collectPathwaySignalsUncached(record: RuntimeRecord) {
  return normalizeSignals([
    record?.pathways,
    record?.pathwayTargets,
    record?.pathways_v2,
    record?.pathway_bucket,
    record?.pathway_ecosystems,
    record?.pathway_companions,
  ])
}

function explicitRelatedSlugsUncached(record: RuntimeRecord) {
  const seen = new Set<string>()
  const slugs: string[] = []

  for (const value of [
    record?.related_compounds,
    record?.related_herbs,
    record?.semantic_neighbors,
    record?.comparison_candidates,
    record?.synergy_relationships,
    record?.pathway_companions,
  ]) {
    for (const item of list(value)) {
      const slug = safeSlug(item)
      if (!slug || seen.has(slug)) continue
      seen.add(slug)
      slugs.push(slug)
    }
  }

  return slugs
}

function getSignalBundle(record: RuntimeRecord): SignalBundle {
  const cached = record && signalCache.get(record)
  if (cached) return cached

  const ecosystem = collectEcosystemSignalsUncached(record)
  const mechanisms = collectMechanismSignalsUncached(record)
  const pathways = collectPathwaySignalsUncached(record)
  const all = normalizeSignals([
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
    ecosystem,
  ])
  const bundle = {
    ecosystem,
    mechanisms,
    pathways,
    all,
    explicitSlugs: explicitRelatedSlugsUncached(record),
  }

  if (record && typeof record === 'object') signalCache.set(record, bundle)
  return bundle
}

function collectEcosystemSignals(record: RuntimeRecord) {
  return getSignalBundle(record).ecosystem
}

function collectSignals(record: RuntimeRecord) {
  return getSignalBundle(record).all
}

function explicitRelatedSlugs(record: RuntimeRecord) {
  return getSignalBundle(record).explicitSlugs
}

function addIndexedSignal(index: Map<string, RuntimeRecord[]>, signal: string, record: RuntimeRecord) {
  const rows = index.get(signal)
  if (rows) {
    rows.push(record)
    return
  }
  index.set(signal, [record])
}

function getRuntimeRecordIndex(records: RuntimeRecord[]) {
  const cached = recordIndexCache.get(records)
  if (cached) return cached

  const index: RuntimeRecordIndex = {
    bySlug: new Map(),
    byEcosystemSignal: new Map(),
    byMechanismSignal: new Map(),
    byPathwaySignal: new Map(),
  }

  for (const record of safeArray<RuntimeRecord>(records)) {
    const slug = safeSlug(record?.slug)
    if (slug && !index.bySlug.has(slug)) index.bySlug.set(slug, record)

    const signals = getSignalBundle(record)
    for (const signal of signals.ecosystem) addIndexedSignal(index.byEcosystemSignal, signal, record)
    for (const signal of signals.mechanisms) addIndexedSignal(index.byMechanismSignal, signal, record)
    for (const signal of signals.pathways) addIndexedSignal(index.byPathwaySignal, signal, record)
  }

  recordIndexCache.set(records, index)
  return index
}

function addCandidate(candidates: RuntimeRecord[], seen: Set<string>, sourceSlug: string, candidate: RuntimeRecord | undefined, max: number) {
  if (candidates.length >= max) return
  const slug = safeSlug(candidate?.slug)
  if (!candidate || !slug || slug === sourceSlug || seen.has(slug)) return
  seen.add(slug)
  candidates.push(candidate)
}

function addCandidatesForSignals(candidates: RuntimeRecord[], seen: Set<string>, sourceSlug: string, signalIndex: Map<string, RuntimeRecord[]>, signals: string[], max: number) {
  for (const signal of signals) {
    const rows = signalIndex.get(signal)
    if (!rows) continue
    for (const row of rows) {
      addCandidate(candidates, seen, sourceSlug, row, max)
      if (candidates.length >= max) return
    }
  }
}

function getRelatedCandidatePool(record: RuntimeRecord, records: RuntimeRecord[], max = MAX_RELATED_CANDIDATE_POOL) {
  const sourceSlug = safeSlug(record?.slug)
  if (!sourceSlug || max <= 0) return []

  const index = getRuntimeRecordIndex(records)
  const sourceSignals = getSignalBundle(record)
  const candidates: RuntimeRecord[] = []
  const seen = new Set<string>()

  for (const slug of sourceSignals.explicitSlugs) {
    addCandidate(candidates, seen, sourceSlug, index.bySlug.get(slug), max)
  }

  addCandidatesForSignals(candidates, seen, sourceSlug, index.byEcosystemSignal, sourceSignals.ecosystem, max)
  addCandidatesForSignals(candidates, seen, sourceSlug, index.byMechanismSignal, sourceSignals.mechanisms, max)
  addCandidatesForSignals(candidates, seen, sourceSlug, index.byPathwaySignal, sourceSignals.pathways, max)

  return candidates
}

function overlapWithSet(candidateSignals: string[], sourceSet: Set<string>) {
  const overlap: string[] = []
  const seen = new Set<string>()

  for (const signal of candidateSignals) {
    if (!sourceSet.has(signal) || seen.has(signal)) continue
    seen.add(signal)
    overlap.push(signal)
  }

  return overlap
}

function hasOverlap(candidateSignals: string[], sourceSet: Set<string>) {
  return candidateSignals.some((signal) => sourceSet.has(signal))
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

function sortRelated(a: EnrichedRuntimeRecord, b: EnrichedRuntimeRecord) {
  const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)
  if (scoreDelta !== 0) return scoreDelta

  const nameDelta = safeLower(a?.name).localeCompare(safeLower(b?.name))
  if (nameDelta !== 0) return nameDelta

  return safeSlug(a?.slug).localeCompare(safeSlug(b?.slug))
}

function enrichRelatedRecord(source: RuntimeRecord, candidate: RuntimeRecord, sourceSignals: SignalBundle, explicitSlugs: string[]): EnrichedRuntimeRecord | null {
  const candidateSignals = getSignalBundle(candidate)
  const explicit = explicitSlugs.includes(safeSlug(candidate?.slug))
  const sourceEcosystemSet = new Set(sourceSignals.ecosystem)
  const sourceMechanismSet = new Set(sourceSignals.mechanisms)
  const sourcePathwaySet = new Set(sourceSignals.pathways)

  const hasEcosystemOverlap = hasOverlap(candidateSignals.ecosystem, sourceEcosystemSet)
  const hasMechanismOverlap = hasOverlap(candidateSignals.mechanisms, sourceMechanismSet)
  const hasPathwayOverlap = hasOverlap(candidateSignals.pathways, sourcePathwaySet)

  if (!explicit && !hasEcosystemOverlap && !hasMechanismOverlap && !hasPathwayOverlap) return null

  const overlap = overlapWithSet(candidateSignals.all, new Set(sourceSignals.all))
  const relatedGraphKinds: string[] = []

  if (explicit) relatedGraphKinds.push('workbook-explicit')
  if (hasEcosystemOverlap) relatedGraphKinds.push('ecosystem')

  return {
    ...candidate,
    relatedOverlap: overlap,
    relatedGraphKinds,
    relatedScore: scoreRecord(source, candidate, overlap, explicitSlugs),
  }
}

function isEnrichedRuntimeRecord(value: unknown): value is EnrichedRuntimeRecord {
  return Boolean(value && typeof value === 'object')
}

export function getRelatedRuntimeRecords(record: RuntimeRecord, records: RuntimeRecord[], limit = MAX_RELATED_PROFILES) {
  const sourceSlug = safeSlug(record?.slug)
  const sourceSignals = getSignalBundle(record)
  const explicitSlugs = sourceSignals.explicitSlugs
  const requestedLimit = clampLimit(limit, MAX_RELATED_PROFILES, MAX_RELATED_PROFILES)

  if (!sourceSlug || requestedLimit === 0) return []

  return getRelatedCandidatePool(record, records, MAX_RELATED_CANDIDATE_POOL)
    .map((candidate) => enrichRelatedRecord(record, candidate, sourceSignals, explicitSlugs))
    .filter(isEnrichedRuntimeRecord)
    .sort(sortRelated)
    .slice(0, requestedLimit)
}

function candidateList(record: RuntimeRecord, kind: 'comparison' | 'stack') {
  const values = kind === 'comparison'
    ? [
        record?.comparison_candidates,
        record?.semantic_neighbors,
        record?.related_compounds,
        record?.related_herbs,
      ]
    : [
        record?.synergy_relationships,
        record?.pathway_companions,
        record?.semantic_neighbors,
        record?.related_compounds,
        record?.related_herbs,
      ]

  const seen = new Set<string>()
  const slugs: string[] = []

  for (const value of values) {
    for (const item of list(value)) {
      const slug = safeSlug(item)
      if (!slug || seen.has(slug)) continue
      seen.add(slug)
      slugs.push(slug)
      if (slugs.length >= MAX_GRAPH_CANDIDATE_POOL) return slugs
    }
  }

  return slugs
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
  const index = getRuntimeRecordIndex(records)
  const sourceSignals = getSignalBundle(record)
  const candidates: RuntimeRecord[] = []
  const seen = new Set<string>()

  for (const slug of preferred) {
    addCandidate(candidates, seen, sourceSlug, index.bySlug.get(slug), MAX_GRAPH_CANDIDATE_POOL)
  }

  for (const candidate of getRelatedCandidatePool(record, records, MAX_GRAPH_CANDIDATE_POOL)) {
    addCandidate(candidates, seen, sourceSlug, candidate, MAX_GRAPH_CANDIDATE_POOL)
  }

  return candidates
    .map((candidate) => enrichRelatedRecord(record, candidate, sourceSignals, preferred))
    .filter(isEnrichedRuntimeRecord)
    .map((enriched) => ({
      ...enriched,
      graphCandidateType: kind,
      relatedGraphKinds: unique([
        ...safeArray<string>(enriched.relatedGraphKinds),
        kind === 'comparison' ? 'comparison-candidate' : 'stack-candidate',
      ]),
    }))
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

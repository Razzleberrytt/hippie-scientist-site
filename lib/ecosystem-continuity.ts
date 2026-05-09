import { formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { loadRuntimeGraph, type GraphEcosystem } from '@/lib/runtime-graph'
import { safeArray, safeLower, safeScore, safeSlug } from '@/lib/search-safe'

const MAX_ECOSYSTEM_CONTINUITY_RECORDS = 6
const MAX_MATCHED_ECOSYSTEMS = 6
const MAX_CONTINUITY_CANDIDATE_POOL = 60

type EcosystemSignalBundle = {
  entityKeys: string[]
  signals: string[]
  displayOverlap: string[]
  densityScore: number
  sortKey: string
}

type ContinuityRecordIndex = {
  bySlug: Map<string, any>
  bySignal: Map<string, any[]>
}

const profileSignalCache = new WeakMap<any, string[]>()
const ecosystemSignalCache = new WeakMap<GraphEcosystem, EcosystemSignalBundle>()
const recordIndexCache = new WeakMap<any[], ContinuityRecordIndex>()

function normalizeKey(value: unknown) {
  return safeLower(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function collectProfileSignals(record: any): string[] {
  const cached = record && profileSignalCache.get(record)
  if (cached) return cached

  const seen = new Set<string>()
  const signals: string[] = []

  for (const value of [
    record?.topics,
    record?.topicTags,
    record?.pathways,
    record?.pathwayTargets,
    record?.mechanisms,
    record?.mechanismTags,
    record?.primary_effects,
    record?.effects,
  ]) {
    for (const item of list(value)) {
      const signal = normalizeKey(item)
      if (!signal || seen.has(signal)) continue
      seen.add(signal)
      signals.push(signal)
    }
  }

  if (record && typeof record === 'object') profileSignalCache.set(record, signals)
  return signals
}

function numeric(value: unknown) {
  const parsed = Number(text(value))
  return Number.isFinite(parsed) ? parsed : 0
}

function sharedCount(left: string[], rightSet: Set<string>) {
  let count = 0
  for (const value of left) {
    if (rightSet.has(value)) count += 1
  }
  return count
}

function ecosystemBundle(ecosystem: GraphEcosystem): EcosystemSignalBundle {
  const cached = ecosystemSignalCache.get(ecosystem)
  if (cached) return cached

  const entityKeys = unique([
    text(ecosystem.slug),
    text(ecosystem.id),
    text(ecosystem.name),
    ...list(ecosystem.anchors),
    ...list(ecosystem.herbs),
    ...list(ecosystem.compounds),
    ...list(ecosystem.companions),
  ])
    .map(normalizeKey)
    .filter(Boolean)

  const signals = unique([
    text(ecosystem.name),
    text(ecosystem.kind),
    ...list(ecosystem.topics),
    ...list(ecosystem.pathways),
    ...list(ecosystem.mechanisms),
    ...list(ecosystem.related_pathways),
  ])
    .map(normalizeKey)
    .filter(Boolean)

  const displayOverlap = unique([
    formatDisplayLabel(ecosystem.name || ecosystem.slug || ecosystem.id),
    ...list(ecosystem.topics).slice(0, 2),
    ...list(ecosystem.pathways).slice(0, 2),
  ])
    .map(formatDisplayLabel)
    .filter(isClean)
    .slice(0, 4)

  const bundle = {
    entityKeys,
    signals,
    displayOverlap,
    densityScore: Math.min(numeric(ecosystem.relationship_density) / 25, 4) + Math.min(numeric(ecosystem.graph_score) / 50, 2),
    sortKey: safeLower(ecosystem.name || ecosystem.slug || ecosystem.id),
  }
  ecosystemSignalCache.set(ecosystem, bundle)
  return bundle
}

function addIndexedSignal(index: Map<string, any[]>, signal: string, record: any) {
  const rows = index.get(signal)
  if (rows) {
    rows.push(record)
    return
  }
  index.set(signal, [record])
}

function getContinuityRecordIndex(records: any[]) {
  const cached = recordIndexCache.get(records)
  if (cached) return cached

  const index: ContinuityRecordIndex = {
    bySlug: new Map(),
    bySignal: new Map(),
  }

  for (const record of safeArray<any>(records)) {
    const slug = safeSlug(record?.slug)
    if (slug && !index.bySlug.has(slug)) index.bySlug.set(slug, record)
    for (const signal of collectProfileSignals(record)) addIndexedSignal(index.bySignal, signal, record)
  }

  recordIndexCache.set(records, index)
  return index
}

function ecosystemScore(record: any, ecosystem: GraphEcosystem, sourceSignals = collectProfileSignals(record)) {
  const sourceSlug = safeSlug(record?.slug)
  const bundle = ecosystemBundle(ecosystem)
  const entitySet = new Set(bundle.entityKeys)
  const signalSet = new Set(bundle.signals)

  const directMatch = sourceSlug && entitySet.has(sourceSlug) ? 8 : 0
  const signalMatch = sharedCount(sourceSignals, signalSet)

  return directMatch + signalMatch * 2 + bundle.densityScore
}

function candidateScore(candidate: any, matchedEcosystems: GraphEcosystem[], sourceSignalSet: Set<string>) {
  const candidateSlug = safeSlug(candidate?.slug)
  const candidateSignals = collectProfileSignals(candidate)

  let score = 0
  for (const ecosystem of matchedEcosystems) {
    const bundle = ecosystemBundle(ecosystem)
    const entityMatch = candidateSlug && bundle.entityKeys.includes(candidateSlug) ? 8 : 0
    const signalSet = new Set(bundle.signals)
    const signalMatch = sharedCount(candidateSignals, signalSet)
    const sourceContinuity = sharedCount(bundle.signals, sourceSignalSet)

    score += entityMatch + signalMatch * 2 + sourceContinuity
  }

  return score
}

function sortByScoreThenName(a: any, b: any) {
  const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)
  if (scoreDelta !== 0) return scoreDelta

  const nameDelta = safeLower(a?.name || a?.slug).localeCompare(safeLower(b?.name || b?.slug))
  if (nameDelta !== 0) return nameDelta

  return safeSlug(a?.slug).localeCompare(safeSlug(b?.slug))
}

function capLimit(limit: number | undefined) {
  return Math.min(MAX_ECOSYSTEM_CONTINUITY_RECORDS, Math.max(0, safeScore(limit, MAX_ECOSYSTEM_CONTINUITY_RECORDS)))
}

function addCandidate(candidates: any[], seen: Set<string>, sourceSlug: string, candidate: any) {
  if (candidates.length >= MAX_CONTINUITY_CANDIDATE_POOL) return
  const slug = safeSlug(candidate?.slug)
  if (!candidate || !slug || slug === sourceSlug || seen.has(slug)) return
  seen.add(slug)
  candidates.push(candidate)
}

function getContinuityCandidatePool(record: any, records: any[], matchedEcosystems: GraphEcosystem[]) {
  const sourceSlug = safeSlug(record?.slug)
  const index = getContinuityRecordIndex(records)
  const candidates: any[] = []
  const seen = new Set<string>()

  for (const ecosystem of matchedEcosystems) {
    const bundle = ecosystemBundle(ecosystem)
    for (const key of bundle.entityKeys) {
      addCandidate(candidates, seen, sourceSlug, index.bySlug.get(key))
      if (candidates.length >= MAX_CONTINUITY_CANDIDATE_POOL) return candidates
    }
  }

  for (const ecosystem of matchedEcosystems) {
    for (const signal of ecosystemBundle(ecosystem).signals) {
      const rows = index.bySignal.get(signal)
      if (!rows) continue
      for (const row of rows) {
        addCandidate(candidates, seen, sourceSlug, row)
        if (candidates.length >= MAX_CONTINUITY_CANDIDATE_POOL) return candidates
      }
    }
  }

  return candidates
}

export function getMatchedEcosystemsForRecord(record: any, limit = MAX_MATCHED_ECOSYSTEMS) {
  const graph = loadRuntimeGraph()
  const ecosystems = [
    ...safeArray(graph.topics),
    ...safeArray(graph.pathways),
    ...safeArray(graph.supernodes),
  ] as GraphEcosystem[]
  const sourceSignals = collectProfileSignals(record)

  return ecosystems
    .map((ecosystem) => ({ ecosystem, score: ecosystemScore(record, ecosystem, sourceSignals), sortKey: ecosystemBundle(ecosystem).sortKey }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      const scoreDelta = b.score - a.score
      if (scoreDelta !== 0) return scoreDelta
      return a.sortKey.localeCompare(b.sortKey)
    })
    .slice(0, Math.max(0, safeScore(limit, MAX_MATCHED_ECOSYSTEMS)))
    .map((item) => item.ecosystem)
}

export function getEcosystemContinuityRecords(record: any, records: any[], limit = MAX_ECOSYSTEM_CONTINUITY_RECORDS) {
  const sourceSlug = safeSlug(record?.slug)
  const requestedLimit = capLimit(limit)
  const matchedEcosystems = getMatchedEcosystemsForRecord(record)
  const sourceSignals = collectProfileSignals(record)
  const sourceSignalSet = new Set(sourceSignals)

  if (!sourceSlug || requestedLimit === 0 || matchedEcosystems.length === 0) return []

  const overlap = unique(matchedEcosystems.flatMap((ecosystem) => ecosystemBundle(ecosystem).displayOverlap)).slice(0, 4)

  return getContinuityCandidatePool(record, records, matchedEcosystems)
    .map((candidate: any) => {
      const score = candidateScore(candidate, matchedEcosystems, sourceSignalSet)
      if (score <= 0) return null

      return {
        ...candidate,
        relatedOverlap: unique([...list(candidate?.relatedOverlap), ...overlap]).slice(0, 6),
        relatedGraphKinds: unique([...list(candidate?.relatedGraphKinds), 'ecosystem-continuity', 'authority-hub']).slice(0, 4),
        graphEcosystemOverlap: overlap,
        graphCandidateRationale:
          text(candidate?.graphCandidateRationale) ||
          'Connected through topic ecosystems, pathway ecosystems, or authority hubs; shown as discovery context only.',
        relatedScore: safeScore(candidate?.relatedScore) + score,
      }
    })
    .filter(Boolean)
    .sort(sortByScoreThenName)
    .slice(0, requestedLimit)
}

export function mergeEcosystemContinuityRecords(primaryRecords: any[], continuityRecords: any[], limit = MAX_ECOSYSTEM_CONTINUITY_RECORDS) {
  const requestedLimit = capLimit(limit)
  const bySlug = new Map<string, any>()

  const mergedRecords = [
    ...safeArray(primaryRecords),
    ...safeArray(continuityRecords),
  ] as any[]

  for (const item of mergedRecords.sort(sortByScoreThenName)) {
    const slug = safeSlug(item?.slug)
    if (!slug || bySlug.has(slug)) continue
    bySlug.set(slug, item)
  }

  return [...bySlug.values()].sort(sortByScoreThenName).slice(0, requestedLimit)
}

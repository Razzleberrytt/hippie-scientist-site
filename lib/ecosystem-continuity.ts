import { formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { loadRuntimeGraph, type GraphEcosystem } from '@/lib/runtime-graph'
import { safeArray, safeLower, safeScore, safeSlug } from '@/lib/search-safe'

const MAX_ECOSYSTEM_CONTINUITY_RECORDS = 6
const MAX_MATCHED_ECOSYSTEMS = 6

function normalizeKey(value: unknown) {
  return safeLower(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function collectProfileSignals(record: any) {
  return unique([
    ...list(record?.topics),
    ...list(record?.topicTags),
    ...list(record?.pathways),
    ...list(record?.pathwayTargets),
    ...list(record?.mechanisms),
    ...list(record?.mechanismTags),
    ...list(record?.primary_effects),
    ...list(record?.effects),
  ])
    .map(normalizeKey)
    .filter(Boolean)
}

function ecosystemEntityKeys(ecosystem: GraphEcosystem) {
  return unique([
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
}

function ecosystemSignals(ecosystem: GraphEcosystem) {
  return unique([
    text(ecosystem.name),
    text(ecosystem.kind),
    ...list(ecosystem.topics),
    ...list(ecosystem.pathways),
    ...list(ecosystem.mechanisms),
    ...list(ecosystem.related_pathways),
  ])
    .map(normalizeKey)
    .filter(Boolean)
}

function numeric(value: unknown) {
  const parsed = Number(text(value))
  return Number.isFinite(parsed) ? parsed : 0
}

function sharedCount(left: string[], right: string[]) {
  const rightSet = new Set(right)
  return left.filter((value) => rightSet.has(value)).length
}

function ecosystemScore(record: any, ecosystem: GraphEcosystem) {
  const sourceSlug = safeSlug(record?.slug)
  const sourceSignals = collectProfileSignals(record)
  const entityKeys = ecosystemEntityKeys(ecosystem)
  const signals = ecosystemSignals(ecosystem)

  const directMatch = sourceSlug && entityKeys.includes(sourceSlug) ? 8 : 0
  const signalMatch = sharedCount(sourceSignals, signals)

  return (
    directMatch +
    signalMatch * 2 +
    Math.min(numeric(ecosystem.relationship_density) / 25, 4) +
    Math.min(numeric(ecosystem.graph_score) / 50, 2)
  )
}

function candidateScore(candidate: any, matchedEcosystems: GraphEcosystem[], sourceSignals: string[]) {
  const candidateSlug = safeSlug(candidate?.slug)
  const candidateSignals = collectProfileSignals(candidate)

  return matchedEcosystems.reduce((score, ecosystem) => {
    const entityKeys = ecosystemEntityKeys(ecosystem)
    const signals = ecosystemSignals(ecosystem)
    const entityMatch = candidateSlug && entityKeys.includes(candidateSlug) ? 8 : 0
    const signalMatch = sharedCount(candidateSignals, signals)
    const sourceContinuity = sharedCount(sourceSignals, signals)

    return score + entityMatch + signalMatch * 2 + sourceContinuity
  }, 0)
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

export function getMatchedEcosystemsForRecord(record: any, limit = MAX_MATCHED_ECOSYSTEMS) {
  const graph = loadRuntimeGraph()
  const ecosystems = [
    ...safeArray(graph.topics),
    ...safeArray(graph.pathways),
    ...safeArray(graph.supernodes),
  ] as GraphEcosystem[]

  return ecosystems
    .map((ecosystem) => ({ ecosystem, score: ecosystemScore(record, ecosystem) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      const scoreDelta = b.score - a.score
      if (scoreDelta !== 0) return scoreDelta
      return safeLower(a.ecosystem.name || a.ecosystem.slug || a.ecosystem.id).localeCompare(
        safeLower(b.ecosystem.name || b.ecosystem.slug || b.ecosystem.id),
      )
    })
    .slice(0, Math.max(0, safeScore(limit, MAX_MATCHED_ECOSYSTEMS)))
    .map((item) => item.ecosystem)
}

export function getEcosystemContinuityRecords(record: any, records: any[], limit = MAX_ECOSYSTEM_CONTINUITY_RECORDS) {
  const sourceSlug = safeSlug(record?.slug)
  const requestedLimit = capLimit(limit)
  const matchedEcosystems = getMatchedEcosystemsForRecord(record)
  const sourceSignals = collectProfileSignals(record)

  if (!sourceSlug || requestedLimit === 0 || matchedEcosystems.length === 0) return []

  return safeArray(records)
    .map((candidate: any) => {
      const candidateSlug = safeSlug(candidate?.slug)
      if (!candidateSlug || candidateSlug === sourceSlug) return null

      const score = candidateScore(candidate, matchedEcosystems, sourceSignals)
      if (score <= 0) return null

      const overlap = unique(
        matchedEcosystems.flatMap((ecosystem) => [
          formatDisplayLabel(ecosystem.name || ecosystem.slug || ecosystem.id),
          ...list(ecosystem.topics).slice(0, 2),
          ...list(ecosystem.pathways).slice(0, 2),
        ]),
      )
        .map(formatDisplayLabel)
        .filter(isClean)
        .slice(0, 4)

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

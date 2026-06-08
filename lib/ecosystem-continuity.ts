import { list, text, unique } from '@/lib/display-utils'
import { safeArray, safeLower, safeScore, safeSlug } from '@/lib/search-safe'
import { getRuntimeMapEntries } from '@/lib/runtime-related-maps'

const MAX_ECOSYSTEM_CONTINUITY_RECORDS = 6

type RuntimeRecord = Record<string, any>

type RuntimeRelationshipEntry = {
  slug: string
  score?: number
  overlapLabels?: string[]
  relationshipKinds?: string[]
  ecosystemOverlap?: number
  mechanismOverlap?: number
  pathwayOverlap?: number
}

function capLimit(limit: number | undefined) {
  return Math.min(MAX_ECOSYSTEM_CONTINUITY_RECORDS, Math.max(0, safeScore(limit, MAX_ECOSYSTEM_CONTINUITY_RECORDS)))
}

function sortByScoreThenName(a: Record<string, unknown>, b: Record<string, unknown>) {
  const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)
  if (scoreDelta !== 0) return scoreDelta

  const nameDelta = safeLower(a?.name || a?.slug).localeCompare(safeLower(b?.name || b?.slug))
  if (nameDelta !== 0) return nameDelta

  return safeSlug(a?.slug).localeCompare(safeSlug(b?.slug))
}

function hydrateContinuityEntries(entries: RuntimeRelationshipEntry[], records: RuntimeRecord[]) {
  if (!Array.isArray(entries) || entries.length === 0) return []

  const bySlug = new Map<string, RuntimeRecord>()

  for (const record of safeArray<RuntimeRecord>(records)) {
    const slug = safeSlug(record?.slug)
    if (!slug || bySlug.has(slug)) continue
    bySlug.set(slug, record)
  }

  return entries
    .map((entry) => {
      const slug = safeSlug(entry?.slug)
      if (!slug) return null

      const record = bySlug.get(slug)
      if (!record) return null

      const overlap = unique([
        ...list(record?.relatedOverlap),
        ...safeArray<string>(entry?.overlapLabels),
      ]).slice(0, 6)

      return {
        ...record,
        relatedOverlap: overlap,
        relatedGraphKinds: unique([
          ...list(record?.relatedGraphKinds),
          ...safeArray<string>(entry?.relationshipKinds),
          'ecosystem-continuity',
          'authority-hub',
        ]).slice(0, 4),
        graphEcosystemOverlap: overlap.slice(0, 4),
        graphCandidateRationale:
          text(record?.graphCandidateRationale) ||
          'Connected through precomputed topic ecosystems, pathway ecosystems, or authority hubs; shown as discovery context only.',
        relatedScore: safeScore(record?.relatedScore) + safeScore(entry?.score),
        ecosystemOverlap: safeScore(entry?.ecosystemOverlap),
        mechanismOverlap: safeScore(entry?.mechanismOverlap),
        pathwayOverlap: safeScore(entry?.pathwayOverlap),
      }
    })
    .filter((record) => record !== null) as Record<string, unknown>[]
}

export async function getEcosystemContinuityRecords(record: RuntimeRecord, records: RuntimeRecord[], limit = MAX_ECOSYSTEM_CONTINUITY_RECORDS) {
  const slug = safeSlug(record?.slug)
  const requestedLimit = capLimit(limit)

  if (!slug || requestedLimit === 0) return []

  const entries = await getRuntimeMapEntries('ecosystem', slug)

  return hydrateContinuityEntries(entries, records)
    .sort(sortByScoreThenName)
    .slice(0, requestedLimit)
}

export function mergeEcosystemContinuityRecords(primaryRecords: Record<string, unknown>[], continuityRecords: Record<string, unknown>[], limit = MAX_ECOSYSTEM_CONTINUITY_RECORDS) {
  const requestedLimit = capLimit(limit)
  const bySlug = new Map<string, any>()

  const mergedRecords = [
    ...safeArray(primaryRecords),
    ...safeArray(continuityRecords),
  ] as Record<string, unknown>[]

  for (const item of mergedRecords.sort(sortByScoreThenName)) {
    const slug = safeSlug(item?.slug)
    if (!slug || bySlug.has(slug)) continue
    bySlug.set(slug, item)
  }

  return [...bySlug.values()].sort(sortByScoreThenName).slice(0, requestedLimit)
}

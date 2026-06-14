import { text } from '@/lib/display-utils'
import { safeArray, safeScore, safeSlug } from '@/lib/search-safe'
import {
  getRuntimeMapEntries,
  getRuntimeMapEntriesForSlugs,
} from '@/lib/runtime-related-maps'

const MAX_RELATED_PROFILES = 12
const MAX_COMPARISON_CANDIDATES = 8
const MAX_STACK_CANDIDATES = 8
const MAX_BATCHED_SLUGS = 100

type RuntimeRecord = Record<string, unknown>

type RuntimeRelationshipKind = 'related' | 'comparison' | 'stack'

type RuntimeRelationshipEntry = {
  slug: string
  score?: number
  overlapLabels?: string[]
  relationshipKinds?: string[]
  ecosystemOverlap?: number
  mechanismOverlap?: number
  pathwayOverlap?: number
}

type HydratedRecord = RuntimeRecord & {
  relatedScore: number
  relatedOverlap: string[]
  relatedGraphKinds: string[]
  ecosystemOverlap: number
  mechanismOverlap: number
  pathwayOverlap: number
}

function clampLimit(value: unknown, fallback: number, max: number) {
  const parsed = safeScore(value, fallback)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(0, Math.floor(parsed)))
}

function buildRecordIndex(records: RuntimeRecord[]) {
  const bySlug = new Map<string, RuntimeRecord>()

  for (const record of safeArray<RuntimeRecord>(records)) {
    const slug = safeSlug(record?.slug)
    if (!slug || bySlug.has(slug)) continue
    bySlug.set(slug, record)
  }

  return bySlug
}

function hydrateRuntimeEntries(
  entries: RuntimeRelationshipEntry[],
  recordIndex: Map<string, RuntimeRecord>,
) {
  if (!Array.isArray(entries) || entries.length === 0) return []

  return entries
    .map((entry) => {
      const slug = safeSlug(entry?.slug)
      if (!slug) return null

      const record = recordIndex.get(slug)
      if (!record) return null

      return {
        ...record,
        relatedScore: safeScore(entry?.score),
        relatedOverlap: safeArray<string>(entry?.overlapLabels),
        relatedGraphKinds: safeArray<string>(entry?.relationshipKinds),
        ecosystemOverlap: safeScore(entry?.ecosystemOverlap),
        mechanismOverlap: safeScore(entry?.mechanismOverlap),
        pathwayOverlap: safeScore(entry?.pathwayOverlap),
      }
    })
    .filter((x): x is HydratedRecord => x !== null)
}

function sortHydratedRecords(records: HydratedRecord[]) {
  return records.sort((a: HydratedRecord, b: HydratedRecord) => {
    const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)
    if (scoreDelta !== 0) return scoreDelta

    const nameA = text(a?.name || a?.slug).toLowerCase()
    const nameB = text(b?.name || b?.slug).toLowerCase()
    return nameA.localeCompare(nameB)
  })
}

async function getRuntimeRecords(kind: RuntimeRelationshipKind, record: RuntimeRecord, records: RuntimeRecord[], limit: number, fallbackLimit: number) {
  const slug = safeSlug(record?.slug)
  const requestedLimit = clampLimit(limit, fallbackLimit, fallbackLimit)

  if (!slug || requestedLimit === 0) return []

  const entries = await getRuntimeMapEntries(kind, slug)
  const recordIndex = buildRecordIndex(records)

  return sortHydratedRecords(hydrateRuntimeEntries(entries, recordIndex))
    .slice(0, requestedLimit)
}

export async function getRelatedRuntimeRecords(record: RuntimeRecord, records: RuntimeRecord[], limit = MAX_RELATED_PROFILES) {
  return getRuntimeRecords('related', record, records, limit, MAX_RELATED_PROFILES)
}

export async function getComparisonRuntimeRecords(record: RuntimeRecord, records: RuntimeRecord[], limit = MAX_COMPARISON_CANDIDATES) {
  return getRuntimeRecords('comparison', record, records, limit, MAX_COMPARISON_CANDIDATES)
}

export async function getStackRuntimeRecords(record: RuntimeRecord, records: RuntimeRecord[], limit = MAX_STACK_CANDIDATES) {
  return getRuntimeRecords('stack', record, records, limit, MAX_STACK_CANDIDATES)
}

export async function getBatchedRuntimeRecords(
  kind: RuntimeRelationshipKind,
  sourceRecords: RuntimeRecord[],
  candidateRecords: RuntimeRecord[],
  limit = MAX_RELATED_PROFILES,
): Promise<Record<string, RuntimeRecord[]>> {
  const requestedLimit = clampLimit(limit, MAX_RELATED_PROFILES, MAX_RELATED_PROFILES)

  if (requestedLimit === 0) return {}

  const sourceSlugs = safeArray<RuntimeRecord>(sourceRecords)
    .map((record) => safeSlug(record?.slug))
    .filter(Boolean)
    .slice(0, MAX_BATCHED_SLUGS)

  if (sourceSlugs.length === 0) return {}

  const recordIndex = buildRecordIndex(candidateRecords)
  const entriesBySlug = await getRuntimeMapEntriesForSlugs(kind, sourceSlugs)

  return Object.fromEntries(
    sourceSlugs.map((slug) => [
      slug,
      sortHydratedRecords(hydrateRuntimeEntries(entriesBySlug[slug] || [], recordIndex))
        .slice(0, requestedLimit),
    ]),
  )
}

export function getRelatedLabel(record: RuntimeRecord) {
  const primary = safeArray(record?.primary_effects || record?.effects)[0]
  return primary ? `Related to ${text(primary)}` : 'Related Research Profiles'
}

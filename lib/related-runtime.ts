import { text } from '@/lib/display-utils'
import { safeArray, safeScore, safeSlug } from '@/lib/search-safe'
import {
  getRuntimeMapEntries,
  getRuntimeMapEntriesForSlugs,
} from '../src/lib/runtime-related-maps'
import type { RuntimeRecord } from '../src/types/content'

const MAX_RELATED_PROFILES = 8
const MAX_COMPARISON_CANDIDATES = 8
const MAX_STACK_CANDIDATES = 8
const MAX_BATCHED_SLUGS = 100
const MAX_STRATEGIC_BOOST = 5

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
  strategicLinkBoost: number
  relatedReason: string
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

function normalizedOpportunityScore(record: RuntimeRecord): number {
  const direct = safeScore(
    record?.internal_link_opportunity_score ??
      record?.seo_opportunity_score ??
      record?.seoOpportunityScore ??
      record?.opportunity_score,
    0,
  )
  if (direct > 0) return direct > 1 ? Math.min(1, direct / 100) : Math.min(1, direct)

  const impressions = safeScore(record?.impressions ?? record?.search_impressions, 0)
  const position = safeScore(record?.position ?? record?.average_position ?? record?.averagePosition, 0)
  const nearPageOne = position >= 4 && position <= 15 ? 1 : 0
  const impressionSignal = impressions > 0 ? Math.min(1, Math.log10(impressions + 1) / 4) : 0
  return impressionSignal * 0.65 + nearPageOne * 0.35
}

function strategicLinkBoost(record: RuntimeRecord): number {
  return Math.min(MAX_STRATEGIC_BOOST, normalizedOpportunityScore(record) * MAX_STRATEGIC_BOOST)
}

function relationshipReason(entry: RuntimeRelationshipEntry): string {
  const labels = safeArray<string>(entry?.overlapLabels).filter(Boolean).slice(0, 2)
  if (labels.length > 0) return `Related through ${labels.join(' + ')}`
  if (safeScore(entry?.ecosystemOverlap) > 0) return 'Related research ecosystem'
  if (safeScore(entry?.mechanismOverlap) > 0) return 'Shared mechanism context'
  if (safeScore(entry?.pathwayOverlap) > 0) return 'Shared pathway context'
  return 'Semantically related research'
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
        strategicLinkBoost: strategicLinkBoost(record),
        relatedReason: relationshipReason(entry),
      }
    })
    .filter((x): x is HydratedRecord => x !== null)
}

function sortHydratedRecords(records: HydratedRecord[]) {
  return records.sort((a, b) => {
    // Semantic graph score remains primary. Strategic opportunity is capped so
    // a promising URL cannot leapfrog an unrelated URL into the related set.
    const scoreA = safeScore(a?.relatedScore) + safeScore(a?.strategicLinkBoost)
    const scoreB = safeScore(b?.relatedScore) + safeScore(b?.strategicLinkBoost)
    const scoreDelta = scoreB - scoreA
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
  return sortHydratedRecords(hydrateRuntimeEntries(entries, recordIndex)).slice(0, requestedLimit)
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
  if (kind === 'stack') return {}

  const fallbackLimit = kind === 'related' ? MAX_RELATED_PROFILES : MAX_COMPARISON_CANDIDATES
  const requestedLimit = clampLimit(limit, fallbackLimit, fallbackLimit)
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
      sortHydratedRecords(hydrateRuntimeEntries(entriesBySlug[slug] || [], recordIndex)).slice(0, requestedLimit),
    ]),
  )
}

export function getRelatedLabel(record: RuntimeRecord) {
  const primary = safeArray(record?.primary_effects || record?.effects)[0]
  return primary ? `Related to ${text(primary)}` : 'Related Research Profiles'
}

import { text } from '@/lib/display-utils'
import { safeArray, safeScore, safeSlug } from '@/lib/search-safe'
import { getRuntimeMapEntries } from '@/lib/runtime-related-maps'

const MAX_RELATED_PROFILES = 12
const MAX_COMPARISON_CANDIDATES = 8
const MAX_STACK_CANDIDATES = 8

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

function clampLimit(value: unknown, fallback: number, max: number) {
  const parsed = safeScore(value, fallback)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(0, Math.floor(parsed)))
}

function hydrateRuntimeEntries(entries: RuntimeRelationshipEntry[], records: RuntimeRecord[]) {
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
    .filter(Boolean)
}

async function getRuntimeRecords(kind: 'related' | 'comparison' | 'stack', record: RuntimeRecord, records: RuntimeRecord[], limit: number, fallbackLimit: number) {
  const slug = safeSlug(record?.slug)
  const requestedLimit = clampLimit(limit, fallbackLimit, fallbackLimit)

  if (!slug || requestedLimit === 0) return []

  const entries = await getRuntimeMapEntries(kind, slug)

  return hydrateRuntimeEntries(entries, records)
    .sort((a: any, b: any) => {
      const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)
      if (scoreDelta !== 0) return scoreDelta

      const nameA = text(a?.name || a?.slug).toLowerCase()
      const nameB = text(b?.name || b?.slug).toLowerCase()
      return nameA.localeCompare(nameB)
    })
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

export function getRelatedLabel(record: RuntimeRecord) {
  const primary = safeArray(record?.primary_effects || record?.effects)[0]
  return primary ? `Related to ${text(primary)}` : 'Related Research Profiles'
}

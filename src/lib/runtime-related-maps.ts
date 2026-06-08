import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from './react-cache'

const MAP_DIR = path.join(process.cwd(), 'public', 'data', 'runtime-maps')
const MAX_RUNTIME_MAP_ENTRIES = 12
const MAX_OVERLAP_LABELS = 12
const MAX_RELATIONSHIP_KINDS = 6

type RuntimeMapKind = 'related' | 'comparison' | 'stack' | 'ecosystem'

export type RuntimeMapEntry = {
  slug: string
  href?: string
  label?: string
  title?: string
  sourceSlug?: string
  targetSlug?: string
  targetType?: string
  score?: number
  overlapLabels?: string[]
  relationshipKinds?: string[]
  ecosystemOverlap?: number
  mechanismOverlap?: number
  pathwayOverlap?: number
}

type RuntimeMap = Record<string, RuntimeMapEntry[]>

function text(value: unknown) {
  return String(value ?? '').trim()
}

function mapFileForKind(kind: RuntimeMapKind) {
  if (kind === 'comparison') return 'comparison-map.json'
  if (kind === 'stack') return 'stack-map.json'
  if (kind === 'ecosystem') return 'ecosystem-map.json'
  return 'related-profiles.json'
}

function sanitizeEntry(entry: any): RuntimeMapEntry | null {
  const slug = text(entry?.slug)

  if (!slug) {
    return null
  }

  return {
    slug,
    href: text(entry?.href) || undefined,
    label: text(entry?.label) || undefined,
    title: text(entry?.title) || undefined,
    sourceSlug: text(entry?.sourceSlug) || undefined,
    targetSlug: text(entry?.targetSlug) || undefined,
    targetType: text(entry?.targetType) || undefined,
    score: Number.isFinite(Number(entry?.score)) ? Number(entry.score) : 0,
    overlapLabels: Array.isArray(entry?.overlapLabels)
      ? entry.overlapLabels.map(text).filter(Boolean).slice(0, MAX_OVERLAP_LABELS)
      : [],
    relationshipKinds: Array.isArray(entry?.relationshipKinds)
      ? entry.relationshipKinds.map(text).filter(Boolean).slice(0, MAX_RELATIONSHIP_KINDS)
      : [],
    ecosystemOverlap: Number.isFinite(Number(entry?.ecosystemOverlap)) ? Number(entry.ecosystemOverlap) : 0,
    mechanismOverlap: Number.isFinite(Number(entry?.mechanismOverlap)) ? Number(entry.mechanismOverlap) : 0,
    pathwayOverlap: Number.isFinite(Number(entry?.pathwayOverlap)) ? Number(entry.pathwayOverlap) : 0,
  }
}

function sanitizeEntries(entries: unknown): RuntimeMapEntry[] {
  if (!Array.isArray(entries)) {
    return []
  }

  return entries
    .map(sanitizeEntry)
    .filter((entry): entry is RuntimeMapEntry => Boolean(entry))
    .sort((a, b) => {
      const scoreDelta = Number(b.score || 0) - Number(a.score || 0)

      if (scoreDelta !== 0) {
        return scoreDelta
      }

      return a.slug.localeCompare(b.slug)
    })
    .slice(0, MAX_RUNTIME_MAP_ENTRIES)
}

const mapCache = new Map<string, RuntimeMap>()

async function readMap(fileName: string): Promise<RuntimeMap> {
  if (mapCache.has(fileName)) {
    return mapCache.get(fileName)!
  }
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, fileName), 'utf8')
    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    const result = Object.fromEntries(
      Object.entries(parsed)
        .map(([slug, entries]) => [text(slug), sanitizeEntries(entries)])
        .filter(([slug, entries]) => Boolean(slug) && Array.isArray(entries)),
    ) as RuntimeMap
    mapCache.set(fileName, result)
    return result
  } catch {
    return {}
  }
}

const getRuntimeMapByFile = cache(async (fileName: string) => readMap(fileName))

export const getRelatedProfilesMap = cache(async () => getRuntimeMapByFile('related-profiles.json'))
export const getComparisonMap = cache(async () => getRuntimeMapByFile('comparison-map.json'))
export const getStackMap = cache(async () => getRuntimeMapByFile('stack-map.json'))
export const getEcosystemMap = cache(async () => getRuntimeMapByFile('ecosystem-map.json'))
export const getAuthorityHubsMap = cache(async () => getRuntimeMapByFile('authority-hubs.json'))
export const getEntityConditionMap = cache(async () => getRuntimeMapByFile('entity-to-conditions.json'))
export const getConditionHerbMap = cache(async () => getRuntimeMapByFile('condition-to-herbs.json'))
export const getComparisonRecommendationsMap = cache(async () => getRuntimeMapByFile('comparison-recommendations.json'))

export const getRuntimeMapEntries = cache(async (
  kind: RuntimeMapKind,
  slug: string,
): Promise<RuntimeMapEntry[]> => {
  const normalizedSlug = text(slug)

  if (!normalizedSlug) return []

  const map = await getRuntimeMapByFile(mapFileForKind(kind))

  return sanitizeEntries(map?.[normalizedSlug])
})

export const getEntityConditionEntries = cache(async (slug: string): Promise<RuntimeMapEntry[]> => {
  const normalizedSlug = text(slug)
  if (!normalizedSlug) return []
  const map = await getEntityConditionMap()
  return sanitizeEntries(map?.[normalizedSlug])
})

export const getConditionHerbEntries = cache(async (slug: string): Promise<RuntimeMapEntry[]> => {
  const normalizedSlug = text(slug)
  if (!normalizedSlug) return []
  const map = await getConditionHerbMap()
  return sanitizeEntries(map?.[normalizedSlug])
})

export const getComparisonRecommendationEntries = cache(async (slug: string): Promise<RuntimeMapEntry[]> => {
  const normalizedSlug = text(slug)
  if (!normalizedSlug) return []
  const map = await getComparisonRecommendationsMap()
  return sanitizeEntries(map?.[normalizedSlug])
})

export async function getRuntimeMapEntriesForSlugs(
  kind: RuntimeMapKind,
  slugs: string[],
): Promise<Record<string, RuntimeMapEntry[]>> {
  const uniqueSlugs = [...new Set(slugs.map(text).filter(Boolean))].slice(0, 100)
  const map = await getRuntimeMapByFile(mapFileForKind(kind))

  return Object.fromEntries(
    uniqueSlugs.map((slug) => [slug, sanitizeEntries(map?.[slug])]),
  )
}

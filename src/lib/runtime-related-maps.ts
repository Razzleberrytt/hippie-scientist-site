import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

const MAP_DIR = path.join(process.cwd(), 'public', 'data', 'runtime-maps')
const MAX_RUNTIME_MAP_ENTRIES = 12
const MAX_OVERLAP_LABELS = 12
const MAX_RELATIONSHIP_KINDS = 6

type RuntimeMapEntry = {
  slug: string
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

function sanitizeEntry(entry: any): RuntimeMapEntry | null {
  const slug = text(entry?.slug)

  if (!slug) {
    return null
  }

  return {
    slug,
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

async function readMap(fileName: string): Promise<RuntimeMap> {
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, fileName), 'utf8')
    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed)
        .map(([slug, entries]) => [text(slug), sanitizeEntries(entries)])
        .filter(([slug, entries]) => Boolean(slug) && Array.isArray(entries)),
    ) as RuntimeMap
  } catch {
    return {}
  }
}

export const getRelatedProfilesMap = cache(async () => readMap('related-profiles.json'))
export const getComparisonMap = cache(async () => readMap('comparison-map.json'))
export const getStackMap = cache(async () => readMap('stack-map.json'))
export const getEcosystemMap = cache(async () => readMap('ecosystem-map.json'))
export const getAuthorityHubsMap = cache(async () => readMap('authority-hubs.json'))

export async function getRuntimeMapEntries(kind: 'related' | 'comparison' | 'stack' | 'ecosystem', slug: string): Promise<RuntimeMapEntry[]> {
  if (!slug) return []

  const map = kind === 'comparison'
    ? await getComparisonMap()
    : kind === 'stack'
      ? await getStackMap()
      : kind === 'ecosystem'
        ? await getEcosystemMap()
        : await getRelatedProfilesMap()

  return sanitizeEntries(map?.[slug])
}

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

const MAP_DIR = path.join(process.cwd(), 'public', 'data', 'runtime-maps')

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

async function readMap(fileName: string): Promise<RuntimeMap> {
  try {
    const raw = await fs.readFile(path.join(MAP_DIR, fileName), 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
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

  const entries = map?.[slug]
  return Array.isArray(entries) ? entries : []
}

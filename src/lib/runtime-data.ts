import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
import type {
  EvidenceEngineClaim,
  EvidenceEnginePayload,
  EvidenceEngineSafetyNote,
  EvidenceEngineSource,
} from '@/lib/evidence-engine'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'

const dataDir = path.join(process.cwd(), 'public', 'data')

type RuntimeRecord = Record<string, any>

export type SleepEvidenceClaim = EvidenceEngineClaim & { sleep_problem: string }
export type SleepEvidenceSource = EvidenceEngineSource
export type SleepSafetyNote = EvidenceEngineSafetyNote
export type SleepEvidenceEnginePayload = EvidenceEnginePayload<'sleep'> & {
  claims: SleepEvidenceClaim[]
  safetyNotes: SleepSafetyNote[]
  sourcesByClaim: Record<string, SleepEvidenceSource[]>
}

const fileCache = new Map<string, unknown>()

async function readJsonFile(fileName: string): Promise<unknown> {
  if (fileCache.has(fileName)) {
    return fileCache.get(fileName)
  }
  const filePath = path.join(dataDir, fileName)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    fileCache.set(fileName, parsed)
    return parsed
  } catch {
    return []
  }
}

function isSafeSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug)
}

function mergeBySlug(baseRows: RuntimeRecord[], enrichmentRows: RuntimeRecord[]) {
  const bySlug = new Map<string, RuntimeRecord>()

  for (const row of enrichmentRows) {
    if (typeof row?.slug === 'string') {
      bySlug.set(row.slug, row)
    }
  }

  const merged = baseRows.map(row => {
    const slug = typeof row?.slug === 'string' ? row.slug : ''
    const enrichment = bySlug.get(slug)

    return enrichment ? { ...row, ...enrichment } : row
  })

  const knownSlugs = new Set(merged.map(row => row?.slug).filter(Boolean))

  for (const row of enrichmentRows) {
    if (typeof row?.slug === 'string' && !knownSlugs.has(row.slug)) {
      merged.push(row)
    }
  }

  return merged
}

async function readDetailRecord(kind: 'herbs' | 'compounds', slug: string): Promise<RuntimeRecord | undefined> {
  if (!isSafeSlug(slug)) return undefined

  const detail = await readJsonFile(`${kind}-detail/${slug}.json`)

  return detail && !Array.isArray(detail) && typeof detail === 'object' ? detail as RuntimeRecord : undefined
}

export const getHerbs = cache(async (): Promise<RuntimeRecord[]> => {
  const [herbs, summary, summaryIndexed] = await Promise.all([
    readJsonFile('herbs.json'),
    readJsonFile('herbs-summary.json'),
    readJsonFile('summary-indexes/herbs-summary.json'),
  ])

  const baseRows = Array.isArray(herbs) ? herbs : []
  const enrichmentRows = Array.isArray(summary) ? summary : []
  const indexedRows = Array.isArray(summaryIndexed) ? summaryIndexed : []

  const firstPass = mergeBySlug(baseRows, enrichmentRows)
  return mergeBySlug(firstPass, indexedRows)
})

export const getCompounds = cache(async (): Promise<RuntimeRecord[]> => {
  const [compounds, summary, summaryIndexed] = await Promise.all([
    readJsonFile('compounds.json'),
    readJsonFile('compounds-summary.json'),
    readJsonFile('summary-indexes/compounds-summary.json'),
  ])

  const baseRows = Array.isArray(compounds) ? compounds : []
  const enrichmentRows = Array.isArray(summary) ? summary : []
  const indexedRows = Array.isArray(summaryIndexed) ? summaryIndexed : []

  const firstPass = mergeBySlug(baseRows, enrichmentRows)

  return mergeBySlug(firstPass, indexedRows).map(row => ({
    name: row?.name || row?.compoundName || row?.canonicalCompoundName || row?.slug,
    ...row,
  }))
})

export const getHerbCompoundMap = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('herb-compound-map.json')
  return Array.isArray(rows) ? rows : []
})

export const getStacks = cache(async (): Promise<RuntimeRecord[]> => {
  const stacks = await readJsonFile('stacks.json')
  return Array.isArray(stacks) ? stacks : []
})

export const getClaims = cache(async (): Promise<RuntimeRecord[]> => {
  const claims = await readJsonFile('claims.json')
  return Array.isArray(claims) ? claims : []
})

export const getSleepEvidenceEngine = cache(async (): Promise<SleepEvidenceEnginePayload> => {
  const payload = await readJsonFile('evidence-engine/sleep.json')
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return { goal: 'sleep', updatedAt: '', claims: [], safetyNotes: [], sourcesByClaim: {} }
  }

  const candidate = payload as Partial<SleepEvidenceEnginePayload>
  return {
    goal: 'sleep',
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : '',
    claims: Array.isArray(candidate.claims) ? candidate.claims : [],
    safetyNotes: Array.isArray(candidate.safetyNotes) ? candidate.safetyNotes : [],
    sourcesByClaim: candidate.sourcesByClaim && typeof candidate.sourcesByClaim === 'object' && !Array.isArray(candidate.sourcesByClaim)
      ? candidate.sourcesByClaim
      : {},
  }
})

export const getCompoundCardPayload = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('compound-card-payload.json')
  return Array.isArray(rows) ? rows : []
})

export const getCompoundDetailPayload = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('compound-detail-payload.json')
  return Array.isArray(rows) ? rows : []
})

export const getSeoPagePayload = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('seo-page-payload.json')
  return Array.isArray(rows) ? rows : []
})

export const getCtaGatePayload = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('cta-gate-payload.json')
  return Array.isArray(rows) ? rows : []
})

export const getRouteBuildManifest = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('route-build-manifest.json')
  return Array.isArray(rows) ? rows : []
})

export async function getHerbBySlug(slug: string): Promise<RuntimeRecord | undefined> {
  const herbs = await getHerbs()
  const herb = herbs.find(herb => herb.slug === slug)
  const detail = await readDetailRecord('herbs', slug)
  const mergedHerb = detail ? { ...herb, ...detail } : herb

  if (!mergedHerb || !getRuntimeVisibility(mergedHerb).canRender) return undefined

  return mergedHerb
}

export async function getCompoundBySlug(slug: string): Promise<RuntimeRecord | undefined> {
  const compounds = await getCompounds()
  const compound = compounds.find(compound => compound.slug === slug)
  const detail = await readDetailRecord('compounds', slug)
  const mergedCompound = detail ? { ...compound, ...detail } : compound

  if (!mergedCompound || !getRuntimeVisibility(mergedCompound).canRender) return undefined

  return mergedCompound
}

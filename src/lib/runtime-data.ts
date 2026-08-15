import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from './react-cache'
import type {
  EvidenceEngineClaim,
  EvidenceEngineConfig,
  EvidenceEnginePayload,
  EvidenceProblemLabel,
  EvidenceEngineSafetyNote,
  EvidenceEngineSource,
} from './evidence-engine'
import type { RuntimeRecord } from '../types/content'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { getUnifiedRuntimeRecords } from './runtime-record-index'
import { resolveRuntimeRecordLayers } from '../../lib/runtime-record-resolver.mjs'
import {
  isSafeContentSlug,
  normalizeRuntimeContentRecord,
  normalizeRuntimeContentRecords,
  type CanonicalContentKind,
} from './content-contract'

const dataDir = path.join(process.cwd(), 'public', 'data')

const fileCache = new Map<string, unknown>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cleanString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeConfig(value: unknown): EvidenceEngineConfig | undefined {
  if (!isRecord(value)) return undefined
  const fields = ['problemField', 'heroHeadline', 'heroCta', 'orientationHeading', 'orientationSubtext', 'safetyHeading', 'safetyBody'] as const
  const config: Partial<EvidenceEngineConfig> = {}
  for (const field of fields) {
    if (typeof value[field] === 'string') config[field] = value[field] as string
  }
  return Object.keys(config).length > 0 ? config as EvidenceEngineConfig : undefined
}

function normalizeProblemLabels(value: unknown): Record<string, EvidenceProblemLabel> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, label]) => {
      if (!key || !isRecord(label)) return []
      return [[key, {
        title: cleanString(label.title),
        description: cleanString(label.description),
      }]]
    })
  )
}

function normalizeEvidenceSourcesByClaim(value: unknown): Record<string, EvidenceEngineSource[]> {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([claimId, sources]) => {
      if (!claimId || !Array.isArray(sources)) return []
      return [[claimId, sources.filter(isRecord) as EvidenceEngineSource[]]]
    })
  )
}

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

function validatedProfileRows(value: unknown, kind: CanonicalContentKind, source: string): RuntimeRecord[] {
  const { records, issues } = normalizeRuntimeContentRecords(value, kind, source)
  if (issues.length && process.env.NODE_ENV !== 'production') {
    console.warn(`[runtime-data] dropped ${issues.length} malformed ${kind} record(s) from ${source}`)
  }
  return records
}

function mergeBySlug(baseRows: RuntimeRecord[], enrichmentRows: RuntimeRecord[], kind: CanonicalContentKind) {
  const bySlug = new Map<string, RuntimeRecord>()

  for (const row of enrichmentRows) {
    if (typeof row?.slug === 'string') {
      bySlug.set(row.slug, row)
    }
  }

  const merged = baseRows.flatMap(row => {
    const slug = typeof row?.slug === 'string' ? row.slug : ''
    const enrichment = bySlug.get(slug)
    const candidate = enrichment ? resolveRuntimeRecordLayers(row, [enrichment]) : row
    const normalized = normalizeRuntimeContentRecord(candidate, kind)
    return normalized ? [normalized as RuntimeRecord] : []
  })

  const knownSlugs = new Set(merged.map(row => row?.slug).filter(Boolean))

  for (const row of enrichmentRows) {
    if (typeof row?.slug === 'string' && !knownSlugs.has(row.slug)) {
      const normalized = normalizeRuntimeContentRecord(row, kind)
      if (normalized) merged.push(normalized as RuntimeRecord)
    }
  }

  return merged
}

async function readDetailRecord(kind: 'herbs' | 'compounds', slug: string): Promise<RuntimeRecord | null> {
  if (!isSafeContentSlug(slug)) return null

  const detail = await readJsonFile(`${kind}-detail/${slug}.json`)
  const normalized = normalizeRuntimeContentRecord(detail, kind === 'herbs' ? 'herb' : 'compound')
  return normalized as RuntimeRecord | null
}

export const getHerbs = cache(async (): Promise<RuntimeRecord[]> => {
  const [herbs, summary, summaryIndexed] = await Promise.all([
    readJsonFile('herbs.json'),
    readJsonFile('herbs-summary.json'),
    readJsonFile('summary-indexes/herbs-summary.json'),
  ])

  const baseRows = validatedProfileRows(herbs, 'herb', 'herbs.json')
  const enrichmentRows = validatedProfileRows(summary, 'herb', 'herbs-summary.json')
  const indexedRows = validatedProfileRows(summaryIndexed, 'herb', 'summary-indexes/herbs-summary.json')

  const firstPass = mergeBySlug(baseRows, enrichmentRows, 'herb')
  return mergeBySlug(firstPass, indexedRows, 'herb')
})

export const getCompounds = cache(async (): Promise<RuntimeRecord[]> => {
  const [compounds, summary, summaryIndexed] = await Promise.all([
    readJsonFile('compounds.json'),
    readJsonFile('compounds-summary.json'),
    readJsonFile('summary-indexes/compounds-summary.json'),
  ])

  const baseRows = validatedProfileRows(compounds, 'compound', 'compounds.json')
  const enrichmentRows = validatedProfileRows(summary, 'compound', 'compounds-summary.json')
  const indexedRows = validatedProfileRows(summaryIndexed, 'compound', 'summary-indexes/compounds-summary.json')

  const firstPass = mergeBySlug(baseRows, enrichmentRows, 'compound')
  return mergeBySlug(firstPass, indexedRows, 'compound')
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

export const getGoalEvidenceEngine = cache(async (goalSlug: string): Promise<EvidenceEnginePayload | null> => {
  if (!isSafeContentSlug(goalSlug)) return null

  const payload = await readJsonFile(`evidence-engine/${goalSlug}.json`)
  if (!isRecord(payload)) {
    return null
  }

  const candidate = payload as Partial<EvidenceEnginePayload>
  const normalized: EvidenceEnginePayload = {
    goal: typeof candidate.goal === 'string' ? candidate.goal : goalSlug,
    updatedAt: cleanString(candidate.updatedAt),
    problemLabels: normalizeProblemLabels(candidate.problemLabels),
    claims: Array.isArray(candidate.claims) ? candidate.claims.filter(isRecord) as EvidenceEngineClaim[] : [],
    safetyNotes: Array.isArray(candidate.safetyNotes) ? candidate.safetyNotes.filter(isRecord) as EvidenceEngineSafetyNote[] : [],
    sourcesByClaim: normalizeEvidenceSourcesByClaim(candidate.sourcesByClaim),
  }

  const config = normalizeConfig(candidate.config)
  if (config) normalized.config = config

  return normalized
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

export async function getHerbBySlug(slug: string): Promise<RuntimeRecord | null> {
  const herbs = await getHerbs()
  const herb = herbs.find((herb: RuntimeRecord) => herb.slug === slug)
  if (!herb) return null
  const detail = await readDetailRecord('herbs', slug)
  const mergedHerb = detail
    ? normalizeRuntimeContentRecord(resolveRuntimeRecordLayers(herb, [detail]), 'herb') as RuntimeRecord | null
    : herb

  if (!mergedHerb || !getRuntimeVisibility(mergedHerb).canRender) return null

  return mergedHerb
}

export async function getCompoundBySlug(slug: string): Promise<RuntimeRecord | null> {
  const compounds = await getCompounds()
  const compound = compounds.find((compound: RuntimeRecord) => compound.slug === slug)
  if (!compound) return null
  const detail = await readDetailRecord('compounds', slug)
  const mergedCompound = detail
    ? normalizeRuntimeContentRecord(resolveRuntimeRecordLayers(compound, [detail]), 'compound') as RuntimeRecord | null
    : compound

  if (!mergedCompound || !getRuntimeVisibility(mergedCompound).canRender) return null

  return mergedCompound
}

export const getFeaturedHerbs = cache(async (): Promise<RuntimeRecord[]> => {
  try {
    const raw = await fs.readFile(path.join(dataDir, 'featured-herbs.json'), 'utf8')
    const parsed = JSON.parse(raw)
    return validatedProfileRows(parsed, 'herb', 'featured-herbs.json')
  } catch {
    return []
  }
})

export const getFeaturedCompounds = cache(async (): Promise<RuntimeRecord[]> => {
  try {
    const raw = await fs.readFile(path.join(dataDir, 'featured-compounds.json'), 'utf8')
    const parsed = JSON.parse(raw)
    return validatedProfileRows(parsed, 'compound', 'featured-compounds.json')
  } catch {
    return []
  }
})

// --- Interaction data loaders ---
import type {
  InteractionEdgesBySlug,
  RiskTagsBySlug,
  SlugEntityTypeMap,
} from '@/src/types/interactions'

export const getInteractionEdges = cache(async () => {
  return readJsonFile('interaction_edges.json') as Promise<InteractionEdgesBySlug>
})

export const getEntityRiskTags = cache(async () => {
  return readJsonFile('entity_risk_tags.json') as Promise<RiskTagsBySlug>
})

// Resolves which route (/herbs/[slug] vs /compounds/[slug]) a given partner
// slug belongs to, so interaction-edge links never point at the wrong path.
export const getSlugEntityTypeMap = cache(async (): Promise<SlugEntityTypeMap> => {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  const map: SlugEntityTypeMap = {}
  for (const h of herbs) map[h.slug] = 'herb'
  for (const c of compounds) map[c.slug] = 'compound'
  return map
})

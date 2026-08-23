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

const dataDir = path.join(process.cwd(), 'public', 'data')

const fileCache = new Map<string, unknown>()
const AUG23_ENRICHMENT_CLAIM_PREFIX = 'aug23-enr-'

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

    return enrichment ? resolveRuntimeRecordLayers(row, [enrichment]) as RuntimeRecord : row
  })

  const knownSlugs = new Set(merged.map(row => row?.slug).filter(Boolean))

  for (const row of enrichmentRows) {
    if (typeof row?.slug === 'string' && !knownSlugs.has(row.slug)) {
      merged.push(row)
    }
  }

  return merged
}

function citationSourceKey(source: Record<string, unknown>): string {
  const doi = cleanString(source.doi).trim().toLowerCase()
  if (doi) return `doi:${doi}`
  const pmid = cleanString(source.pmid || source.pubmedId).trim()
  if (pmid) return `pmid:${pmid}`
  const url = cleanString(source.url).trim().toLowerCase()
  if (url) return `url:${url}`
  return `title:${cleanString(source.title).trim().toLowerCase()}`
}

function mergeCitationSources(baseValue: unknown, imported: Record<string, unknown>[]): Record<string, unknown>[] {
  const output: Record<string, unknown>[] = []
  const seen = new Set<string>()
  const candidates = [
    ...(Array.isArray(baseValue) ? baseValue.filter(isRecord) : []),
    ...imported,
  ]

  for (const source of candidates) {
    const key = citationSourceKey(source)
    if (!key || key === 'title:' || seen.has(key)) continue
    seen.add(key)
    output.push(source)
  }
  return output
}

async function attachAug23WorkbookEvidence(record: RuntimeRecord): Promise<RuntimeRecord> {
  const rawClaims = await readJsonFile('claims.json')
  if (!Array.isArray(rawClaims)) return record

  const importedSources = rawClaims.flatMap((value): Record<string, unknown>[] => {
    if (!isRecord(value)) return []
    const id = cleanString(value.id)
    const profileSlug = cleanString(value.profile_slug)
    if (!id.startsWith(AUG23_ENRICHMENT_CLAIM_PREFIX) || profileSlug !== record.slug) return []

    const title = cleanString(value.title) || cleanString(value.claim)
    const pmid = cleanString(value.pmid)
    const doi = cleanString(value.doi)
    const url = cleanString(value.source_url)
    if (!title && !pmid && !doi && !url) return []

    return [{
      id: `src_${id}`,
      title,
      pmid,
      doi,
      url,
      studyType: cleanString(value.evidence_tier),
      result: cleanString(value.claim),
      metadataSource: 'workbook-evidence-register',
    }]
  })

  if (!importedSources.length) return record
  return {
    ...record,
    sources: mergeCitationSources(record.sources, importedSources),
  }
}

async function readDetailRecord(kind: 'herbs' | 'compounds', slug: string): Promise<RuntimeRecord | null> {
  if (!isSafeSlug(slug)) return null
  const detail = await readJsonFile(`${kind}-detail/${slug}.json`)

  return detail && !Array.isArray(detail) && typeof detail === 'object' ? detail as RuntimeRecord : null
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
    name:
      cleanString(row?.name) ||
      cleanString(row?.compoundName) ||
      cleanString(row?.canonicalCompoundName) ||
      cleanString(row?.slug),
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

export const getGoalEvidenceEngine = cache(async (goalSlug: string): Promise<EvidenceEnginePayload | null> => {
  if (!isSafeSlug(goalSlug)) return null

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
  const herb = herbs.find((herb: any) => herb.slug === slug)
  if (!herb) return null
  const detail = await readDetailRecord('herbs', slug)
  const mergedHerb = detail ? resolveRuntimeRecordLayers(herb, [detail]) as RuntimeRecord : herb
  const enrichedHerb = await attachAug23WorkbookEvidence(mergedHerb)

  if (!enrichedHerb || !getRuntimeVisibility(enrichedHerb).canRender) return null

  return enrichedHerb
}

export async function getCompoundBySlug(slug: string): Promise<RuntimeRecord | null> {
  const compounds = await getCompounds()
  const compound = compounds.find((compound: any) => compound.slug === slug)
  if (!compound) return null
  const detail = await readDetailRecord('compounds', slug)
  const mergedCompound = detail ? resolveRuntimeRecordLayers(compound, [detail]) as RuntimeRecord : compound
  const enrichedCompound = await attachAug23WorkbookEvidence(mergedCompound)

  if (!enrichedCompound || !getRuntimeVisibility(enrichedCompound).canRender) return null

  return enrichedCompound
}

export const getFeaturedHerbs = cache(async (): Promise<RuntimeRecord[]> => {
  try {
    const raw = await fs.readFile(path.join(dataDir, 'featured-herbs.json'), 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

export const getFeaturedCompounds = cache(async (): Promise<RuntimeRecord[]> => {
  try {
    const raw = await fs.readFile(path.join(dataDir, 'featured-compounds.json'), 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
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

export function buildRenderableSlugEntityTypeMap(
  herbs: RuntimeRecord[],
  compounds: RuntimeRecord[],
): SlugEntityTypeMap {
  const map: SlugEntityTypeMap = {}

  for (const herb of herbs) {
    const slug = typeof herb.slug === 'string' ? herb.slug : ''
    if (slug && getRuntimeVisibility(herb).canRender) map[slug] = 'herb'
  }

  for (const compound of compounds) {
    const slug = typeof compound.slug === 'string' ? compound.slug : ''
    if (slug && getRuntimeVisibility(compound).canRender) map[slug] = 'compound'
  }

  return map
}

// Resolves which route (/herbs/[slug] vs /compounds/[slug]) a given partner
// slug belongs to. Only renderable records receive a route so interaction
// warnings cannot link to a profile that intentionally resolves to 404.
export const getSlugEntityTypeMap = cache(async (): Promise<SlugEntityTypeMap> => {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  return buildRenderableSlugEntityTypeMap(herbs as RuntimeRecord[], compounds as RuntimeRecord[])
})
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_DATA_DIR = 'public/data'
const DEFAULT_CONFIG_PATH = 'data/canonical/enrichment-runtime-overrides.json'

function sourceReceipt(source) {
  return {
    sourceId: source.sourceId,
    title: source.title,
    sourceType: source.sourceType === 'journal-article' && source.studyDesign === 'randomized-controlled-trial'
      ? 'rct'
      : source.sourceType,
    studyType: source.studyDesign || '',
    pmid: source.pmid || '',
    doi: source.doi || '',
    url: source.canonicalUrl || '',
    publicationYear: source.publicationYear ?? null,
    authors: Array.isArray(source.authors) ? source.authors.join(', ') : '',
    evidenceClass: source.evidenceClass || '',
    reviewer: source.reviewer || '',
  }
}

function applyEntry(record, entry, sourceMap) {
  const receipts = entry.sourceIds.map((sourceId) => {
    const source = sourceMap.get(sourceId)
    if (!source) throw new Error(`Runtime override source is not registered: ${sourceId}`)
    if (source.active !== true) throw new Error(`Runtime override source is inactive: ${sourceId}`)
    return sourceReceipt(source)
  })

  record.summary = entry.summary
  record.description = entry.description
  record.safetyNotes = entry.safetyNotes
  record.evidenceLevel = entry.evidenceLevel
  record.evidence_tier = entry.evidenceLevel
  record.evidenceTier = entry.evidenceLevel
  record.evidence_grade = entry.evidenceGrade
  record.evidence_label = entry.evidenceLevel
  record.evidenceLabel = entry.evidenceLevel
  record.governance = {
    ...(record.governance || {}),
    reviewStatus: 'needs_review',
    medicalRisk: entry.medicalRisk,
    monetizationAllowed: entry.monetizationAllowed,
    indexingAllowed: entry.indexingAllowed,
    recommendationAllowed: entry.recommendationAllowed,
    requiresHumanReview: entry.requiresHumanReview,
    reason: entry.governanceReason,
  }
  record.evidence = {
    ...(record.evidence || {}),
    reviewStatus: entry.reviewStatus,
    sourceCount: entry.sourceIds.length,
    sourceIds: [...entry.sourceIds],
  }
  record.sources = receipts
  record.pmids = receipts.map((receipt) => receipt.pmid).filter(Boolean)
  record.indexability_status = entry.indexabilityStatus
  record.robots = entry.robots
  record.sitemap_included = entry.sitemapIncluded
  record.dosage = entry.dosage
  record.typical_dosage = entry.typicalDosage
  return record
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export async function applyEnrichmentRuntimeOverrides({
  dataDir = DEFAULT_DATA_DIR,
  configPath = DEFAULT_CONFIG_PATH,
} = {}) {
  const config = await readJson(configPath)
  if (config?.schemaVersion !== 1 || !Array.isArray(config.entries)) {
    throw new Error(`Unsupported enrichment runtime override config: ${configPath}`)
  }

  const sourceRegistry = await readJson(path.join(dataDir, 'source-registry.json'))
  const sourceMap = new Map(sourceRegistry.map((source) => [source.sourceId, source]))
  const grouped = new Map()
  for (const entry of config.entries) {
    if (!entry?.entityType || !entry?.entitySlug || !Array.isArray(entry.sourceIds) || entry.sourceIds.length === 0) {
      throw new Error('Runtime override entries require entityType, entitySlug, and sourceIds')
    }
    const list = grouped.get(entry.entityType) || []
    list.push(entry)
    grouped.set(entry.entityType, list)
  }

  const touched = []
  for (const [entityType, entries] of grouped.entries()) {
    const plural = entityType === 'herb' ? 'herbs' : entityType === 'compound' ? 'compounds' : null
    if (!plural) throw new Error(`Unsupported runtime override entity type: ${entityType}`)
    const aggregatePath = path.join(dataDir, `${plural}.json`)
    const records = await readJson(aggregatePath)

    for (const entry of entries) {
      const index = records.findIndex((record) => record?.slug === entry.entitySlug || record?.id === entry.entitySlug)
      if (index < 0) throw new Error(`Runtime override aggregate record not found: ${entityType}:${entry.entitySlug}`)
      records[index] = applyEntry(records[index], entry, sourceMap)

      const detailPath = path.join(dataDir, `${plural}-detail`, `${entry.entitySlug}.json`)
      const detail = await readJson(detailPath)
      applyEntry(detail, entry, sourceMap)
      await writeJson(detailPath, detail)
      touched.push(`${entityType}:${entry.entitySlug}`)
    }

    await writeJson(aggregatePath, records)
  }

  console.log(`[enrichment-runtime-overrides] applied ${touched.length} override(s): ${touched.join(', ')}`)
  return { touched }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  applyEnrichmentRuntimeOverrides().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}

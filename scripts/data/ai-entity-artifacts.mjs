import fs from 'node:fs/promises'
import path from 'node:path'
import { buildAiEntityArtifacts as buildBaseAiEntityArtifacts } from './ai-entity-enrichment-lib.mjs'

function normalizeSchemaTypes(value) {
  if (Array.isArray(value)) return value.map(normalizeSchemaTypes)
  if (!value || typeof value !== 'object') return value

  const normalized = {}
  for (const [key, entry] of Object.entries(value)) {
    if (key === '@type') {
      if (entry === 'MedicalSubstance') {
        normalized[key] = 'Substance'
        continue
      }
      if (Array.isArray(entry)) {
        normalized[key] = entry.map((type) => type === 'MedicalSubstance' ? 'Substance' : type)
        continue
      }
    }
    normalized[key] = normalizeSchemaTypes(entry)
  }
  return normalized
}

async function normalizeArtifactDirectory(directory) {
  let names = []
  try {
    names = await fs.readdir(directory)
  } catch {
    return
  }

  await Promise.all(names
    .filter((name) => name.endsWith('.json'))
    .map(async (name) => {
      const filePath = path.join(directory, name)
      const raw = await fs.readFile(filePath, 'utf8')
      if (!raw.includes('MedicalSubstance')) return
      const parsed = JSON.parse(raw)
      const normalized = normalizeSchemaTypes(parsed)
      await fs.writeFile(filePath, `${JSON.stringify(normalized)}\n`, 'utf8')
    }))
}

function hasUsefulValue(value) {
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

function mergeSummaryWithDetail(summary, detail) {
  if (!detail || typeof detail !== 'object' || Array.isArray(detail)) return summary

  const merged = { ...detail }
  for (const [key, value] of Object.entries(summary || {})) {
    // The root arrays are the governance/runtime authority. Keep every useful
    // root value, but let the richer detail payload fill fields that were
    // intentionally omitted or collapsed by summary generation (citations,
    // claims, review provenance, relationships, safety detail, identifiers).
    if (hasUsefulValue(value) || !hasUsefulValue(merged[key])) {
      merged[key] = value
    }
  }
  return merged
}

async function readDetailRecord(dataDir, detailDir, slug) {
  if (!slug) return null
  try {
    const raw = await fs.readFile(path.join(dataDir, detailDir, `${slug}.json`), 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

async function hydrateRecords(records, dataDir, detailDir) {
  const output = []
  const batchSize = 32

  for (let start = 0; start < records.length; start += batchSize) {
    const batch = records.slice(start, start + batchSize)
    const hydrated = await Promise.all(batch.map(async (record) => {
      const slug = String(record?.slug || record?.id || '').trim()
      const detail = await readDetailRecord(dataDir, detailDir, slug)
      return mergeSummaryWithDetail(record, detail)
    }))
    output.push(...hydrated)
  }

  return output
}

function manifestDiscoveryOrder(a, b) {
  const scoreDifference = Number(b?.score || 0) - Number(a?.score || 0)
  if (scoreDifference) return scoreDifference

  const reviewedDifference = Number(Boolean(b?.lastReviewedAt)) - Number(Boolean(a?.lastReviewedAt))
  if (reviewedDifference) return reviewedDifference

  return String(a?.canonicalUrl || a?.dataUrl || '').localeCompare(String(b?.canonicalUrl || b?.dataUrl || ''))
}

async function prioritizePublicManifest(dataDir) {
  const manifestPath = path.join(dataDir, 'ai-entities', 'manifest.json')
  let manifest
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  } catch {
    return
  }

  if (!Array.isArray(manifest?.entities) || manifest.entities.length < 2) return

  manifest.entities = [...manifest.entities].sort(manifestDiscoveryOrder)
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest)}\n`, 'utf8')
}

export async function normalizeAiEntitySchemaTypes(dataDir = 'public/data') {
  const root = path.resolve(process.cwd(), dataDir, 'ai-entities')
  await Promise.all([
    normalizeArtifactDirectory(path.join(root, 'herb')),
    normalizeArtifactDirectory(path.join(root, 'compound')),
  ])
}

export async function buildAiEntityArtifacts(args = {}) {
  const dataDir = path.resolve(process.cwd(), args.dataDir || 'public/data')
  const [herbs, compounds] = await Promise.all([
    hydrateRecords(Array.isArray(args.herbs) ? args.herbs : [], dataDir, 'herbs-detail'),
    hydrateRecords(Array.isArray(args.compounds) ? args.compounds : [], dataDir, 'compounds-detail'),
  ])

  const report = await buildBaseAiEntityArtifacts({
    ...args,
    dataDir,
    herbs,
    compounds,
  })
  await normalizeAiEntitySchemaTypes(dataDir)
  await prioritizePublicManifest(dataDir)
  return report
}

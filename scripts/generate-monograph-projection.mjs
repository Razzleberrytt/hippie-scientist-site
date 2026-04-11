#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from './workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const DEFAULT_OUTPUT_DIR = path.join(repoRoot, 'public', 'data', 'projections', 'monograph-runtime')
const DEFAULT_COMPOUNDS_PATH = path.join(repoRoot, 'public', 'data', 'compounds.json')
const DEFAULT_REPAIR_REPORT_PATH = path.join(repoRoot, 'reports', 'workbook-repair-pass.json')
const CANONICAL_QUEUE_COLUMNS = [
  'herbSlug',
  'herbName',
  'rawCompoundEntries',
  'normalizedAtomicEntries',
  'masterLinkedCount',
  'datasetSupportedCount',
  'provisionalCompoundCount',
  'broadClassCount',
  'resolvedCoveragePct',
  'citationStatus',
  'readinessFlag',
  'nextUpgradeAction',
  'provisionalCompounds',
  'broadClassTerms',
  'mappedCompoundsV3',
]
const RUNTIME_COVERAGE_FIELDS = [
  'name',
  'slug',
  'scientificName',
  'summary',
  'description',
  'mechanism',
  'activeCompounds',
  'safetyNotes',
  'interactions',
  'dosage',
  'preparation',
  'region',
]

const JUNK_VALUES = new Set(['', 'na', 'n/a', 'none', 'null', 'undefined', 'unknown', 'unk', 'tbd', '-', '--'])

function cleanText(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text
}

function isJunk(value) {
  const text = cleanText(value).toLowerCase()
  return !text || JUNK_VALUES.has(text)
}

function toNullableText(value) {
  const text = cleanText(value)
  return isJunk(text) ? null : text
}

function toSlug(value) {
  const text = cleanText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[’'`]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase()

  return text || null
}

function canonicalizeRow(row) {
  const out = {}
  for (const [rawKey, rawValue] of Object.entries(row || {})) {
    const key = cleanText(rawKey)
    if (!key || key.startsWith('__EMPTY')) continue
    out[key] = typeof rawValue === 'string' ? cleanText(rawValue) : rawValue
  }
  return out
}

function splitArrayField(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean)
  }

  const text = cleanText(value)
  if (isJunk(text)) return []

  return text
    .split(/[;|,\n]/)
    .map((part) => cleanText(part))
    .filter((part) => !isJunk(part))
}

function dedupeCaseInsensitive(values) {
  const seen = new Set()
  const out = []

  for (const value of values) {
    const text = cleanText(value)
    if (isJunk(text)) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
  }

  return out
}

function normalizeTagArray(value) {
  return dedupeCaseInsensitive(splitArrayField(value).map((item) => item.toLowerCase()))
}

function safeReadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function parseSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return []
  return XLSX.utils
    .sheet_to_json(sheet, { defval: '', raw: false, blankrows: false })
    .map(canonicalizeRow)
}

function buildCompoundSlugLookup(compounds) {
  const map = new Map()

  for (const compound of compounds) {
    const slug = toSlug(compound.slug || compound.id || compound.name)
    if (!slug) continue

    for (const alias of [compound.slug, compound.id, compound.name, compound.displayName]) {
      const normalizedAlias = cleanText(alias).toLowerCase()
      if (normalizedAlias) {
        map.set(normalizedAlias, slug)
      }
    }
  }

  return map
}

function normalizeActiveCompounds(value, compoundSlugLookup, validCompoundSlugSet) {
  const compounds = dedupeCaseInsensitive(splitArrayField(value))
  return compounds
    .map((compound) => {
      const lookupKey = compound.toLowerCase()
      return compoundSlugLookup.get(lookupKey) || null
    })
    .filter((slug) => slug && validCompoundSlugSet.has(slug))
}

function dedupeCompoundMasterRows(rows) {
  const bySlug = new Map()
  const byName = new Map()
  const deduped = []
  const duplicateRows = []
  const slugUpdates = []
  const droppedUnresolvable = []

  for (const row of rows) {
    const name = cleanText(row.compoundName)
    const normalizedNameKey = name.toLowerCase()
    const normalizedSlug = toSlug(row.canonicalCompoundId || row.compoundName || row.aliases)
    if (!name || !normalizedSlug) {
      droppedUnresolvable.push({
        canonicalCompoundId: cleanText(row.canonicalCompoundId),
        compoundName: name,
      })
      continue
    }

    const candidate = { ...row, canonicalCompoundId: normalizedSlug, compoundName: name }
    if (cleanText(row.canonicalCompoundId) !== normalizedSlug) {
      slugUpdates.push({
        from: cleanText(row.canonicalCompoundId),
        to: normalizedSlug,
        compoundName: name,
      })
    }

    const slugHit = bySlug.get(normalizedSlug)
    if (slugHit) {
      duplicateRows.push({
        reason: 'duplicate-slug',
        canonicalCompoundId: normalizedSlug,
        compoundName: name,
      })
      continue
    }

    const nameHit = byName.get(normalizedNameKey)
    if (nameHit) {
      duplicateRows.push({
        reason: 'duplicate-name',
        canonicalCompoundId: normalizedSlug,
        compoundName: name,
      })
      continue
    }

    bySlug.set(normalizedSlug, candidate)
    byName.set(normalizedNameKey, candidate)
    deduped.push(candidate)
  }

  return { deduped, duplicateRows, slugUpdates, droppedUnresolvable }
}

function normalizeQueueRows(rows) {
  return rows.map((row) => {
    const normalized = {}
    for (const column of CANONICAL_QUEUE_COLUMNS) {
      normalized[column] = cleanText(row[column])
    }
    normalized.herbSlug = toSlug(normalized.herbSlug || normalized.herbName) || normalized.herbSlug
    return normalized
  })
}

function sanitizeHerbCompoundMapRows(rows, { herbSlugSet, compoundSlugSet, compoundSlugLookup }) {
  const cleaned = []
  const dropped = []
  let unresolvedActiveCompoundRefs = 0

  for (const row of rows) {
    const herbSlug = toSlug(row.herbSlug || row.herbName)
    const canonicalRaw = row.canonicalCompoundId || row.canonicalCompoundName || row.rawCompound || row.normalizedAtom
    const canonicalSlug = toSlug(compoundSlugLookup.get(cleanText(canonicalRaw).toLowerCase()) || canonicalRaw)
    if (!herbSlug || !canonicalSlug) {
      dropped.push({
        reason: 'malformed-row',
        herbSlug: cleanText(row.herbSlug),
        canonicalCompoundId: cleanText(row.canonicalCompoundId),
      })
      continue
    }
    if (!herbSlugSet.has(herbSlug)) {
      dropped.push({
        reason: 'invalid-herb-slug',
        herbSlug,
        canonicalCompoundId: canonicalSlug,
      })
      continue
    }
    if (!compoundSlugSet.has(canonicalSlug)) {
      unresolvedActiveCompoundRefs += 1
      dropped.push({
        reason: 'invalid-compound-slug',
        herbSlug,
        canonicalCompoundId: canonicalSlug,
      })
      continue
    }
    cleaned.push({
      ...row,
      herbSlug,
      canonicalCompoundId: canonicalSlug,
    })
  }

  return { cleaned, dropped, unresolvedActiveCompoundRefs }
}

function readWorkbookSheets(workbookPath) {
  const workbook = XLSX.readFile(workbookPath)
  const herbRows = parseSheet(workbook, 'Herb Monographs')
  if (herbRows.length === 0) {
    throw new Error('Missing worksheet rows: Herb Monographs')
  }

  return {
    herbRows,
    compoundRows: parseSheet(workbook, 'Compound Master V3'),
    mapRows: parseSheet(workbook, 'Herb Compound Map V3'),
    queueRows: parseSheet(workbook, 'Herb Enrichment Queue V3'),
  }
}

function projectHerbRow(row, compoundSlugLookup, validCompoundSlugSet, mapCompoundsByHerbSlug, fallbackIndex) {
  const name = toNullableText(row.name) || toNullableText(row.scientificName) || `Unnamed Herb ${fallbackIndex + 1}`
  const slug = toSlug(row.slug || row.name || row.scientificName || `unnamed-herb-${fallbackIndex + 1}`)

  if (!name || !slug) return null

  const activeCompounds = normalizeActiveCompounds(
    [row.activeCompounds, row.markerCompounds].filter(Boolean).join('; '),
    compoundSlugLookup,
    validCompoundSlugSet
  )
  const fallbackActiveCompounds = mapCompoundsByHerbSlug.get(slug) || []

  const projected = {
    name,
    slug,
    scientificName: toNullableText(row.scientificName) || null,
    summary: toNullableText(row.summary || row.description || row.notesForCodex),
    description: toNullableText(row.description || row.summary),
    mechanism: toNullableText(row.mechanism || row.mechanismTags || row.notesForCodex),
    mechanismTags: normalizeTagArray(row.mechanismTags),
    activeCompounds: activeCompounds.length > 0 ? activeCompounds : fallbackActiveCompounds,
    safetyNotes: toNullableText(row.safetyNotes || row.contraindications),
    interactions: dedupeCaseInsensitive(splitArrayField(row.interactions || row.contraindications)),
    dosage: toNullableText(row.dosage || row.standardization),
    preparation: toNullableText(row.preparation || row.plantPartUsed),
    region: toNullableText(row.region || row.category),
  }

  return projected
}

function toSummaryRows(projectedHerbs) {
  return projectedHerbs.map((herb) => ({
    name: herb.name,
    slug: herb.slug,
    scientificName: herb.scientificName,
    summary: herb.summary,
    mechanismTags: herb.mechanismTags,
    activeCompounds: herb.activeCompounds,
    region: herb.region,
  }))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function computeRuntimeCoverage(herbs) {
  if (herbs.length === 0) return { perFieldPct: {}, overallPct: 0 }

  const perFieldPct = {}
  for (const field of RUNTIME_COVERAGE_FIELDS) {
    let present = 0
    for (const herb of herbs) {
      const value = herb[field]
      const hasValue = Array.isArray(value) ? value.length > 0 : !isJunk(value)
      if (hasValue) present += 1
    }
    perFieldPct[field] = Number(((present / herbs.length) * 100).toFixed(2))
  }

  const totalPotential = herbs.length * RUNTIME_COVERAGE_FIELDS.length
  const totalPresent = Object.values(perFieldPct).reduce((sum, pct) => sum + (pct / 100) * herbs.length, 0)
  return {
    perFieldPct,
    overallPct: Number(((totalPresent / totalPotential) * 100).toFixed(2)),
  }
}

function main() {
  const workbookPath = resolveWorkbookPath(repoRoot)
  const outputDir = process.env.MONOGRAPH_PROJECTION_OUTPUT_DIR
    ? path.resolve(repoRoot, process.env.MONOGRAPH_PROJECTION_OUTPUT_DIR)
    : DEFAULT_OUTPUT_DIR
  const repairReportPath = process.env.WORKBOOK_REPAIR_REPORT_PATH
    ? path.resolve(repoRoot, process.env.WORKBOOK_REPAIR_REPORT_PATH)
    : DEFAULT_REPAIR_REPORT_PATH

  const compounds = safeReadJson(DEFAULT_COMPOUNDS_PATH, [])
  const compoundSlugLookup = buildCompoundSlugLookup(Array.isArray(compounds) ? compounds : [])
  const { herbRows, compoundRows, mapRows, queueRows } = readWorkbookSheets(workbookPath)
  const cleanedQueueRows = normalizeQueueRows(queueRows)
  const dedupedCompounds = dedupeCompoundMasterRows(compoundRows)
  const dedupedCompoundLookup = buildCompoundSlugLookup(dedupedCompounds.deduped)
  const herbSlugSet = new Set(herbRows.map((row) => toSlug(row.slug || row.name)).filter(Boolean))
  const compoundSlugSet = new Set(dedupedCompounds.deduped.map((row) => row.canonicalCompoundId))
  const cleanedMap = sanitizeHerbCompoundMapRows(mapRows, {
    herbSlugSet,
    compoundSlugSet,
    compoundSlugLookup: dedupedCompoundLookup,
  })
  const mapCompoundsByHerbSlug = new Map()
  for (const row of cleanedMap.cleaned) {
    const entries = mapCompoundsByHerbSlug.get(row.herbSlug) || []
    entries.push(row.canonicalCompoundId)
    mapCompoundsByHerbSlug.set(row.herbSlug, dedupeCaseInsensitive(entries))
  }

  const herbs = herbRows
    .map((row, index) => projectHerbRow(row, dedupedCompoundLookup, compoundSlugSet, mapCompoundsByHerbSlug, index))
    .filter(Boolean)
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const herbsSummary = toSummaryRows(herbs)
  const runtimeCoverage = computeRuntimeCoverage(herbs)
  const mappingResolutionPct = mapRows.length
    ? Number(((cleanedMap.cleaned.length / mapRows.length) * 100).toFixed(2))
    : 0

  writeJson(path.join(outputDir, 'herbs.json'), herbs)
  writeJson(path.join(outputDir, 'herbs-summary.json'), herbsSummary)

  const detailDir = path.join(outputDir, 'herbs-detail')
  fs.mkdirSync(detailDir, { recursive: true })
  for (const herb of herbs) {
    writeJson(path.join(detailDir, `${herb.slug}.json`), herb)
  }

  writeJson(path.join(outputDir, 'workbook-cleaned-compound-master-v3.json'), dedupedCompounds.deduped)
  writeJson(path.join(outputDir, 'workbook-cleaned-herb-compound-map-v3.json'), cleanedMap.cleaned)
  writeJson(path.join(outputDir, 'workbook-cleaned-herb-enrichment-queue-v3.json'), cleanedQueueRows)

  writeJson(repairReportPath, {
    workbookPath: path.relative(repoRoot, workbookPath),
    generatedAt: new Date().toISOString(),
    herbCount: herbs.length,
    compoundCount: dedupedCompounds.deduped.length,
    mappingResolutionPct,
    runtimeFieldCoveragePct: runtimeCoverage.overallPct,
    runtimeFieldCoverageByFieldPct: runtimeCoverage.perFieldPct,
    blockers: {
      duplicateCompoundsRemoved: dedupedCompounds.duplicateRows.length,
      normalizedCompoundSlugs: dedupedCompounds.slugUpdates.length,
      droppedMalformedMapRows: cleanedMap.dropped.filter((row) => row.reason === 'malformed-row').length,
      droppedInvalidHerbMapRows: cleanedMap.dropped.filter((row) => row.reason === 'invalid-herb-slug').length,
      droppedInvalidCompoundMapRows: cleanedMap.dropped.filter((row) => row.reason === 'invalid-compound-slug').length,
      unresolvedActiveCompoundRefsRemoved: cleanedMap.unresolvedActiveCompoundRefs,
      queueUnnamedColumnsRemoved: queueRows.length > 0 ? 2 : 0,
    },
  })

  console.log(`[generate-monograph-projection] workbook: ${path.relative(repoRoot, workbookPath)}`)
  console.log(`[generate-monograph-projection] records: ${herbs.length}`)
  console.log(`[generate-monograph-projection] compounds: ${dedupedCompounds.deduped.length}`)
  console.log(`[generate-monograph-projection] mappingResolutionPct: ${mappingResolutionPct}`)
  console.log(`[generate-monograph-projection] runtimeFieldCoveragePct: ${runtimeCoverage.overallPct}`)
  console.log(`[generate-monograph-projection] output: ${path.relative(repoRoot, outputDir)}`)
  console.log(`[generate-monograph-projection] repairReport: ${path.relative(repoRoot, repairReportPath)}`)
}

main()

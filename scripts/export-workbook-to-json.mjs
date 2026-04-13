#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from './workbook-source.mjs'
import {
  canonicalizeWorkbookRow,
  hasMeaningfulWorkbookValue,
  normalizeWorkbookCell,
  normalizeWorkbookMultiValue,
} from './workbook-column-mapping.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const workbookPath = resolveWorkbookPath(repoRoot)
const dataDir = path.join(repoRoot, 'public', 'data')
const PRIMARY_HERB_SHEET = 'Site Export Herbs'
const LEGACY_HERB_SHEET = 'Herb Monographs'
const PRIMARY_COMPOUND_SHEET = 'Site Export Compounds'
const LEGACY_COMPOUND_SHEET = 'Compound Master V3'
const HERB_COMPOUND_MAP_SHEET = 'Herb Compound Map V3'
const LEGACY_GOAL_BUNDLE_SHEET = 'Production Export V1'
const EXPORT_WORKBOOK_SHEETS = [
  LEGACY_HERB_SHEET,
  LEGACY_COMPOUND_SHEET,
  HERB_COMPOUND_MAP_SHEET,
  PRIMARY_HERB_SHEET,
  PRIMARY_COMPOUND_SHEET,
  LEGACY_GOAL_BUNDLE_SHEET,
]
const OPTIONAL_WORKBOOK_SHEETS = new Set(['Production Export V1'])
const SHEET_REQUIRED_COLUMNS = {
  'Herb Monographs': ['name'],
  'Compound Master V3': ['compoundName'],
  'Herb Compound Map V3': ['herbSlug', 'canonicalCompoundName'],
  'Site Export Herbs': ['name'],
  'Site Export Compounds': ['compoundName'],
  'Production Export V1': ['goal'],
}

function createDiagnostics() {
  return {
    sheets: Object.fromEntries(
      EXPORT_WORKBOOK_SHEETS.map(sheetName => [
        sheetName,
        {
          loadedRows: 0,
          skippedRows: 0,
          parseWarnings: [],
          missingRequiredColumns: [],
        },
      ])
    ),
  }
}

function toCleanString(value) {
  const cleaned = normalizeWorkbookCell(value)
  if (cleaned === '') return ''
  return String(cleaned).trim()
}

function splitList(value, pattern = /[;|]/) {
  return normalizeWorkbookMultiValue(value, pattern).map(item => toCleanString(item)).filter(Boolean)
}

function cleanScalar(value) {
  const normalized = normalizeWorkbookCell(value)
  if (normalized === '') return ''
  if (typeof normalized === 'string') return toCleanString(normalized)
  return normalized
}

function isMeaningfulValue(value) {
  return hasMeaningfulWorkbookValue(value)
}

function splitSemicolonOrCommaList(value) {
  return splitList(value, /[;,|]/)
}

function withFallbackList(primaryValue, fallbackValue) {
  const primary = splitSemicolonOrCommaList(primaryValue)
  if (primary.length > 0) return primary
  return splitSemicolonOrCommaList(fallbackValue)
}

function firstMeaningful(...values) {
  for (const value of values) {
    const cleaned = cleanScalar(value)
    if (isMeaningfulValue(cleaned)) {
      return cleaned
    }
  }
  return ''
}

function slugify(value) {
  return toCleanString(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function dedupeBy(records, keyFn) {
  const seen = new Set()
  const output = []
  for (const record of records) {
    const key = keyFn(record)
    if (!key || seen.has(key)) continue
    seen.add(key)
    output.push(record)
  }
  return output
}

function removeEmptyValues(input) {
  if (Array.isArray(input)) {
    return input
      .map(item => removeEmptyValues(item))
      .filter(item => item !== '' && item !== null && item !== undefined)
  }

  if (input && typeof input === 'object') {
    const cleanedEntries = Object.entries(input)
      .map(([key, value]) => [key, removeEmptyValues(value)])
      .filter(([, value]) => {
        if (value === '' || value === null || value === undefined) return false
        if (Array.isArray(value) && value.length === 0) return false
        if (typeof value === 'object' && value && Object.keys(value).length === 0) return false
        return true
      })

    return Object.fromEntries(cleanedEntries)
  }

  return input
}

function normalizeRecordSlug(record, fieldName) {
  const raw = toCleanString(record[fieldName])
  if (!raw) return ''
  return slugify(raw)
}

function readSheetRows(workbook, sheetName, diagnostics, { optional = false } = {}) {
  const sheetDiagnostics = diagnostics.sheets[sheetName]
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    if (optional) {
      sheetDiagnostics.parseWarnings.push('Sheet not present; treated as optional and skipped.')
      return []
    }
    throw new Error(`Missing sheet: ${sheetName}`)
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  })
  sheetDiagnostics.loadedRows = rows.length

  const canonicalRows = rows.map(row => canonicalizeWorkbookRow(row, sheetName))
  const requiredColumns = SHEET_REQUIRED_COLUMNS[sheetName] || []
  const observedColumns = new Set(canonicalRows.flatMap(row => Object.keys(row || {})))
  const missingRequiredColumns = requiredColumns.filter(column => !observedColumns.has(column))
  if (missingRequiredColumns.length > 0) {
    sheetDiagnostics.missingRequiredColumns = missingRequiredColumns
    sheetDiagnostics.parseWarnings.push(`Missing required columns: ${missingRequiredColumns.join(', ')}`)
  }

  const nonEmptyRows = canonicalRows.filter(row => {
    const hasData = Object.values(row || {}).some(isMeaningfulValue)
    if (!hasData) sheetDiagnostics.skippedRows += 1
    return hasData
  })

  return nonEmptyRows
}

function mergePrimaryRowsWithFallback(primaryRows, fallbackRows, getKey) {
  const fallbackByKey = new Map()
  for (const row of fallbackRows) {
    const key = toCleanString(getKey(row))
    if (!key || fallbackByKey.has(key)) continue
    fallbackByKey.set(key, row)
  }

  const matchedFallbackKeys = new Set()
  const mergedRows = []
  for (const row of primaryRows) {
    const key = toCleanString(getKey(row))
    const fallback = key ? fallbackByKey.get(key) : null
    if (key && fallback) matchedFallbackKeys.add(key)
    mergedRows.push({ ...(fallback || {}), ...row })
  }

  for (const row of fallbackRows) {
    const key = toCleanString(getKey(row))
    if (primaryRows.length > 0 && key && matchedFallbackKeys.has(key)) continue
    mergedRows.push(row)
  }

  return mergedRows
}

function exportHerbs(workbook, diagnostics) {
  const primaryRows = readSheetRows(workbook, PRIMARY_HERB_SHEET, diagnostics, { optional: true })
  const fallbackRows = readSheetRows(workbook, LEGACY_HERB_SHEET, diagnostics)
  const rows = mergePrimaryRowsWithFallback(
    primaryRows,
    fallbackRows,
    row => firstMeaningful(row.slug, row.herbSlug, row.name ? slugify(row.name) : '')
  )

  const records = rows
    .map(row => ({
      slug: firstMeaningful(row.slug, row.herbSlug, row.name ? slugify(row.name) : ''),
      name: cleanScalar(row.name),
      scientificName: firstMeaningful(row.scientificName, row.latin, row.latinName),
      latin: firstMeaningful(row.scientificName, row.latin, row.latinName),
      category: firstMeaningful(row.category, row.class),
      class: firstMeaningful(row.category, row.class),
      plantPartUsed: cleanScalar(row.plantPartUsed),
      commonNames: splitSemicolonOrCommaList(row.commonNames),
      region: cleanScalar(row.region),
      summary: cleanScalar(row.summary),
      description: cleanScalar(row.description),
      mechanism: cleanScalar(row.mechanism),
      mechanismTags: withFallbackList(row.mechanismTags, row.pathwayTargets),
      evidenceLevel: firstMeaningful(row.evidenceLevel, row.evidence_tier, row.evidenceTier),
      activeCompounds: splitSemicolonOrCommaList(row.activeCompounds),
      topCompounds: splitSemicolonOrCommaList(firstMeaningful(row.topCompounds, row.markerCompounds)),
      markerCompounds: splitSemicolonOrCommaList(row.markerCompounds),
      safetyNotes: cleanScalar(row.safetyNotes),
      interactions: splitSemicolonOrCommaList(row.interactions),
      contraindications: splitSemicolonOrCommaList(row.contraindications),
      preparation: cleanScalar(row.preparation),
      dosage: cleanScalar(row.dosage),
      standardization: cleanScalar(row.standardization),
      qualityConcerns: cleanScalar(row.qualityConcerns),
      confidenceLevel: firstMeaningful(row.confidenceLevel, row.confidence),
      confidence: firstMeaningful(row.confidenceLevel, row.confidence),
      publishStatus: firstMeaningful(row.publishStatus, row.readinessFlag),
      readinessFlag: cleanScalar(row.readinessFlag),
      frontendReadyFlag: cleanScalar(row.frontendReadyFlag),
      completenessPct: cleanScalar(row.completenessPct),
      priorityTier: cleanScalar(row.reviewPriority),
      totalScore: cleanScalar(row.totalScore),
      pathwayTargets: splitSemicolonOrCommaList(row.pathwayTargets),
      compound_count: cleanScalar(row.compound_count),
      pathway_count: cleanScalar(row.pathway_count),
      evidence_tier: cleanScalar(row.evidence_tier),
      sources: splitList([
        row.summaryCitations,
        row.mechanismCitations,
        row.safetyCitations,
        row.interactionCitations,
      ].filter(Boolean).join(';')),
    }))
    .filter(record => Boolean(record.publishStatus))

  const deduped = dedupeBy(records, record => record.slug || record.name).map(record => {
    const withNormalizedSlug = { ...record, slug: normalizeRecordSlug(record, 'slug') }
    return removeEmptyValues(withNormalizedSlug)
  })
  diagnostics.sheets[PRIMARY_HERB_SHEET].skippedRows += records.length - deduped.length
  return deduped
}

function exportCompounds(workbook, diagnostics) {
  const primaryRows = readSheetRows(workbook, PRIMARY_COMPOUND_SHEET, diagnostics, { optional: true })
  const fallbackRows = readSheetRows(workbook, LEGACY_COMPOUND_SHEET, diagnostics)
  const rows = mergePrimaryRowsWithFallback(
    primaryRows,
    fallbackRows,
    row => firstMeaningful(row.canonicalCompoundId, row.compoundName, row.canonicalCompoundName)
  )

  const records = rows.map(row => ({
    id: cleanScalar(row.canonicalCompoundId) || slugify(row.compoundName || row.canonicalCompoundName || row.Compound),
    slug: cleanScalar(row.canonicalCompoundId) || slugify(row.compoundName || row.canonicalCompoundName || row.Compound),
    canonicalCompoundId: cleanScalar(row.canonicalCompoundId) || slugify(row.compoundName || row.canonicalCompoundName || row.Compound),
    name: cleanScalar(row.compoundName || row.canonicalCompoundName || row.Compound),
    compoundName: cleanScalar(row.compoundName || row.canonicalCompoundName || row.Compound),
    canonicalCompoundName: cleanScalar(row.canonicalCompoundName || row.compoundName || row.Compound),
    aliases: splitSemicolonOrCommaList(row.aliases),
    compoundClass: cleanScalar(row.compoundClass),
    class: cleanScalar(row.compoundClass),
    mechanism: cleanScalar(row.mechanism),
    mechanismTags: withFallbackList(row.mechanismTags, row.pathwayTargets),
    pathwayTargets: splitSemicolonOrCommaList(row.pathwayTargets),
    pharmacokinetics: cleanScalar(row.pharmacokinetics),
    safetyNotes: cleanScalar(row.safetyNotes),
    drugInteractions: cleanScalar(row.drugInteractions),
    confidence: cleanScalar(row.confidence),
    confidenceLevel: firstMeaningful(row.confidenceLevel, row.confidence),
    evidence: cleanScalar(row.evidence),
    evidenceTier: firstMeaningful(row.evidenceTier, row.evidence, row.evidence_tier),
    score: firstMeaningful(row.score, row.compoundScore, row.totalScore),
    compoundScore: firstMeaningful(row.compoundScore, row.score, row.totalScore),
    tier: firstMeaningful(row.tier, row.scoreTier),
    sourceUrls: splitList(row.sourceUrls, /\s\|\s/),
    relatedHerbSlugs: splitSemicolonOrCommaList(row.relatedHerbSlugs),
    herbCount: cleanScalar(row.herbCount),
    reverseLookupReady: cleanScalar(row.reverseLookupReady),
  }))

  const deduped = dedupeBy(records, record => record.id || record.name).map(record => {
    const slug = normalizeRecordSlug(record, 'slug')
    const canonicalCompoundId = normalizeRecordSlug({ canonicalCompoundId: record.canonicalCompoundId || record.id }, 'canonicalCompoundId')
    const cleaned = {
      ...record,
      id: canonicalCompoundId || slug,
      slug: slug || canonicalCompoundId,
      canonicalCompoundId: canonicalCompoundId || slug,
    }
    return removeEmptyValues(cleaned)
  })
  diagnostics.sheets[PRIMARY_COMPOUND_SHEET].skippedRows += records.length - deduped.length
  return deduped
}

function exportHerbCompoundMap(workbook, diagnostics) {
  const rows = readSheetRows(workbook, 'Herb Compound Map V3', diagnostics)
  const records = rows.map(row => ({
    herbSlug: firstMeaningful(row.herbSlug, row.slug, row.name ? slugify(row.name) : ''),
    herbName: firstMeaningful(row.herbName, row.name),
    rawCompound: cleanScalar(row.rawCompound),
    normalizedAtom: cleanScalar(row.normalizedAtom),
    canonicalCompoundId: firstMeaningful(
      row.canonicalCompoundId,
      row.canonicalCompoundName ? slugify(row.canonicalCompoundName) : '',
      row.rawCompound ? slugify(row.rawCompound) : ''
    ),
    canonicalCompoundName: firstMeaningful(row.canonicalCompoundName, row.rawCompound),
    v3MatchType: cleanScalar(row.v3MatchType),
    mappingTier: cleanScalar(row.mappingTier),
    mechanismTags: splitSemicolonOrCommaList(row.mechanismTags),
    pathwayTargets: splitSemicolonOrCommaList(row.pathwayTargets),
  }))

  const deduped = dedupeBy(
    records,
    record => `${record.herbSlug}::${record.canonicalCompoundId || record.canonicalCompoundName}::${record.rawCompound}`
  ).map(record =>
    removeEmptyValues({
      ...record,
      herbSlug: normalizeRecordSlug(record, 'herbSlug'),
      canonicalCompoundId: normalizeRecordSlug(record, 'canonicalCompoundId'),
    })
  )
  diagnostics.sheets['Herb Compound Map V3'].skippedRows += records.length - deduped.length
  return deduped
}

function cleanGoalValue(value) {
  if (typeof value === 'string' && value.trim().startsWith('=')) {
    return null
  }
  return cleanScalar(value)
}

function exportGoalBundles(workbook, diagnostics) {
  const rows = readSheetRows(workbook, LEGACY_GOAL_BUNDLE_SHEET, diagnostics, { optional: true })
  const records = rows
    .map(row => ({
      goal: cleanGoalValue(row.goal),
      rank: cleanGoalValue(row.rank),
      stack: cleanGoalValue(row.stack),
      score: cleanGoalValue(row.score),
      segment: cleanGoalValue(row.segment),
      condition_profile: cleanGoalValue(row.condition_profile),
      lineup_slot: cleanGoalValue(row.lineup_slot),
      intent: cleanGoalValue(row.intent),
      time_of_day: cleanGoalValue(row.time_of_day),
      balance_profile: cleanGoalValue(row.balance_profile),
      safety_band: cleanGoalValue(row.safety_band),
      recommendation_class: cleanGoalValue(row.recommendation_class),
      goal_winner_flag: cleanGoalValue(row.goal_winner_flag),
      tag: cleanGoalValue(row.tag),
      release_version: cleanGoalValue(row.release_version),
    }))
    .filter(record => typeof record.goal === 'string' && record.goal.trim() !== '')

  const deduped = dedupeBy(records, record => `${record.goal}::${record.rank}::${record.stack}`)
  diagnostics.sheets['Production Export V1'].skippedRows += records.length - deduped.length
  return deduped
}

function writeJson(filename, records) {
  const outputPath = path.join(dataDir, filename)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`)
  console.log(`[export] ${filename}: ${records.length} records written`)
}

function main() {
  const diagnostics = createDiagnostics()
  const workbook = XLSX.readFile(workbookPath, { sheets: EXPORT_WORKBOOK_SHEETS })
  const ignoredSheets = workbook.SheetNames.filter(sheetName => !EXPORT_WORKBOOK_SHEETS.includes(sheetName))

  for (const sheetName of EXPORT_WORKBOOK_SHEETS) {
    if (!workbook.Sheets[sheetName] && !OPTIONAL_WORKBOOK_SHEETS.has(sheetName)) {
      throw new Error(`Missing sheet: ${sheetName}`)
    }
  }

  writeJson('workbook-herbs.json', exportHerbs(workbook, diagnostics))
  writeJson('workbook-compounds.json', exportCompounds(workbook, diagnostics))
  writeJson('workbook-herb-compound-map.json', exportHerbCompoundMap(workbook, diagnostics))
  writeJson('workbook-goal-bundles.json', exportGoalBundles(workbook, diagnostics))

  console.log(
    `[export][diagnostics] ignored non-target sheets: ${ignoredSheets.length > 0 ? ignoredSheets.join(', ') : '(none)'}`
  )

  for (const sheetName of EXPORT_WORKBOOK_SHEETS) {
    const sheetDiagnostics = diagnostics.sheets[sheetName]
    console.log(
      `[export][diagnostics] ${sheetName}: loaded=${sheetDiagnostics.loadedRows} skipped=${sheetDiagnostics.skippedRows}`
    )
    if (sheetDiagnostics.missingRequiredColumns.length > 0) {
      console.warn(
        `[export][diagnostics] ${sheetName}: missing required columns => ${sheetDiagnostics.missingRequiredColumns.join(', ')}`
      )
    }
    for (const warning of sheetDiagnostics.parseWarnings) {
      console.warn(`[export][diagnostics] ${sheetName}: warning => ${warning}`)
    }
  }
}

main()

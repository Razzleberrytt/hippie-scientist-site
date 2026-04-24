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
const REQUIRED_WORKBOOK_SHEETS = {
  herbs: ['Herb Monographs', 'Herb Master', 'Herb Master Clean'],
  compounds: ['Compound Master V3', 'Compound Master'],
  herbCompoundMap: ['Herb Compound Map V3', 'Herb Compound Map'],
}
const REQUIRED_SHEET_KEYS = Object.keys(REQUIRED_WORKBOOK_SHEETS)
const RESOLVED_REQUIRED_COLUMNS = {
  herbs: ['name'],
  compounds: ['name'],
  herbCompoundMap: ['herbSlug', 'canonicalCompoundId'],
}
const LEGACY_GOAL_BUNDLE_SHEET = 'Production Export V1'
const EXPORT_WORKBOOK_SHEETS = [
  ...REQUIRED_SHEET_KEYS.flatMap(sheetKey => REQUIRED_WORKBOOK_SHEETS[sheetKey]),
  LEGACY_GOAL_BUNDLE_SHEET,
]
const OPTIONAL_WORKBOOK_SHEETS = new Set(['Production Export V1'])
const SHEET_REQUIRED_COLUMNS = {
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

function resolveWorkbookSheets(workbook) {
  const resolvedSheets = {}
  for (const sheetKey of REQUIRED_SHEET_KEYS) {
    const candidates = REQUIRED_WORKBOOK_SHEETS[sheetKey]
    const requiredSheetName = candidates.find(name => workbook.Sheets[name])
    if (!workbook.Sheets[requiredSheetName]) {
      throw new Error(
        `[export] Missing required sheet for "${sheetKey}". Expected one of: ${candidates.join(', ')}`,
      )
    }
    resolvedSheets[sheetKey] = requiredSheetName
    console.log(`[export][sheets] ${sheetKey}: ${requiredSheetName}`)
  }
  return resolvedSheets
}

function parseArgs(argv) {
  return {
    allowLegacyFallback: argv.includes('--allow-legacy-fallback'),
  }
}

function toCleanString(value) {
  const cleaned = normalizeWorkbookCell(value)
  if (cleaned === '') return ''
  return String(cleaned).trim()
}

const JUNK_LIST_TOKENS = new Set(['', 'nan', 'null', 'undefined', '[object object]'])

function isJunkListToken(value) {
  return JUNK_LIST_TOKENS.has(toCleanString(value).toLowerCase())
}

function splitList(value, pattern = /[;|]/) {
  return normalizeWorkbookMultiValue(value, pattern)
    .map(item => toCleanString(item))
    .filter(item => !isJunkListToken(item))
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

const AFFILIATE_PRODUCT_TYPES = new Set(['capsule', 'powder', 'tincture', 'tea', 'extract'])

function normalizeAffiliateProducts(value) {
  if (!isMeaningfulValue(value)) return []

  let parsed = value
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return []
    try {
      parsed = JSON.parse(text)
    } catch {
      return []
    }
  }

  if (!Array.isArray(parsed)) return []

  return parsed
    .map(item => ({
      name: cleanScalar(item?.name),
      type: String(cleanScalar(item?.type)).toLowerCase(),
      affiliateUrl: cleanScalar(item?.affiliateUrl),
    }))
    .filter(
      item =>
        Boolean(item.name) &&
        AFFILIATE_PRODUCT_TYPES.has(item.type) &&
        typeof item.affiliateUrl === 'string' &&
        item.affiliateUrl.startsWith('https://www.amazon.com/s?k='),
    )
}

function normalizeRecordSlug(record, fieldName) {
  const raw = toCleanString(record[fieldName])
  if (!raw) return ''
  return slugify(raw)
}

function readSheetRows(workbook, sheetName, diagnostics, { optional = false, requiredColumns = null } = {}) {
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
  const requiredColumnsToCheck = requiredColumns || SHEET_REQUIRED_COLUMNS[sheetName] || []
  const observedColumns = new Set(canonicalRows.flatMap(row => Object.keys(row || {})))
  const missingRequiredColumns = requiredColumnsToCheck.filter(column => !observedColumns.has(column))
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

function exportHerbs(workbook, diagnostics, resolvedSheets) {
  const rows = readSheetRows(workbook, resolvedSheets.herbs, diagnostics, {
    requiredColumns: RESOLVED_REQUIRED_COLUMNS.herbs,
  })

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
      hero: cleanScalar(row.hero),
      coreInsight: cleanScalar(row.coreInsight),
      primaryActions: withFallbackList(row.primaryActions, firstMeaningful(row.effects, row.actions, row.benefits)),
      mechanisms: withFallbackList(row.mechanisms, firstMeaningful(row.mechanism, row.pathwayTargets)),
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
      traditionalUses: withFallbackList(row.traditionalUses, row.therapeuticUses),
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
      relatedHerbs: splitSemicolonOrCommaList(row.relatedHerbs),
      affiliateProducts: normalizeAffiliateProducts(row.affiliateProducts),
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
    .filter(record => Boolean(record.name))

  const deduped = dedupeBy(records, record => record.slug || record.name).map(record => {
    const withNormalizedSlug = { ...record, slug: normalizeRecordSlug(record, 'slug') }
    return removeEmptyValues(withNormalizedSlug)
  })
  diagnostics.sheets[resolvedSheets.herbs].skippedRows += records.length - deduped.length
  return { records: deduped, fallbackUsage: [] }
}

function exportCompounds(workbook, diagnostics, resolvedSheets) {
  const rows = readSheetRows(workbook, resolvedSheets.compounds, diagnostics, {
    requiredColumns: RESOLVED_REQUIRED_COLUMNS.compounds,
  })

  const records = rows.map(row => ({
    id: cleanScalar(row.canonicalCompoundId) || slugify(row.compoundName || row.name || row.canonicalCompoundName || row.Compound),
    slug: cleanScalar(row.canonicalCompoundId) || slugify(row.compoundName || row.name || row.canonicalCompoundName || row.Compound),
    canonicalCompoundId: cleanScalar(row.canonicalCompoundId) || slugify(row.compoundName || row.name || row.canonicalCompoundName || row.Compound),
    name: cleanScalar(row.compoundName || row.name || row.canonicalCompoundName || row.Compound),
    compoundName: cleanScalar(row.compoundName || row.name || row.canonicalCompoundName || row.Compound),
    canonicalCompoundName: cleanScalar(row.canonicalCompoundName || row.compoundName || row.name || row.Compound),
    hero: cleanScalar(row.hero),
    coreInsight: cleanScalar(row.coreInsight),
    primaryActions: withFallbackList(row.primaryActions, firstMeaningful(row.effects, row.actions, row.benefits)),
    mechanisms: withFallbackList(row.mechanisms, firstMeaningful(row.mechanism, row.pathwayTargets)),
    aliases: splitSemicolonOrCommaList(row.aliases),
    compoundClass: cleanScalar(row.compoundClass),
    class: cleanScalar(row.compoundClass),
    mechanism: cleanScalar(row.mechanism),
    mechanismTags: withFallbackList(row.mechanismTags, row.pathwayTargets),
    pathwayTargets: splitSemicolonOrCommaList(row.pathwayTargets),
    targets: splitSemicolonOrCommaList(row.targets),
    pathways: withFallbackList(row.pathways, row.pathwayTargets),
    foundIn: splitSemicolonOrCommaList(row.foundIn),
    bioavailability: cleanScalar(row.bioavailability),
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
    relatedCompounds: splitSemicolonOrCommaList(row.relatedCompounds),
    herbCount: cleanScalar(row.herbCount),
    reverseLookupReady: cleanScalar(row.reverseLookupReady),
  }))

  const deduped = dedupeBy(records.filter(record => Boolean(record.name)), record => record.id || record.name).map(record => {
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
  diagnostics.sheets[resolvedSheets.compounds].skippedRows += records.length - deduped.length
  return { records: deduped, fallbackUsage: [] }
}

function exportHerbCompoundMap(workbook, diagnostics, resolvedSheets) {
  const rows = readSheetRows(workbook, resolvedSheets.herbCompoundMap, diagnostics, {
    requiredColumns: RESOLVED_REQUIRED_COLUMNS.herbCompoundMap,
  })
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
  diagnostics.sheets[resolvedSheets.herbCompoundMap].skippedRows += records.length - deduped.length
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

function writeReportJson(relativePath, records) {
  const outputPath = path.join(repoRoot, relativePath)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`)
  console.log(`[export] ${relativePath}: ${records.length} records written`)
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const diagnostics = createDiagnostics()
  const workbook = XLSX.readFile(workbookPath, { sheets: EXPORT_WORKBOOK_SHEETS })
  const resolvedSheets = resolveWorkbookSheets(workbook)
  const ignoredSheets = workbook.SheetNames.filter(sheetName => !EXPORT_WORKBOOK_SHEETS.includes(sheetName))

  for (const sheetName of EXPORT_WORKBOOK_SHEETS) {
    const isRequiredAlias = REQUIRED_SHEET_KEYS.some(sheetKey => REQUIRED_WORKBOOK_SHEETS[sheetKey].includes(sheetName))
    if (isRequiredAlias) continue
    if (!workbook.Sheets[sheetName] && !OPTIONAL_WORKBOOK_SHEETS.has(sheetName)) {
      throw new Error(`Missing sheet: ${sheetName}`)
    }
  }

  const herbsExport = exportHerbs(workbook, diagnostics, resolvedSheets)
  const compoundsExport = exportCompounds(workbook, diagnostics, resolvedSheets)
  const fallbackUsage = [...herbsExport.fallbackUsage, ...compoundsExport.fallbackUsage]

  writeJson('workbook-herbs.json', herbsExport.records)
  writeJson('workbook-compounds.json', compoundsExport.records)
  writeJson('workbook-herb-compound-map.json', exportHerbCompoundMap(workbook, diagnostics, resolvedSheets))
  writeJson('workbook-goal-bundles.json', exportGoalBundles(workbook, diagnostics))
  writeReportJson('reports/workbook-fallback-usage.json', fallbackUsage)
  if (options.allowLegacyFallback) {
    console.warn(`[export] legacy fallback enabled via --allow-legacy-fallback. fallback rows used=${fallbackUsage.length}`)
  }

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

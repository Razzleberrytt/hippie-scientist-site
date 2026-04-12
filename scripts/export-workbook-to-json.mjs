#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from './workbook-source.mjs'
import { canonicalizeWorkbookRow } from './workbook-column-mapping.mjs'

const repoRoot = process.cwd()
const workbookPath = resolveWorkbookPath(repoRoot)
const dataDir = path.join(repoRoot, 'public', 'data')
const EXPORT_WORKBOOK_SHEETS = ['Herb Monographs', 'Compound Master V3', 'Herb Compound Map V3', 'Production Export V1']
const OPTIONAL_WORKBOOK_SHEETS = new Set(['Production Export V1'])
const WEAK_TEXT_VALUES = new Set(['nan', 'null', 'undefined', 'n/a', 'na', 'none', 'nil'])
const SHEET_REQUIRED_COLUMNS = {
  'Herb Monographs': ['name', 'publishStatus'],
  'Compound Master V3': ['compoundName'],
  'Herb Compound Map V3': ['herbSlug', 'canonicalCompoundId'],
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
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (WEAK_TEXT_VALUES.has(text.toLowerCase())) return ''
  return text
}

function splitList(value, pattern = /[;|]/) {
  const text = toCleanString(value)
  if (!text) return []
  return [...new Set(text.split(pattern).map(item => toCleanString(item)).filter(Boolean))]
}

function cleanScalar(value) {
  if (value == null) return ''
  if (typeof value === 'string') return toCleanString(value)
  return value
}

function isMeaningfulValue(value) {
  if (value == null) return false
  if (typeof value === 'string') return toCleanString(value) !== ''
  return true
}

function splitSemicolonOrCommaList(value) {
  return splitList(value, /[;,|]/)
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

function exportHerbs(workbook, diagnostics) {
  const rows = readSheetRows(workbook, 'Herb Monographs', diagnostics)

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
      mechanismTags: splitSemicolonOrCommaList(row.mechanismTags),
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

  const deduped = dedupeBy(records, record => record.slug || record.name)
  diagnostics.sheets['Herb Monographs'].skippedRows += records.length - deduped.length
  return deduped
}

function exportCompounds(workbook, diagnostics) {
  const rows = readSheetRows(workbook, 'Compound Master V3', diagnostics)
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
    mechanismTags: splitSemicolonOrCommaList(row.mechanismTags),
    pathwayTargets: splitSemicolonOrCommaList(row.pathwayTargets),
    pharmacokinetics: cleanScalar(row.pharmacokinetics),
    safetyNotes: cleanScalar(row.safetyNotes),
    drugInteractions: cleanScalar(row.drugInteractions),
    confidence: cleanScalar(row.confidence),
    confidenceLevel: firstMeaningful(row.confidenceLevel, row.confidence),
    evidence: cleanScalar(row.evidence),
    evidenceTier: firstMeaningful(row.evidenceTier, row.evidence, row.evidence_tier),
    score: firstMeaningful(row.score, row.totalScore),
    tier: firstMeaningful(row.tier, row.scoreTier),
    sourceUrls: splitList(row.sourceUrls, /\s\|\s/),
    relatedHerbSlugs: splitSemicolonOrCommaList(row.relatedHerbSlugs),
    herbCount: cleanScalar(row.herbCount),
    reverseLookupReady: cleanScalar(row.reverseLookupReady),
  }))

  const deduped = dedupeBy(records, record => record.id || record.name)
  diagnostics.sheets['Compound Master V3'].skippedRows += records.length - deduped.length
  return deduped
}

function exportHerbCompoundMap(workbook, diagnostics) {
  const rows = readSheetRows(workbook, 'Herb Compound Map V3', diagnostics)
  const records = rows.map(row => ({
    herbSlug: cleanScalar(row.herbSlug),
    herbName: cleanScalar(row.herbName),
    rawCompound: cleanScalar(row.rawCompound),
    normalizedAtom: cleanScalar(row.normalizedAtom),
    canonicalCompoundId: cleanScalar(row.canonicalCompoundId),
    canonicalCompoundName: cleanScalar(row.canonicalCompoundName),
    v3MatchType: cleanScalar(row.v3MatchType),
    mappingTier: cleanScalar(row.mappingTier),
    mechanismTags: splitSemicolonOrCommaList(row.mechanismTags),
    pathwayTargets: splitSemicolonOrCommaList(row.pathwayTargets),
  }))

  const deduped = dedupeBy(records, record => `${record.herbSlug}::${record.canonicalCompoundId}::${record.rawCompound}`)
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
  const rows = readSheetRows(workbook, 'Production Export V1', diagnostics, { optional: true })
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
  const workbook = XLSX.readFile(workbookPath)

  for (const sheetName of EXPORT_WORKBOOK_SHEETS) {
    if (!workbook.Sheets[sheetName] && !OPTIONAL_WORKBOOK_SHEETS.has(sheetName)) {
      throw new Error(`Missing sheet: ${sheetName}`)
    }
  }

  writeJson('workbook-herbs.json', exportHerbs(workbook, diagnostics))
  writeJson('workbook-compounds.json', exportCompounds(workbook, diagnostics))
  writeJson('workbook-herb-compound-map.json', exportHerbCompoundMap(workbook, diagnostics))
  writeJson('workbook-goal-bundles.json', exportGoalBundles(workbook, diagnostics))

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

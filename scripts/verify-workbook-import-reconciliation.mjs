#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from './workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const workbookPath = resolveWorkbookPath(repoRoot)
const REQUIRED_WORKBOOK_SHEETS = {
  herbs: ['Herb Master V3'],
  compounds: ['Compound Master V3'],
  herbCompoundMap: ['Herb Compound Map V3'],
  claimRows: ['Claim Rows'],
  researchQueue: ['Research Queue'],
}
const herbsPath = path.join(repoRoot, 'public', 'data', 'herbs.json')
const compoundsPath = path.join(repoRoot, 'public', 'data', 'compounds.json')
const workbookHerbsPath = path.join(repoRoot, 'public', 'data', 'workbook-herbs.json')
const workbookCompoundsPath = path.join(repoRoot, 'public', 'data', 'workbook-compounds.json')

function clean(value) {
  return String(value ?? '').trim().toLowerCase()
}

function resolveWorkbookSheet(workbook, candidates, label) {
  const resolved = candidates.find(name => workbook.Sheets[name])
  if (!resolved) {
    throw new Error(
      `[verify-workbook-import-reconciliation] Missing required sheet for "${label}". Expected one of: ${candidates.join(', ')}`
    )
  }
  return resolved
}

function baselineCounts() {
  const workbook = XLSX.readFile(workbookPath, {
    sheets: Object.values(REQUIRED_WORKBOOK_SHEETS).flat(),
  })
  const herbsSheet = resolveWorkbookSheet(workbook, REQUIRED_WORKBOOK_SHEETS.herbs, 'herbs')
  const compoundsSheet = resolveWorkbookSheet(workbook, REQUIRED_WORKBOOK_SHEETS.compounds, 'compounds')
  const herbRows = XLSX.utils.sheet_to_json(workbook.Sheets[herbsSheet], { defval: '', raw: false, blankrows: false })
  const compoundRows = XLSX.utils.sheet_to_json(workbook.Sheets[compoundsSheet], { defval: '', raw: false, blankrows: false })
  const herbCompoundMapSheet = resolveWorkbookSheet(workbook, REQUIRED_WORKBOOK_SHEETS.herbCompoundMap, 'herbCompoundMap')
  const claimRowsSheet = resolveWorkbookSheet(workbook, REQUIRED_WORKBOOK_SHEETS.claimRows, 'claimRows')
  const researchQueueSheet = resolveWorkbookSheet(workbook, REQUIRED_WORKBOOK_SHEETS.researchQueue, 'researchQueue')
  const herbCompoundMapRows = XLSX.utils.sheet_to_json(workbook.Sheets[herbCompoundMapSheet], { defval: '', raw: false, blankrows: false })
  const claimRows = XLSX.utils.sheet_to_json(workbook.Sheets[claimRowsSheet], { defval: '', raw: false, blankrows: false })
  const researchQueueRows = XLSX.utils.sheet_to_json(workbook.Sheets[researchQueueSheet], { defval: '', raw: false, blankrows: false })

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'))
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'))

  const herbBySlug = new Map()
  const herbByName = new Map()
  for (const herb of herbs) {
    if (herb.slug) herbBySlug.set(clean(herb.slug), herb)
    if (herb.name) herbByName.set(clean(herb.name), herb)
  }

  const compoundById = new Map()
  const compoundByName = new Map()
  for (const compound of compounds) {
    if (compound.id) compoundById.set(String(compound.id).trim(), compound)
    if (compound.name) compoundByName.set(clean(compound.name), compound)
  }

  let herbMatches = 0
  for (const row of herbRows) {
    const hit = herbBySlug.get(clean(row.slug)) || herbByName.get(clean(row.name))
    if (hit) herbMatches += 1
  }

  let compoundMatches = 0
  for (const row of compoundRows) {
    const hit = compoundById.get(String(row.canonicalCompoundId ?? row.id ?? row.slug ?? '').trim()) || compoundByName.get(clean(row.compoundName ?? row.name))
    if (hit) compoundMatches += 1
  }

  const missingRequiredHerbFields = herbRows
    .map((row, index) => ({
      row: index + 2,
      missing: ['name'].filter((field) => !String(row[field] ?? '').trim()),
    }))
    .filter((entry) => entry.missing.length > 0)

  return {
    herbRows: herbRows.length,
    herbMatches,
    compoundRows: compoundRows.length,
    herbCompoundMapRows: herbCompoundMapRows.length,
    claimRows: claimRows.length,
    researchQueueRows: researchQueueRows.length,
    compoundMatches,
    missingRequiredHerbFields,
    herbRowsData: herbRows,
    compoundRowsData: compoundRows,
  }
}

function buildMap(records, keyFn) {
  const map = new Map()
  for (const record of records) {
    const key = keyFn(record)
    if (!key) continue
    map.set(key, record)
  }
  return map
}

function countDistinctKeys(records, keyFn) {
  const keys = new Set()
  for (const record of records) {
    const key = keyFn(record)
    if (!key) continue
    keys.add(key)
  }
  return keys.size
}

function detectMissingEntries(sheetRows, exportedRows, keyLabel, keyFn) {
  const exportedMap = buildMap(exportedRows, keyFn)
  const missing = []
  for (const row of sheetRows) {
    const key = keyFn(row)
    if (!key) continue
    if (!exportedMap.has(key)) {
      missing.push({ [keyLabel]: key })
    }
  }
  return missing
}

function detectFieldMismatches(sheetRows, exportedRows, keyFn, fields, entityLabel) {
  const exportedMap = buildMap(exportedRows, keyFn)
  const mismatches = []

  for (const row of sheetRows) {
    const key = keyFn(row)
    if (!key) continue
    const exported = exportedMap.get(key)
    if (!exported) continue

    const fieldDiffs = fields
      .map((field) => {
        const sourceValue = String(row?.[field] ?? '').trim()
        const exportedValue = String(exported?.[field] ?? '').trim()
        if (clean(sourceValue) === clean(exportedValue)) return null
        return {
          field,
          source: sourceValue,
          exported: exportedValue,
        }
      })
      .filter(Boolean)

    if (fieldDiffs.length > 0) {
      mismatches.push({
        [entityLabel]: key,
        fields: fieldDiffs,
      })
    }
  }

  return mismatches
}

function runDryImport() {
  const output = execFileSync('node', ['scripts/import-xlsx-monographs.mjs', '--dry-run'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  const herbMatch = output.match(/herbs => matched-and-patched: (\d+), matched-no-change: (\d+), unmatched: (\d+)/)
  const compoundMatch = output.match(/compounds => matched-and-patched: (\d+), matched-no-change: (\d+), unmatched: (\d+)/)

  if (!herbMatch || !compoundMatch) {
    throw new Error('Unable to parse importer output for reconciliation verification.')
  }

  return {
    herbMatched: Number(herbMatch[1]) + Number(herbMatch[2]),
    herbUnmatched: Number(herbMatch[3]),
    compoundMatched: Number(compoundMatch[1]) + Number(compoundMatch[2]),
    compoundUnmatched: Number(compoundMatch[3]),
    output,
  }
}

function runWorkbookExport() {
  execFileSync('node', ['scripts/export-workbook-to-json.mjs'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[verify-workbook-import-reconciliation] ${message}`)
  }
}

function main() {
  runWorkbookExport()
  const baseline = baselineCounts()
  const reconciled = runDryImport()
  const workbookHerbs = JSON.parse(fs.readFileSync(workbookHerbsPath, 'utf8'))
  const workbookCompounds = JSON.parse(fs.readFileSync(workbookCompoundsPath, 'utf8'))
  const herbName = record => record?.name ?? record?.herbName
  const herbSlug = record => record?.slug ?? record?.herbSlug ?? (herbName(record) ? String(herbName(record)) : '')
  const compoundName = record => record?.compoundName ?? record?.name ?? record?.canonicalCompoundName ?? record?.compound
  const compoundId = record => record?.canonicalCompoundId ?? record?.id ?? record?.slug
  const herbKey = record => clean(herbSlug(record)) || clean(herbName(record))
  const compoundKey = record => clean(compoundId(record)) || clean(compoundName(record))
  const herbSourceDistinctCount = countDistinctKeys(baseline.herbRowsData, herbKey)
  const compoundSourceDistinctCount = countDistinctKeys(baseline.compoundRowsData, compoundKey)

  assert(reconciled.herbMatched <= baseline.herbRows, 'Suspicious over-matching detected for herbs.')
  assert(reconciled.compoundMatched <= baseline.compoundRows, 'Suspicious over-matching detected for compounds.')
  assert(baseline.herbRows > 0, 'Herb Master has zero rows.')
  assert(baseline.compoundRows > 0, 'Compound Master has zero rows.')
  assert(baseline.herbCompoundMapRows > 0, 'Herb Compound Map has zero rows.')
  assert(baseline.claimRows > 0, 'Claim Rows has zero rows.')
  assert(baseline.researchQueueRows > 0, 'Research Queue has zero rows.')
  assert(Array.isArray(workbookHerbs) && workbookHerbs.length > 0, 'workbook-herbs.json export is empty.')
  assert(Array.isArray(workbookCompounds) && workbookCompounds.length > 0, 'workbook-compounds.json export is empty.')
  assert(
    baseline.herbRows === reconciled.herbMatched + reconciled.herbUnmatched,
    `Row count parity failed for herbs: Herb Master rows=${baseline.herbRows}, dry-run matched+unmatched=${reconciled.herbMatched + reconciled.herbUnmatched}.`,
  )
  assert(
    baseline.compoundRows === reconciled.compoundMatched + reconciled.compoundUnmatched,
    `Row count parity failed for compounds: Compound Master rows=${baseline.compoundRows}, dry-run matched+unmatched=${reconciled.compoundMatched + reconciled.compoundUnmatched}.`,
  )
  assert(
    baseline.missingRequiredHerbFields.length === 0,
    `Missing required Herb Master fields: ${JSON.stringify(baseline.missingRequiredHerbFields.slice(0, 10))}`,
  )

  const missingHerbEntries = detectMissingEntries(baseline.herbRowsData, workbookHerbs, 'slugOrName', herbKey)
  const missingCompoundEntries = detectMissingEntries(baseline.compoundRowsData, workbookCompounds, 'canonicalCompoundIdOrName', compoundKey)
  assert(
    missingHerbEntries.length === 0,
    `Missing herb entries in workbook-herbs.json (sample): ${JSON.stringify(missingHerbEntries.slice(0, 10))}`,
  )
  assert(
    missingCompoundEntries.length === 0,
    `Missing compound entries in workbook-compounds.json (sample): ${JSON.stringify(missingCompoundEntries.slice(0, 10))}`,
  )

  const herbFieldMismatches = detectFieldMismatches(
    baseline.herbRowsData,
    workbookHerbs,
    herbKey,
    ['name', 'hero', 'coreInsight'],
    'slugOrName',
  )
  const compoundFieldMismatches = detectFieldMismatches(
    baseline.compoundRowsData,
    workbookCompounds,
    compoundKey,
    ['name', 'slug'],
    'canonicalCompoundIdOrName',
  )
  assert(
    herbFieldMismatches.length === 0,
    `Herb field mismatch detected between Herb Master and workbook-herbs.json (sample): ${JSON.stringify(herbFieldMismatches.slice(0, 10))}`,
  )
  assert(
    compoundFieldMismatches.length === 0,
    `Compound field mismatch detected between Compound Master and workbook-compounds.json (sample): ${JSON.stringify(compoundFieldMismatches.slice(0, 10))}`,
  )

  const duplicateHerbSlugs = workbookHerbs
    .map(item => String(item?.slug ?? '').trim().toLowerCase())
    .filter(Boolean)
    .filter((slug, index, arr) => arr.indexOf(slug) !== index)
  const duplicateCompoundSlugs = workbookCompounds
    .map(item => String(item?.slug ?? item?.id ?? '').trim().toLowerCase())
    .filter(Boolean)
    .filter((slug, index, arr) => arr.indexOf(slug) !== index)
  assert(duplicateHerbSlugs.length === 0, `Duplicate herb slugs in workbook export: ${JSON.stringify([...new Set(duplicateHerbSlugs)].slice(0, 10))}`)
  assert(duplicateCompoundSlugs.length === 0, `Duplicate compound slugs in workbook export: ${JSON.stringify([...new Set(duplicateCompoundSlugs)].slice(0, 10))}`)

  const unmatchedHerbsReport = path.join(repoRoot, 'reports', 'workbook-unmatched-herbs.json')
  const unmatchedCompoundsReport = path.join(repoRoot, 'reports', 'workbook-unmatched-compounds.json')
  assert(fs.existsSync(unmatchedHerbsReport), 'Missing reports/workbook-unmatched-herbs.json')
  assert(fs.existsSync(unmatchedCompoundsReport), 'Missing reports/workbook-unmatched-compounds.json')

  const unmatchedHerbs = JSON.parse(fs.readFileSync(unmatchedHerbsReport, 'utf8'))
  const unmatchedCompounds = JSON.parse(fs.readFileSync(unmatchedCompoundsReport, 'utf8'))

  assert(Array.isArray(unmatchedHerbs), 'Unmatched herbs report must be an array.')
  assert(Array.isArray(unmatchedCompounds), 'Unmatched compounds report must be an array.')
  assert(unmatchedHerbs.length === reconciled.herbUnmatched, 'Unmatched herb report count mismatch.')
  assert(unmatchedCompounds.length === reconciled.compoundUnmatched, 'Unmatched compound report count mismatch.')

  console.log('[verify-workbook-import-reconciliation] baseline exact-match coverage:')
  console.log(`  herbs: ${baseline.herbMatches}/${baseline.herbRows}`)
  console.log(`  compounds: ${baseline.compoundMatches}/${baseline.compoundRows}`)
  console.log('[verify-workbook-import-reconciliation] reconciled dry-run coverage:')
  console.log(`  herbs: ${reconciled.herbMatched}/${baseline.herbRows}`)
  console.log(`  compounds: ${reconciled.compoundMatched}/${baseline.compoundRows}`)
}

main()

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
const REQUIRED_WORKBOOK_SHEETS = ['Site Export Herbs', 'Site Export Compounds']
const herbsPath = path.join(repoRoot, 'public', 'data', 'herbs.json')
const compoundsPath = path.join(repoRoot, 'public', 'data', 'compounds.json')
const workbookHerbsPath = path.join(repoRoot, 'public', 'data', 'workbook-herbs.json')
const workbookCompoundsPath = path.join(repoRoot, 'public', 'data', 'workbook-compounds.json')

function clean(value) {
  return String(value ?? '').trim().toLowerCase()
}

function baselineCounts() {
  const workbook = XLSX.readFile(workbookPath, { sheets: REQUIRED_WORKBOOK_SHEETS })
  const herbRows = XLSX.utils.sheet_to_json(workbook.Sheets[REQUIRED_WORKBOOK_SHEETS[0]], { defval: '', raw: false, blankrows: false })
  const compoundRows = XLSX.utils.sheet_to_json(workbook.Sheets[REQUIRED_WORKBOOK_SHEETS[1]], { defval: '', raw: false, blankrows: false })

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
    const hit = compoundById.get(String(row.canonicalCompoundId ?? '').trim()) || compoundByName.get(clean(row.compoundName))
    if (hit) compoundMatches += 1
  }

  const missingRequiredHerbFields = herbRows
    .map((row, index) => ({
      row: index + 2,
      missing: ['name', 'hero', 'coreInsight'].filter((field) => !String(row[field] ?? '').trim()),
    }))
    .filter((entry) => entry.missing.length > 0)

  return {
    herbRows: herbRows.length,
    herbMatches,
    compoundRows: compoundRows.length,
    compoundMatches,
    missingRequiredHerbFields,
  }
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

  assert(reconciled.herbMatched <= baseline.herbRows, 'Suspicious over-matching detected for herbs.')
  assert(reconciled.compoundMatched <= baseline.compoundRows, 'Suspicious over-matching detected for compounds.')
  assert(baseline.herbRows > 0, 'Site Export Herbs has zero rows.')
  assert(baseline.compoundRows > 0, 'Site Export Compounds has zero rows.')
  assert(Array.isArray(workbookHerbs) && workbookHerbs.length > 0, 'workbook-herbs.json export is empty.')
  assert(Array.isArray(workbookCompounds) && workbookCompounds.length > 0, 'workbook-compounds.json export is empty.')
  assert(baseline.herbRows >= workbookHerbs.length, 'Workbook herb row count must be >= exported herb count.')
  assert(baseline.compoundRows >= workbookCompounds.length, 'Workbook compound row count must be >= exported compound count.')
  assert(baseline.missingRequiredHerbFields.length === 0, `Missing required Site Export Herbs fields: ${JSON.stringify(baseline.missingRequiredHerbFields.slice(0, 10))}`)

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

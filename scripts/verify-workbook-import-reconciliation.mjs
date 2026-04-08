#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'

const repoRoot = process.cwd()
const workbookPath = path.join(repoRoot, 'data-sources', 'herb_monograph_master.xlsx')
const herbsPath = path.join(repoRoot, 'public', 'data', 'herbs.json')
const compoundsPath = path.join(repoRoot, 'public', 'data', 'compounds.json')

function clean(value) {
  return String(value ?? '').trim().toLowerCase()
}

function baselineCounts() {
  const workbook = XLSX.readFile(workbookPath)
  const herbRows = XLSX.utils.sheet_to_json(workbook.Sheets['Herb Monographs'], { defval: '', raw: false, blankrows: false })
  const compoundRows = XLSX.utils.sheet_to_json(workbook.Sheets['Compound Master V3'], { defval: '', raw: false, blankrows: false })

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

  return { herbRows: herbRows.length, herbMatches, compoundRows: compoundRows.length, compoundMatches }
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[verify-workbook-import-reconciliation] ${message}`)
  }
}

function main() {
  const baseline = baselineCounts()
  const reconciled = runDryImport()

  assert(reconciled.herbMatched >= baseline.herbMatches, 'Herb reconciliation reduced match coverage.')
  assert(reconciled.compoundMatched > baseline.compoundMatches, 'Compound reconciliation did not improve match coverage.')

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

#!/usr/bin/env node

/**
 * Fail production builds that accidentally collapse the public indexable corpus.
 *
 * This is intentionally a floor, not a target. Editorial/governance decisions may
 * demote profiles, but a build-pipeline regression must not silently turn hundreds
 * of publishable pages into NOINDEX output.
 */

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const dataDir = path.resolve(root, dataDirArg ? dataDirArg.split('=')[1] : 'public/data')
const budgetPath = path.join(root, 'config', 'indexability-production-budget.json')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function readSummary(fileName) {
  const filePath = path.join(dataDir, 'summary-indexes', fileName)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing summary index: ${path.relative(root, filePath)}`)
  }
  const parsed = readJson(filePath)
  if (Array.isArray(parsed)) return parsed
  const array = Object.values(parsed).find(Array.isArray)
  if (!array) throw new Error(`No record array found in ${path.relative(root, filePath)}`)
  return array
}

function isIndexable(record) {
  return (
    String(record?.indexability_status || '').toUpperCase() === 'PUBLISH' &&
    !/noindex/i.test(String(record?.robots || '')) &&
    record?.sitemap_included === true
  )
}

if (!fs.existsSync(budgetPath)) {
  throw new Error(`Missing production indexability budget: ${path.relative(root, budgetPath)}`)
}

const budget = readJson(budgetPath)
const herbs = readSummary('herbs-summary.json')
const compounds = readSummary('compounds-summary.json')
const herbCount = herbs.filter(isIndexable).length
const compoundCount = compounds.filter(isIndexable).length
const total = herbCount + compoundCount

const failures = []
if (total < Number(budget.minimumTotalProfiles || 0)) {
  failures.push(`total ${total} < minimum ${budget.minimumTotalProfiles}`)
}
if (herbCount < Number(budget.minimumHerbs || 0)) {
  failures.push(`herbs ${herbCount} < minimum ${budget.minimumHerbs}`)
}
if (compoundCount < Number(budget.minimumCompounds || 0)) {
  failures.push(`compounds ${compoundCount} < minimum ${budget.minimumCompounds}`)
}

console.log('[validate-production-indexability-budget]')
console.log(`  herbs indexable:     ${herbCount}`)
console.log(`  compounds indexable: ${compoundCount}`)
console.log(`  total indexable:     ${total}`)

if (failures.length) {
  console.error('\n[validate-production-indexability-budget] FAILED — production indexability collapsed below the guarded floor:')
  for (const failure of failures) console.error(`  - ${failure}`)
  console.error('This is a deployment blocker. Fix the pipeline/data regression or deliberately revise the reviewed budget in config/indexability-production-budget.json.')
  process.exit(1)
}

console.log('[validate-production-indexability-budget] PASS')

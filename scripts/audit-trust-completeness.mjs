#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveWorkbookPath } from './workbook-source.mjs'
import { readWorkbook, getSheet, sheetToRows } from './data/workbook-parser.mjs'

const REVIEWED_WITHOUT_BATCH_ONE_CHANGES = [
  'glycine-sleep',
  'inositol-sleep',
  'eaa-blend',
  'electrolyte-blend',
  'taurine-blend',
]

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function safetyTargetSlugs(repoRoot) {
  const patchDir = path.join(repoRoot, 'data-sources', 'workbook-patches')
  const files = [
    'safety-coverage-batch-1-2026-07-15.json',
    'safety-coverage-batch-2-2026-07-15.json',
  ]
  const slugs = files.flatMap(file => readJson(path.join(patchDir, file)).changes.map(change => change.slug))
  return new Set([...slugs, ...REVIEWED_WITHOUT_BATCH_ONE_CHANGES])
}

function completedTrustSlugs(repoRoot) {
  const patchDir = path.join(repoRoot, 'data-sources', 'workbook-patches')
  const files = fs.readdirSync(patchDir).filter(file => /^trust-completeness-batch-.*\.json$/i.test(file))
  const slugs = []
  for (const file of files) {
    const patch = readJson(path.join(patchDir, file))
    if (patch.status !== 'applied') continue
    for (const change of patch.changes || []) {
      if (change.column === 'runtime_safety') slugs.push(change.slug)
    }
  }
  return new Set(slugs)
}

async function main() {
  const repoRoot = process.cwd()
  const targets = safetyTargetSlugs(repoRoot)
  const completed = completedTrustSlugs(repoRoot)
  const workbook = await readWorkbook(resolveWorkbookPath(repoRoot))
  const rows = sheetToRows(getSheet(workbook, 'Entity_Master'))
  const bySlug = new Map(rows.map(row => [String(row.slug || '').trim(), row]))
  const compounds = readJson(path.join(repoRoot, 'public', 'data', 'compounds.json'))
  const runtimeBySlug = new Map(compounds.map(record => [record.slug, record]))
  const errors = []

  for (const slug of completed) {
    if (!targets.has(slug)) errors.push(`${slug}: trust patch is outside the reviewed safety queue`)
    const row = bySlug.get(slug)
    const runtime = runtimeBySlug.get(slug)
    const workbookSafety = String(row?.runtime_safety || '').trim()
    const runtimeSafety = String(runtime?.safety || '').trim()
    if (!/^Safety evidence:/i.test(workbookSafety)) errors.push(`${slug}: runtime_safety lacks a Safety evidence label`)
    if (!runtimeSafety) errors.push(`${slug}: generated runtime safety is empty`)
    if (runtimeSafety !== workbookSafety) errors.push(`${slug}: generated runtime safety does not match the workbook`)
    if (!String(row?.evidence_tier || '').trim()) errors.push(`${slug}: evidence_tier is empty`)
  }

  const remaining = [...targets].filter(slug => !completed.has(slug)).sort()
  console.log('TRUST & COMPLETENESS REPORT')
  console.log('===========================')
  console.log(`Reviewed safety queue: ${targets.size}`)
  console.log(`Trust-complete profiles: ${completed.size}`)
  console.log(`Remaining profiles: ${remaining.length}`)
  console.log(`Validation errors: ${errors.length}`)
  if (remaining.length) console.log(`Remaining: ${remaining.join(', ')}`)
  if (errors.length) {
    for (const error of errors) console.error(`- ${error}`)
    process.exit(1)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}

#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveWorkbookPath } from './workbook-source.mjs'
import { readWorkbook, getSheet, sheetToRows } from './data/workbook-parser.mjs'
import { classifyContraindicationValue } from './audit-severity-token-contraindications.mjs'

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

function safetyTargetSlugs(repoRoot, compounds) {
  const patchDir = path.join(repoRoot, 'data-sources', 'workbook-patches')
  const files = [
    'safety-coverage-batch-1-2026-07-15.json',
    'safety-coverage-batch-2-2026-07-15.json',
  ]
  const slugs = files.flatMap(file => readJson(path.join(patchDir, file)).changes.map(change => change.slug))
  const primaryRuntime = compounds
    .filter(record => record.runtime_export_decision === 'primary_runtime_priority')
    .map(record => record.slug)
  return new Set([...slugs, ...REVIEWED_WITHOUT_BATCH_ONE_CHANGES, ...primaryRuntime])
}

function primaryRuntimeExceptions(repoRoot) {
  const file = path.join(repoRoot, 'data-sources', 'safety-evidence-limited-primary-runtime-exceptions.json')
  if (!fs.existsSync(file)) return new Map()
  const document = readJson(file)
  const exceptions = Array.isArray(document?.exceptions) ? document.exceptions : []
  const bySlug = new Map()
  for (const entry of exceptions) {
    const slug = String(entry?.slug || '').trim()
    const reason = String(entry?.reason || '').trim()
    if (!slug || !reason) throw new Error('Every primary-runtime safety exception requires slug and reason')
    if (bySlug.has(slug)) throw new Error(`Duplicate primary-runtime safety exception: ${slug}`)
    bySlug.set(slug, entry)
  }
  return bySlug
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
  const compounds = readJson(path.join(repoRoot, 'public', 'data', 'compounds.json'))
  const targets = safetyTargetSlugs(repoRoot, compounds)
  const completed = completedTrustSlugs(repoRoot)
  const workbook = await readWorkbook(resolveWorkbookPath(repoRoot))
  const rows = sheetToRows(getSheet(workbook, 'Entity_Master'))
  const bySlug = new Map(rows.map(row => [String(row.slug || '').trim(), row]))
  const runtimeBySlug = new Map(compounds.map(record => [record.slug, record]))
  const primaryExceptions = primaryRuntimeExceptions(repoRoot)
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
    if (runtime?.runtime_export_decision === 'primary_runtime_priority') {
      const classification = classifyContraindicationValue(row?.contraindications_or_flags)
      const exception = primaryExceptions.get(slug)
      if (classification !== 'PROSE' && !exception) {
        errors.push(`${slug}: contraindications are ${classification} without a documented evidence-limited exception`)
      }
      if (classification === 'PROSE' && exception) {
        errors.push(`${slug}: stale evidence-limited exception despite prose contraindications`)
      }
    }
  }

  for (const slug of primaryExceptions.keys()) {
    const runtime = runtimeBySlug.get(slug)
    const row = bySlug.get(slug)
    if (runtime?.runtime_export_decision !== 'primary_runtime_priority') {
      errors.push(`${slug}: evidence-limited exception is not a primary-runtime profile`)
    } else if (!completed.has(slug)) {
      errors.push(`${slug}: evidence-limited exception exists before trust review is complete`)
    } else if (classifyContraindicationValue(row?.contraindications_or_flags) === 'PROSE') {
      errors.push(`${slug}: evidence-limited exception is stale`)
    }
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

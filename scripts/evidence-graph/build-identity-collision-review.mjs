#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRepoRoot } from '../workbook-source.mjs'

const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

export function buildCollisionReview(options = {}) {
  const repoRoot = options.repoRoot || getRepoRoot()
  const reportPath = path.resolve(repoRoot, options.reportPath || 'data/graph/identity/identity-validation-report.json')
  const outputPath = path.resolve(repoRoot, options.outputPath || 'data/graph/identity/identity-collision-review.csv')
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  const headers = ['collision_key', 'collision_type', 'classification', 'severity', 'record_ids', 'resolution_action', 'canonical_record_id', 'notes']
  const rows = report.collisions.map((collision) => [
    collision.key,
    collision.type,
    collision.classification,
    collision.severity,
    collision.recordIds.join('|'),
    '',
    '',
    '',
  ])
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${[headers, ...rows].map((row) => row.map(quote).join(',')).join('\n')}\n`)
  return { outputPath, rows: rows.length }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const result = buildCollisionReview()
    console.log(`[evidence-graph] Collision review rows: ${result.rows}`)
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  }
}

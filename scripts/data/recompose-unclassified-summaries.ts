#!/usr/bin/env npx tsx

/**
 * Final fail-closed summary pass.
 *
 * Citation quarantine and source-level classification can leave a previously
 * authored efficacy summary with zero classified surviving studies. Evidence
 * grades/rationales are already re-derived before this script runs; this step
 * only replaces stale public prose with the canonical conservative summary.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { buildProfileSummary, shouldRecomposeUnclassifiedSummary } from '../../lib/profile-summary'

const ROOT = process.cwd()
const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dataDirArg ? dataDirArg.slice('--data-dir='.length) : 'public/data')

type Row = Record<string, unknown>

function readRows(file: string): Row[] {
  const full = path.join(DATA_DIR, file)
  if (!existsSync(full)) return []
  const parsed = JSON.parse(readFileSync(full, 'utf8'))
  return Array.isArray(parsed) ? parsed : []
}

function writeRows(file: string, rows: Row[]): void {
  writeFileSync(path.join(DATA_DIR, file), `${JSON.stringify(rows, null, 2)}\n`)
}

function syncDetail(detailDir: string, row: Row): void {
  const slug = String(row.slug ?? '').trim()
  if (!slug) return
  const file = path.join(DATA_DIR, detailDir, `${slug}.json`)
  if (!existsSync(file)) return
  const detail = JSON.parse(readFileSync(file, 'utf8')) as Row
  detail.summary = row.summary
  detail.summary_source = row.summary_source
  writeFileSync(file, `${JSON.stringify(detail, null, 2)}\n`)
}

function recomposeIndex(indexFile: string, detailDir: string): { total: number; recomposed: string[] } {
  const rows = readRows(indexFile)
  const recomposed: string[] = []
  if (!rows.length) return { total: 0, recomposed }

  const next = rows.map((row) => {
    if (!shouldRecomposeUnclassifiedSummary(row)) return row
    const summary = buildProfileSummary(row)
    if (!summary) return row
    const updated = { ...row, summary, summary_source: 'composed-from-record' }
    recomposed.push(String(row.slug ?? row.name ?? 'unknown'))
    syncDetail(detailDir, updated)
    return updated
  })

  if (recomposed.length) writeRows(indexFile, next)
  return { total: rows.length, recomposed }
}

const results = [
  recomposeIndex('herbs.json', 'herbs-detail'),
  recomposeIndex('compounds.json', 'compounds-detail'),
]
const recomposed = results.flatMap((result) => result.recomposed)

console.log('[recompose-unclassified-summaries]')
console.log(`  profiles scanned:   ${results.reduce((sum, result) => sum + result.total, 0)}`)
console.log(`  summaries replaced: ${recomposed.length}`)
if (recomposed.length) console.log(`  slugs: ${recomposed.sort().join(', ')}`)

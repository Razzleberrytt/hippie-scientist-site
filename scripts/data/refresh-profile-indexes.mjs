#!/usr/bin/env node
/**
 * Pipeline step: rebuild herb-index.json / compound-index.json from the
 * current herbs.json / compounds.json.
 *
 * build-runtime-from-workbook.mjs writes the *-index.json files from the raw
 * workbook rows, before normalize-evidence-grades.ts reconciles the public
 * evidence grades. The indexes therefore carried the pre-normalization grades
 * (mixed-case and free-text values) long after the runtime data was gated,
 * so index-side counts disagreed with what profile pages render.
 *
 * Run after data:normalize-evidence (and after any later step that mutates
 * herbs.json / compounds.json) so the indexes always mirror the final
 * runtime records. Field selection matches INDEX_FIELDS in
 * build-runtime-from-workbook.mjs exactly.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const INDEX_FIELDS = [
  'slug', 'name', 'summary', 'primary_effects', 'effects', 'evidence_grade',
  'evidence_tier', 'profile_status', 'runtime_export_decision',
  'affiliate_ready', 'visibility_tier', 'robots', 'sitemap_included',
  'indexability_status', 'indexability_score', 'indexability_reasons',
]

function pick(obj, keys) {
  return Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]]))
}

const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(process.cwd(), dataDirArg ? dataDirArg.split('=')[1] : 'public/data')

for (const [source, index] of [['herbs.json', 'herb-index.json'], ['compounds.json', 'compound-index.json']]) {
  const rows = JSON.parse(readFileSync(path.join(DATA_DIR, source), 'utf8'))
  if (!Array.isArray(rows)) throw new Error(`${source}: expected a JSON array`)
  const out = rows.map((row) => pick(row, INDEX_FIELDS))
  writeFileSync(path.join(DATA_DIR, index), `${JSON.stringify(out, null, 2)}\n`, 'utf8')
  console.log(`${index}: ${out.length} rows refreshed from ${source}`)
}

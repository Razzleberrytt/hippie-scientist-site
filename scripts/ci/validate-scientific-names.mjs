#!/usr/bin/env node
/**
 * Validate published botanical names (backlog 1973-1978).
 *
 * A profile's Latin name renders in italics under the common name and ships as
 * `latinName` in structured data, so a malformed one is visible on the page and
 * in the knowledge graph.
 *
 * Blocking: a name that breaks binomial convention — a lowercase genus, a
 * capitalised species epithet, shouting, or stray punctuation. Every rule has
 * to survive real botany, so hybrids (`Mentha × piperita`), infraspecific ranks
 * (`var.`, `subsp.`) and author citations (`(L.) Wettst.`) are all valid.
 *
 * Usage: node scripts/ci/validate-scientific-names.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

import { validateScientificName } from '../../lib/scientific-name.mjs'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

const NAME_FIELDS = ['scientific_name', 'latin_name', 'botanical_name']

function load() {
  const read = (file) => {
    const full = path.join(DATA_DIR, file)
    return fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, 'utf8')) : []
  }
  return [
    ...read('herbs.json').map((r) => ({ ...r, kind: 'herbs' })),
    ...read('compounds.json').map((r) => ({ ...r, kind: 'compounds' })),
  ]
}

function main() {
  const findings = []
  let checked = 0

  for (const record of load()) {
    for (const field of NAME_FIELDS) {
      const value = record[field]
      if (!value || !String(value).trim()) continue
      checked += 1
      const result = validateScientificName(value)
      if (result.valid) continue
      findings.push({
        url: `/${record.kind}/${record.slug}/`,
        field,
        value: String(value),
        issues: result.issues,
        indexable: String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH',
      })
    }
  }

  console.log('\nScientific names')
  console.log('='.repeat(66))
  console.log(`Names checked   ${checked}`)
  console.log(`Malformed       ${findings.length}`)

  if (!findings.length) {
    console.log('\nAll published botanical names follow binomial convention.')
    return
  }

  console.error(`\n[scientific-names] FAILED — ${findings.length} malformed name(s).\n`)
  for (const finding of findings.slice(0, 25)) {
    console.error(`  ${finding.indexable ? 'INDEXED ' : '        '}${finding.url} ${JSON.stringify(finding.value)} [${finding.issues.join(', ')}]`)
  }
  process.exit(1)
}

main()

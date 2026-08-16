#!/usr/bin/env node
/**
 * Fail the build when editorial instructions reach reader-facing prose.
 *
 * The workbook doubles as a briefing document, and 37 profiles shipped with a
 * writer instruction as their entire summary — "It should be framed modestly
 * because traditional use is much stronger than modern evidence." — on 31 live
 * `index,follow` pages. The sanitizer in `lib/editorial-leak.mjs` strips them
 * during the workbook parse; this validator is the backstop that keeps the
 * class of defect from returning through a different path (a hand-edited JSON
 * file, an agent patch, a new pipeline step).
 *
 * Usage: node scripts/ci/validate-editorial-leaks.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

import { READER_FACING_FIELDS, findEditorialLeaks } from '../../lib/editorial-leak.mjs'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

const SOURCES = [
  { file: 'herbs.json', kind: 'herb' },
  { file: 'compounds.json', kind: 'compound' },
]

function readJson(file) {
  const full = path.join(DATA_DIR, file)
  if (!fs.existsSync(full)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(full, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function main() {
  const findings = []
  let scanned = 0

  for (const { file, kind } of SOURCES) {
    for (const record of readJson(file)) {
      scanned += 1
      for (const field of READER_FACING_FIELDS) {
        const leaks = findEditorialLeaks(record?.[field])
        if (!leaks.length) continue
        findings.push({
          url: `/${kind === 'herb' ? 'herbs' : 'compounds'}/${record.slug}/`,
          field,
          indexable: String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH',
          patterns: leaks.map((leak) => leak.name).join(', '),
          value: String(record[field]).slice(0, 120),
        })
      }
    }
  }

  console.log('\nEditorial instruction leaks')
  console.log('='.repeat(66))
  console.log(`Records scanned   ${scanned}`)
  console.log(`Leaks found       ${findings.length}`)

  if (!findings.length) {
    console.log('\nNo editorial instructions in reader-facing prose.')
    return
  }

  const indexable = findings.filter((finding) => finding.indexable)
  console.error(`\n[editorial-leak] FAILED — ${findings.length} leak(s), ${indexable.length} on indexable pages.\n`)
  for (const finding of findings.slice(0, 25)) {
    console.error(`  ${finding.indexable ? 'INDEXED ' : '        '}${finding.url} (${finding.field}) [${finding.patterns}]`)
    console.error(`      ${finding.value}`)
  }
  if (findings.length > 25) console.error(`  … and ${findings.length - 25} more`)
  console.error('\nThese are instructions to a writer, not text for a reader. Fix the')
  console.error('workbook cell, or run `npm run data:build:core` to re-sanitize.')
  process.exit(1)
}

main()

#!/usr/bin/env node
/**
 * Fail the build when internal-only text reaches public output.
 *
 * The workbook doubles as a briefing document, so some cells hold guidance
 * written *to* an author, and others hold governance rulings written *about*
 * publishing — "v10.0: … block monetized 'blood sugar' recommendation." The
 * sanitizer in `lib/editorial-leak.mjs` strips the first kind during the
 * workbook parse; this validator is the backstop that keeps both kinds from
 * returning through a different path.
 *
 * The previous version of this validator read two files (`herbs.json`,
 * `compounds.json`) and six top-level fields, and it passed. It passed because
 * those are precisely the two files the parser sanitizes: every leak that
 * actually shipped was somewhere else — 23 in `sources[].title`, 98 in
 * `claimMap[].claim`, and 57 in three orphaned index files that no pipeline
 * step regenerates. So it now walks the whole published corpus and every
 * nested string, and it refuses to pass when it inspected nothing.
 *
 * Usage: node scripts/ci/validate-editorial-leaks.mjs
 */

import fs from 'node:fs'
import path from 'node:path'

import {
  PUBLIC_TEXT_FIELDS,
  findEditorialLeaks,
  findInternalGovernanceLeaks,
} from '../../lib/editorial-leak.mjs'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

/**
 * Below this, the corpus is not the corpus — a bad `--data-dir`, a half-run
 * pipeline or an empty checkout would otherwise let this validator report
 * "0 leaks" and exit 0. The real corpus carries ~850 profiles; 400 leaves room
 * for legitimate growth and shrinkage without ever accepting an empty scan.
 */
const MIN_EXPECTED_RECORDS = 400

/**
 * Directories under `public/data` that are pipeline reports rather than
 * published content. They are still scanned for governance rulings (they are
 * served publicly, which is its own problem — see
 * `docs/audits/data-ownership.md`), but their prose is not reader-facing so the
 * editorial-instruction patterns would only produce noise.
 */
const REPORT_DIRS = new Set(['reports', '_meta'])

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkFiles(full, out)
    else if (entry.name.endsWith('.json')) out.push(full)
  }
  return out
}

/**
 * Parse failures are a validator failure, not an empty result. The old
 * `readJson` returned `[]` on a malformed file, so corrupt data read as clean.
 */
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    console.error(`[editorial-leak] FAILED — cannot parse ${path.relative(ROOT, file)}: ${error.message}`)
    process.exit(1)
  }
}

/** Walk every string in the tree, remembering the field name it sits under. */
function* strings(node, field = '', depth = 0) {
  if (depth > 12) return
  if (typeof node === 'string') {
    yield [field, node]
    return
  }
  if (Array.isArray(node)) {
    for (const item of node) yield* strings(item, field, depth + 1)
    return
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) yield* strings(value, key, depth + 1)
  }
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`[editorial-leak] FAILED — no corpus at ${path.relative(ROOT, DATA_DIR)}.`)
    console.error('Run `npm run data:build` before validating.')
    process.exit(1)
  }

  const files = walkFiles(DATA_DIR)
  const findings = []
  let scanned = 0
  let stringsInspected = 0

  for (const file of files) {
    const relative = path.relative(DATA_DIR, file).split(path.sep).join('/')
    const topLevel = relative.split('/')[0]
    const isReport = REPORT_DIRS.has(topLevel)
    scanned += 1

    for (const [field, value] of strings(readJson(file))) {
      stringsInspected += 1

      // Governance rulings are internal wherever they appear.
      for (const leak of findInternalGovernanceLeaks(value)) {
        findings.push({ file: relative, field, kind: 'internal-governance', pattern: leak.name, value })
      }

      if (isReport) continue
      if (!PUBLIC_TEXT_FIELDS.includes(field)) continue
      for (const leak of findEditorialLeaks(value)) {
        findings.push({ file: relative, field, kind: 'editorial-instruction', pattern: leak.name, value })
      }
    }
  }

  console.log('\nInternal text in public output')
  console.log('='.repeat(66))
  console.log(`Files scanned      ${scanned}`)
  console.log(`Strings inspected  ${stringsInspected}`)
  console.log(`Leaks found        ${findings.length}`)

  if (scanned < 1 || stringsInspected < MIN_EXPECTED_RECORDS) {
    console.error(
      `\n[editorial-leak] FAILED — inspected ${stringsInspected} strings across ${scanned} files, ` +
        `below the ${MIN_EXPECTED_RECORDS} minimum. The corpus is missing or incomplete, so a clean ` +
        'result here would mean nothing.',
    )
    process.exit(1)
  }

  if (!findings.length) {
    console.log('\nNo internal editorial or governance text in public output.')
    return
  }

  const byKind = findings.reduce((acc, finding) => {
    acc[finding.kind] = (acc[finding.kind] ?? 0) + 1
    return acc
  }, {})

  console.error(`\n[editorial-leak] FAILED — ${findings.length} leak(s).`)
  for (const [kind, count] of Object.entries(byKind)) console.error(`  ${kind}: ${count}`)
  console.error('')
  for (const finding of findings.slice(0, 25)) {
    console.error(`  ${finding.file} (${finding.field}) [${finding.pattern}]`)
    console.error(`      ${String(finding.value).replace(/\s+/g, ' ').slice(0, 140)}`)
  }
  if (findings.length > 25) console.error(`  … and ${findings.length - 25} more`)
  console.error('\nThese are notes to a writer or rulings about publishing, not text for a')
  console.error('reader. Fix the workbook cell, or run `npm run data:build` to re-sanitize.')
  process.exit(1)
}

main()

#!/usr/bin/env node
/**
 * Every profile whose evidence grade is not demonstrated by its own recorded
 * studies must say so on the page.
 *
 * The grade is editorial and may legitimately reflect literature beyond the
 * citations stored here, so this gate deliberately does not require the grade
 * to be lowered. It requires the gap to be visible. The failure it exists to
 * catch is silence: a hero quick-stat asserting an evidence strength as settled
 * while `evidence_grade_backed` is false and nothing on the page qualifies it.
 *
 * That was the state of 112 profiles — 13 at Grade A, 99 at Grade B — because
 * the sole disclosure lived inside a collapsed block that renders only when
 * `evidence_design_match` and `evidence_risk_of_bias` are both present.
 *
 * Checks built HTML rather than component source, so it stays true if the
 * disclosure is refactored, moved, or conditionally rendered away.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')

/**
 * Sentence fragments the disclosure component can emit. Matching on the reader-
 * facing text is the point: a marker class or data attribute could survive
 * while the sentence stops rendering.
 */
const DISCLOSURE_MARKERS = [
  'studies are recorded on this profile',
  'human outcome study is recorded on this profile',
  'human study is recorded on this profile',
  'do not demonstrate this grade',
]

/**
 * The quick-stat labels through which a profile asserts an evidence strength to
 * the reader — `Evidence` on herb monographs, `Evidence level` on compound
 * monographs.
 *
 * A page that renders neither states no grade and therefore cannot overstate
 * one. Twelve compounds build a `noindex` stub with no heading and no evidence
 * claim; requiring a disclosure there would demand a caveat attached to nothing.
 * The rule is "never assert a grade the record cannot support without saying
 * so", not "print this sentence everywhere".
 */
const CLAIM_MARKERS = ['>Evidence level<', '>Evidence<']

function loadRecords(file, kind, routeBase) {
  const full = path.join(ROOT, 'public', 'data', file)
  if (!existsSync(full)) return []
  const parsed = JSON.parse(readFileSync(full, 'utf8'))
  if (!Array.isArray(parsed)) return []
  return parsed.map((record) => ({
    kind,
    slug: record.slug,
    grade: record.evidence_grade ?? '',
    backed: record.evidence_grade_backed,
    gap: record.evidence_grade_backing_gap ?? null,
    htmlPath: path.join(OUT, routeBase, String(record.slug), 'index.html'),
  }))
}

const records = [
  ...loadRecords('herbs.json', 'herb', 'herbs'),
  ...loadRecords('compounds.json', 'compound', 'compounds'),
]

if (!existsSync(OUT)) {
  console.error('[evidence-backing] out/ is missing — run a build before this gate.')
  process.exit(1)
}

const unbacked = records.filter((record) => record.backed === false)
const silent = []
let notBuilt = 0
let statesNoGrade = 0

for (const record of unbacked) {
  if (!existsSync(record.htmlPath)) {
    // Not every record builds a page (governance can withhold one). A profile
    // that does not exist cannot mislead a reader.
    notBuilt += 1
    continue
  }
  const html = readFileSync(record.htmlPath, 'utf8')
  if (!CLAIM_MARKERS.some((marker) => html.includes(marker))) {
    statesNoGrade += 1
    continue
  }
  if (!DISCLOSURE_MARKERS.some((marker) => html.includes(marker))) {
    silent.push(record)
  }
}

const byGrade = {}
for (const record of silent) {
  byGrade[record.grade || '(none)'] = (byGrade[record.grade || '(none)'] ?? 0) + 1
}

console.log('='.repeat(66))
console.log('Profiles whose grade is unbacked by their own record'.padEnd(56), String(unbacked.length).padStart(6))
console.log('  no page built (withheld by governance)'.padEnd(56), String(notBuilt).padStart(6))
console.log('  page states no grade, so nothing to qualify'.padEnd(56), String(statesNoGrade).padStart(6))
console.log('  disclose the gap on the page'.padEnd(56), String(unbacked.length - notBuilt - statesNoGrade - silent.length).padStart(6))
console.log('  assert the grade with no qualification'.padEnd(56), String(silent.length).padStart(6))

if (silent.length) {
  console.log('\nBy grade:', JSON.stringify(byGrade))
  console.log('\nSilent profiles:')
  for (const record of silent.slice(0, 40)) {
    console.log(`  ${record.kind}/${record.slug}  grade=${record.grade}  gap=${record.gap}`)
  }
  if (silent.length > 40) console.log(`  … and ${silent.length - 40} more`)
  console.error(
    `\n[evidence-backing] FAILED — ${silent.length} profiles state an evidence grade their recorded studies do not support, without saying so.`,
  )
  process.exit(1)
}

console.log('\n[evidence-backing] PASSED — every unbacked grade is disclosed on the page.')

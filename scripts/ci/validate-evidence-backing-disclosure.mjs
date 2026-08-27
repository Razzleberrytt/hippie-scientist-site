#!/usr/bin/env node
/**
 * Every profile whose evidence grade is not demonstrated by its own recorded
 * studies must stay qualified in normalized data and built output.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')
const DISCLOSURE_MARKERS = [
  'studies are recorded on this profile',
  'human outcome study is recorded on this profile',
  'human study is recorded on this profile',
  'do not demonstrate this grade',
]
const CLAIM_MARKERS = ['>Evidence level<', '>Evidence<']
const SETTLED_PUBLIC_GRADE = /^(?:A|B)$/i
const SETTLED_PUBLIC_BAND = /^(?:strong|moderate)$/i
const SETTLED_PUBLIC_TIER = /\b(?:strong|moderate) evidence\b/i
const SETTLED_COMPOSED_SUMMARY = /(?:—|:)\s*(?:strong|moderate) evidence\b/i

function loadRecords(file, kind, routeBase) {
  const full = path.join(ROOT, 'public', 'data', file)
  if (!existsSync(full)) return []
  const parsed = JSON.parse(readFileSync(full, 'utf8'))
  if (!Array.isArray(parsed)) return []
  return parsed.map((record) => ({
    kind,
    slug: record.slug,
    grade: record.evidence_grade ?? '',
    sourceGrade: record.evidence_grade_source ?? '',
    band: record.evidence_grade_band ?? '',
    tier: record.evidence_tier ?? '',
    legacyLevel: record.evidenceLevel ?? '',
    legacyTier: record.evidenceTier ?? '',
    summary: record.summary ?? '',
    summarySource: record.summary_source ?? '',
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
const contradictoryData = []
let notBuilt = 0
let statesNoGrade = 0

for (const record of unbacked) {
  if (
    SETTLED_PUBLIC_GRADE.test(String(record.grade))
    || SETTLED_PUBLIC_BAND.test(String(record.band))
    || SETTLED_PUBLIC_TIER.test(String(record.tier))
    || SETTLED_PUBLIC_TIER.test(String(record.legacyLevel))
    || SETTLED_PUBLIC_TIER.test(String(record.legacyTier))
    || (String(record.summarySource) === 'composed-from-record' && SETTLED_COMPOSED_SUMMARY.test(String(record.summary)))
  ) contradictoryData.push(record)

  if (!existsSync(record.htmlPath)) { notBuilt += 1; continue }
  const html = readFileSync(record.htmlPath, 'utf8')
  if (!CLAIM_MARKERS.some((marker) => html.includes(marker))) { statesNoGrade += 1; continue }
  if (!DISCLOSURE_MARKERS.some((marker) => html.includes(marker))) silent.push(record)
}

const byGrade = {}
for (const record of [...silent, ...contradictoryData]) {
  const key = record.sourceGrade || record.grade || '(none)'
  byGrade[key] = (byGrade[key] ?? 0) + 1
}
console.log('='.repeat(66))
console.log('Profiles whose grade is unbacked by their own record'.padEnd(56), String(unbacked.length).padStart(6))
console.log('  normalized data still states settled strength'.padEnd(56), String(contradictoryData.length).padStart(6))
console.log('  no page built (withheld by governance)'.padEnd(56), String(notBuilt).padStart(6))
console.log('  page states no grade, so nothing to qualify'.padEnd(56), String(statesNoGrade).padStart(6))
console.log('  assert the grade with no qualification'.padEnd(56), String(silent.length).padStart(6))

if (contradictoryData.length || silent.length) {
  console.log('\nBy source grade:', JSON.stringify(byGrade))
  for (const record of contradictoryData.slice(0, 40)) {
    console.log(`  ${record.kind}/${record.slug} sourceGrade=${record.sourceGrade} publicGrade=${record.grade} band=${record.band} tier=${JSON.stringify(record.tier)} legacyLevel=${JSON.stringify(record.legacyLevel)} legacyTier=${JSON.stringify(record.legacyTier)} gap=${record.gap}`)
  }
  for (const record of silent.slice(0, 40)) {
    console.log(`  undisclosed ${record.kind}/${record.slug} sourceGrade=${record.sourceGrade} gap=${record.gap}`)
  }
  console.error(`\n[evidence-backing] FAILED — ${contradictoryData.length} normalized contradictions and ${silent.length} undisclosed built-page gaps remain.`)
  process.exit(1)
}
console.log('\n[evidence-backing] PASSED — unbacked editorial grades stay qualified in public data and disclosed on built pages.')

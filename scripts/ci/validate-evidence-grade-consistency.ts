import fs from 'node:fs'
import path from 'node:path'

import { writeEvidenceGradeConsistencyReport } from '../../lib/evidence-grade-consistency'
import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'

const ROOT = process.cwd()
const STRICT = process.argv.slice(2).includes('--strict')

/**
 * Has scripts/data/normalize-evidence-grades.ts run against this data directory?
 *
 * That step is what turns the workbook's authored grade into the published one,
 * and it is the only thing that writes `evidence_grade_source`. A fresh checkout
 * has not been through it: public/data is parser output, so its evidence_grade is
 * the workbook's raw assertion rather than anything the site publishes.
 *
 * Worth distinguishing, because the previous message ("fix the workbook value")
 * pointed at a fix that would be actively wrong. The normalizer is not
 * upper-casing letters, it is reconciling the authored grade against recorded
 * evidence: on this corpus it derives citicoline "" -> "C", keeps "b" -> "B"
 * where studies back it, and *removes* tyrosine's "a" entirely because they do
 * not. Writing those results back into the workbook would collapse
 * evidence_grade_source (what an editor asserted) into evidence_grade (what the
 * evidence supports), which is the separation this pipeline exists to keep.
 */
function slugsMissingNormalizerOutput(): Set<string> {
  const missing = new Set<string>()
  for (const file of ['compounds.json', 'herbs.json']) {
    const full = path.join(ROOT, 'public', 'data', file)
    if (!fs.existsSync(full)) continue
    let rows: unknown
    try {
      rows = JSON.parse(fs.readFileSync(full, 'utf8'))
    } catch {
      continue
    }
    if (!Array.isArray(rows)) continue
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue
      const record = row as Record<string, unknown>
      const slug = String(record.slug ?? '').trim()
      if (slug && !('evidence_grade_source' in record)) missing.add(slug)
    }
  }
  return missing
}

const { evidenceGradeConsistency: report } = buildResearchQualitySnapshot(ROOT)
const reportPath = writeEvidenceGradeConsistencyReport(report, ROOT)

console.log('\nEvidence grade consistency')
console.log('='.repeat(66))
console.log(`Profiles scanned            ${report.totals.profiles}`)
console.log(`Indexable                   ${report.totals.indexable}`)
console.log(`Flagged (indexable)         ${report.totals.flaggedIndexable}`)
console.log(`Topology contradictions     ${report.totals.topologyContradictionsIndexable}`)
console.log(`Topology warnings           ${report.totals.topologyWarningsIndexable}`)
console.log(`Rationale cards renderable  ${report.totals.gradeCardRenderable}`)
for (const [issue, count] of Object.entries(report.issueCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(5)}  ${issue}`)
}
console.log(`\nReport: ${path.relative(ROOT, reportPath)}`)

if (report.invalid.length > 0) {
  const unnormalizedSlugs = slugsMissingNormalizerOutput()
  const stale = report.invalid.filter((finding) => unnormalizedSlugs.has(finding.slug))
  const genuine = report.invalid.filter((finding) => !unnormalizedSlugs.has(finding.slug))

  console.error(`\n[evidence-grade] FAILED — ${report.invalid.length} record(s) carry a non-canonical grade.`)
  for (const finding of report.invalid.slice(0, 20)) {
    const marker = unnormalizedSlugs.has(finding.slug) ? '  (not normalized)' : ''
    console.error(`  ${finding.url}  evidence_grade=${JSON.stringify(finding.rawGrade)}${marker}`)
  }
  if (genuine.length > 0) {
    console.error(`\n${genuine.length} of these survived normalization, so the authored value is genuinely out of contract.`)
    console.error('Fix the workbook value for those.')
  }
  if (stale.length > 0) {
    console.error(`\n${stale.length} of these carry no evidence_grade_source, so`)
    console.error('scripts/data/normalize-evidence-grades.ts has not run against them. Their grade is')
    console.error('still the workbook\'s raw assertion rather than anything the site publishes. That is')
    console.error('the expected state of a fresh checkout: check:fast and data:build both run the')
    console.error('normalizer before this validator, so CI never sees them.')
    console.error('')
    console.error('Regenerate rather than hand-editing:  npm run data:build:core')
    console.error('')
    console.error('Do NOT copy the normalized results back into the workbook. The normalizer reconciles')
    console.error('the authored grade against recorded evidence rather than reformatting it — it derives')
    console.error('a grade where none was authored, and removes one where the studies do not support it.')
    console.error('Writing its output back would collapse evidence_grade_source (what an editor asserted)')
    console.error('into evidence_grade (what the evidence supports).')
  }
  process.exit(1)
}

if (report.topologyContradictions.length > 0) {
  console.error(`\n[evidence-grade] FAILED — ${report.topologyContradictions.length} indexable Grade A contradiction(s) proven by canonical underlying-study topology.`)
  for (const finding of report.topologyContradictions.slice(0, 20)) {
    console.error(`  ${finding.url}  ${finding.issues.join(', ')}`)
  }
  process.exit(1)
}

if (STRICT && report.contradictions.length > 0) {
  console.error(`\n[evidence-grade] FAILED — ${report.contradictions.length} indexable contradiction(s).`)
  process.exit(1)
}

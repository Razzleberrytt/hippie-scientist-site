import path from 'node:path'

import { writeEvidenceGradeConsistencyReport } from '../../lib/evidence-grade-consistency'
import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'

const ROOT = process.cwd()
const STRICT = process.argv.slice(2).includes('--strict')

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
  console.error(`\n[evidence-grade] FAILED — ${report.invalid.length} record(s) publish a non-canonical grade.`)
  for (const finding of report.invalid.slice(0, 20)) {
    console.error(`  ${finding.url}  evidence_grade=${JSON.stringify(finding.rawGrade)}`)
  }
  console.error('\nRun `npm run data:normalize-evidence` to migrate, or fix the workbook value.')
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

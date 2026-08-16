/** Standalone compatibility reporter for canonical source-level research integrity. */

import fs from 'node:fs'
import path from 'node:path'

import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'
import { STUDY_CLASS_INFO, type StudyClass } from '../../lib/study-class'

const ROOT = process.cwd()
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'source-integrity.json')

function main() {
  const { sourceIntegrity } = buildResearchQualitySnapshot(ROOT)
  const { summary, withdrawn, mostReferenced, oldAndLoadBearing } = sourceIntegrity

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    currentYear: sourceIntegrity.currentYear,
    source: 'lib/research-quality-snapshot.ts -> lib/research-source-integrity.ts',
    summary,
    withdrawn,
    mostReferenced,
    oldAndLoadBearing,
  }, null, 2)}\n`)

  console.log('\nResearch source integrity')
  console.log('='.repeat(72))
  console.log(`Cited studies               ${summary.citedStudies} (${summary.withMetadata} with PubMed metadata)`)
  console.log(`Cited on multiple profiles  ${summary.citedOnMultipleProfiles}`)
  console.log(`Load-bearing (>=3 pages)    ${summary.loadBearing}`)
  console.log(`Old + load-bearing (>15y)   ${summary.oldAndLoadBearing}`)
  console.log(`Retracted / concern         ${summary.withdrawn}`)
  console.log(`Primary human ${summary.humanPrimary} · synthesis ${summary.synthesis} · other ${summary.citedStudies - summary.humanPrimary - summary.synthesis}`)
  console.log('\nDesign mix:')
  for (const [design, count] of Object.entries(summary.designMix).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${STUDY_CLASS_INFO[design as StudyClass]?.label ?? design}`)
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (withdrawn.length) {
    console.error(`\n[source-integrity] FAILED — ${withdrawn.length} retracted or withdrawn study still cited.\n`)
    for (const study of withdrawn) console.error(`  PMID ${study.pmid} [${study.publicationTypes.join(', ')}] cited by ${study.pages.join(', ')}`)
    process.exit(1)
  }
}

main()

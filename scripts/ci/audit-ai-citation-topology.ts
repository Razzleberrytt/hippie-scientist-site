#!/usr/bin/env npx tsx
import fs from 'node:fs'
import path from 'node:path'

import { buildAiCitationReadiness, writeAiCitationReadinessReport } from '../../lib/ai-citation-readiness'
import { analyzeResearchQuality } from '../../lib/research-quality-analysis'

const ROOT = process.cwd()
const strict = process.argv.includes('--strict')
const entityRoot = path.join(ROOT, 'public', 'data', 'ai-entities')

const analysis = analyzeResearchQuality(ROOT)
const report = buildAiCitationReadiness(analysis, ROOT)
const output = writeAiCitationReadinessReport(report, ROOT)
const { summary } = report

console.log(`[audit-ai-citation-topology] profiles=${summary.profiles} matched=${summary.matchedResearchProfiles} average=${summary.averageScore} below50=${summary.below50} below70=${summary.below70} contradictions=${summary.contradictions}`)
console.log(`[audit-ai-citation-topology] single-study-overdependence=${summary.overDependentOnSingleStudy} narrative-dominated=${summary.narrativeDominated}`)
for (const row of report.profiles.slice(0, 50)) {
  console.log(`${String(row.score).padStart(3)} ${row.kind}/${row.slug}: ${row.gaps.join('; ') || 'no major gaps detected'}`)
}
console.log(`[audit-ai-citation-topology] report: ${path.relative(ROOT, output)}`)
if (!fs.existsSync(entityRoot)) console.log('[audit-ai-citation-topology] entity artifacts missing; run the runtime/entity build first')
if (strict && (summary.contradictions > 0 || summary.below50 > 0)) process.exit(1)

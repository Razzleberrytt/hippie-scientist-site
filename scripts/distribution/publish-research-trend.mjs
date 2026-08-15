#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourceArg = process.argv.find((arg) => arg.startsWith('--source='))?.slice('--source='.length)
const approved = process.argv.includes('--approve')
const sourcePath = path.resolve(sourceArg || `artifacts/research-trends/${new Date().toISOString().slice(0, 7)}.json`)
const destinationPath = path.join(root, 'data/distribution/published-research-trends.json')

if (!approved) {
  console.error('[publish-research-trend] Refusing to publish without explicit --approve')
  process.exit(1)
}
if (!fs.existsSync(sourcePath)) {
  console.error(`[publish-research-trend] source not found: ${sourcePath}`)
  process.exit(1)
}

const report = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
if (report.status !== 'review-required') {
  console.error(`[publish-research-trend] report status must be review-required, got ${report.status}`)
  process.exit(1)
}
if (report.privacy?.aggregationOnly !== true || report.privacy?.userIdentifiersPublished !== false || report.privacy?.rawHealthQueriesPublished !== false) {
  console.error('[publish-research-trend] privacy gate failed')
  process.exit(1)
}

const listFields = ['mostSearched','mostCompared','mostCheckedInteractions','fastestGrowingResearchTopics','mostImprovedEvidence','mostControversialEvidence']
for (const field of listFields) {
  if (!Array.isArray(report[field])) throw new Error(`${field} must be an array`)
}

let destination = { schemaVersion: 1, reports: [] }
try {
  destination = JSON.parse(fs.readFileSync(destinationPath, 'utf8'))
} catch {
  // Missing or malformed prior review state intentionally starts from an empty history.
}
if (!Array.isArray(destination.reports)) destination.reports = []

const publicReport = {
  period: report.period,
  publishedAt: new Date().toISOString(),
  minimumPublishedCount: report.privacy.minimumPublishedCount,
  mostSearched: report.mostSearched,
  mostCompared: report.mostCompared,
  mostCheckedInteractions: report.mostCheckedInteractions,
  fastestGrowingResearchTopics: report.fastestGrowingResearchTopics,
  mostImprovedEvidence: report.mostImprovedEvidence,
  mostControversialEvidence: report.mostControversialEvidence,
}

destination.reports = destination.reports.filter((item) => item.period !== report.period)
destination.reports.push(publicReport)
destination.reports.sort((a, b) => a.period.localeCompare(b.period))
fs.writeFileSync(destinationPath, `${JSON.stringify(destination, null, 2)}\n`)
console.log(`[publish-research-trend] published approved aggregate report ${report.period} to ${path.relative(root, destinationPath)}`)

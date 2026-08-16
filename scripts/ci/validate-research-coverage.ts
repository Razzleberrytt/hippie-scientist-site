#!/usr/bin/env npx tsx
/**
 * Hard gate for structural research-coverage defects.
 *
 * The topology audit intentionally reports editorial weaknesses such as
 * single-source dependence and review-heavy evidence without blocking. This
 * gate is narrower: it blocks only graph states that cannot be valid.
 *
 * Run the topology audit first so ops/reports/source-integrity.json is current.
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'source-integrity.json')

if (!fs.existsSync(REPORT_PATH)) {
  console.error('[research-coverage] Missing source-integrity report. Run npm run audit:source-integrity first.')
  process.exit(1)
}

const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')) as {
  claimTopology?: {
    unsupportedClaims?: Array<{ url: string; claimId: string }>
    danglingRefs?: Array<{ url: string; claimId: string; sourceRefId: string }>
  }
}

const unsupported = report.claimTopology?.unsupportedClaims ?? []
const dangling = report.claimTopology?.danglingRefs ?? []
const failures = unsupported.length + dangling.length

console.log('\nResearch coverage structural gate')
console.log('='.repeat(72))
console.log(`Approved claims with no source refs  ${unsupported.length}`)
console.log(`Claim refs to missing profile source ${dangling.length}`)

if (failures === 0) {
  console.log('\n[research-coverage] PASS — every approved claim has a valid evidence edge.')
  process.exit(0)
}

console.error(`\n[research-coverage] FAILED — ${failures} structurally invalid claim evidence edge(s).`)

for (const item of unsupported.slice(0, 25)) {
  console.error(`  unsupported · ${item.url} · ${item.claimId}`)
}
for (const item of dangling.slice(0, 25)) {
  console.error(`  dangling · ${item.url} · ${item.claimId} -> ${item.sourceRefId}`)
}

if (failures > 50) console.error(`  ...and ${failures - 50} more; see ${path.relative(ROOT, REPORT_PATH)}`)
process.exit(1)

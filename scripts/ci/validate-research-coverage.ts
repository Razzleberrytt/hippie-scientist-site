#!/usr/bin/env npx tsx
/** Hard gate for structurally invalid approved-claim evidence edges. */

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'
import { structuralCoverageFailures } from '../../lib/research-quality-policy'

const failures = structuralCoverageFailures(analyzeResearchQuality(process.cwd()))
const unsupported = failures.filter((failure) => failure.kind === 'unsupported-approved-claim')
const dangling = failures.filter((failure) => failure.kind === 'dangling-claim-source-edge')

console.log('\nResearch coverage structural gate')
console.log('='.repeat(72))
console.log(`Approved claims with no source refs  ${unsupported.length}`)
console.log(`Claim refs to missing profile source ${dangling.length}`)

if (failures.length === 0) {
  console.log('\n[research-coverage] PASS — every approved claim has a valid evidence edge.')
  process.exit(0)
}

console.error(`\n[research-coverage] FAILED — ${failures.length} structurally invalid claim evidence edge(s).`)
for (const item of unsupported.slice(0, 25)) {
  console.error(`  unsupported · ${item.url} · ${item.claimId}`)
}
for (const item of dangling.slice(0, 25)) {
  console.error(`  dangling · ${item.url} · ${item.claimId} -> ${item.sourceRefId}`)
}
if (failures.length > 50) console.error(`  ...and ${failures.length - 50} more`)
process.exit(1)

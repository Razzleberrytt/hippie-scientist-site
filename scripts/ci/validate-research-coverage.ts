#!/usr/bin/env npx tsx
/** Hard gate for structurally invalid approved-claim evidence edges. */

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'

const { claimAnalyses } = analyzeResearchQuality(process.cwd())
const unsupported = claimAnalyses
  .filter((claim) => claim.supportTier === 'unsupported')
  .map((claim) => ({ url: claim.url, claimId: claim.claimId }))
const dangling = claimAnalyses.flatMap((claim) =>
  claim.danglingSourceRefs.map((sourceRefId) => ({ url: claim.url, claimId: claim.claimId, sourceRefId })),
)
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
if (failures > 50) console.error(`  ...and ${failures - 50} more`)
process.exit(1)

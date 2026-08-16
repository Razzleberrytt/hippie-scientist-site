#!/usr/bin/env npx tsx
/** Hard gate for structurally invalid approved-claim evidence and canonical study classification. */

import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'

const snapshot = buildResearchQualitySnapshot(process.cwd())
const failures = snapshot.structuralFailures
const classConflicts = snapshot.topology.studyClassConflicts
const unsupported = failures.filter((failure) => failure.kind === 'unsupported-approved-claim')
const dangling = failures.filter((failure) => failure.kind === 'dangling-claim-source-edge')
const severeClassConflicts = classConflicts.severeConflicts

console.log('\nResearch coverage structural gate')
console.log('='.repeat(72))
console.log(`Approved claims with no source refs  ${unsupported.length}`)
console.log(`Claim refs to missing profile source ${dangling.length}`)
console.log(`Canonical study class conflicts      ${classConflicts.summary.studiesWithClassConflict}`)
console.log(`Severe cross-family class conflicts  ${severeClassConflicts.length}`)

if (failures.length === 0 && severeClassConflicts.length === 0) {
  console.log('\n[research-coverage] PASS — approved evidence edges and canonical study classes are structurally valid.')
  process.exit(0)
}

console.error(`\n[research-coverage] FAILED — ${failures.length} invalid evidence edge(s), ${severeClassConflicts.length} severe study-class conflict(s).`)
for (const item of unsupported.slice(0, 25)) console.error(`  unsupported · ${item.url} · ${item.claimId}`)
for (const item of dangling.slice(0, 25)) console.error(`  dangling · ${item.url} · ${item.claimId} -> ${item.sourceRefId}`)
for (const conflict of severeClassConflicts.slice(0, 25)) console.error(`  class-conflict · ${conflict.url} · ${conflict.studyId} · ${conflict.classes.join(' <> ')}`)
const total = failures.length + severeClassConflicts.length
if (total > 75) console.error(`  ...and ${total - 75} more`)
process.exit(1)

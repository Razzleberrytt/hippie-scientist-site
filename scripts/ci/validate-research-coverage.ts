#!/usr/bin/env npx tsx
/** Thin CLI over the canonical research-quality hard gate. */

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'
import { buildResearchQualityGate } from '../../lib/research-quality-gate'
import { buildResearchQualityTopology } from '../../lib/research-quality-topology'

const analysis = analyzeResearchQuality(process.cwd())
const topology = buildResearchQualityTopology(analysis)
const gate = buildResearchQualityGate(analysis, topology)
const unsupported = gate.structuralFailures.filter((failure) => failure.kind === 'unsupported-approved-claim')
const dangling = gate.structuralFailures.filter((failure) => failure.kind === 'dangling-claim-source-edge')

console.log('\nResearch coverage structural gate')
console.log('='.repeat(72))
console.log(`Approved claims with no source refs  ${gate.summary.unsupportedApprovedClaims}`)
console.log(`Claim refs to missing profile source ${gate.summary.danglingClaimSourceEdges}`)
console.log(`Canonical study class conflicts      ${topology.studyClassConflicts.summary.studiesWithClassConflict}`)
console.log(`Severe cross-family class conflicts  ${gate.summary.severeStudyClassConflicts}`)

if (gate.passed) {
  console.log('\n[research-coverage] PASS — canonical research-quality blocking gate is clear.')
  process.exit(0)
}

console.error(`\n[research-coverage] FAILED — ${gate.summary.structuralFailures} invalid evidence edge(s), ${gate.summary.severeStudyClassConflicts} severe study-class conflict(s).`)
for (const item of unsupported.slice(0, 25)) {
  console.error(`  unsupported · ${item.url} · ${item.claimId}`)
}
for (const item of dangling.slice(0, 25)) {
  console.error(`  dangling · ${item.url} · ${item.claimId} -> ${item.sourceRefId}`)
}
for (const conflict of gate.severeStudyClassConflicts.slice(0, 25)) {
  console.error(`  class-conflict · ${conflict.url} · ${conflict.studyId} · ${conflict.classes.join(' <> ')}`)
}
if (gate.summary.blockingFailures > 75) console.error(`  ...and ${gate.summary.blockingFailures - 75} more`)
process.exit(1)

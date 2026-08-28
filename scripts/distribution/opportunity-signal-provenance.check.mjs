#!/usr/bin/env node
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-signal-provenance-'))
const objectsPath = path.join(tmp, 'research-objects.json')
const objectId = 'signal-provenance-fixture'
// Coverage is field-based so metadata-only records must remain fallback-driven.
fs.writeFileSync(objectsPath, `${JSON.stringify([{
  id: objectId,
  title: 'Signal provenance fixture',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  finding: 'A governed human-evidence finding.',
  limitation: 'A governed limitation.',
  evidenceGrade: 'A',
  evidenceType: 'human randomized trial',
  lastVerified: new Date().toISOString().slice(0, 10),
}], null, 2)}\n`)

function runScenario(name, signalPayload, { missing = false } = {}) {
  const scenarioDir = path.join(tmp, name)
  const output = path.join(scenarioDir, 'out')
  const signalsPath = path.join(scenarioDir, 'signals.json')
  fs.mkdirSync(scenarioDir, { recursive: true })
  if (!missing) fs.writeFileSync(signalsPath, `${JSON.stringify(signalPayload, null, 2)}\n`)
  const run = spawnSync(process.execPath, ['scripts/distribution/build-opportunity-selection.mjs', objectsPath], {
    cwd: root,
    env: { ...process.env, DISTRIBUTION_OUTPUT: output, DISTRIBUTION_OPPORTUNITY_SIGNALS: signalsPath },
    encoding: 'utf8',
  })
  assert.equal(run.status, 0, run.stderr || run.stdout)
  const artifact = JSON.parse(fs.readFileSync(path.join(output, 'opportunity-selection.json'), 'utf8'))
  return { artifact, run }
}

const missing = runScenario('missing', {}, { missing: true })
assert.equal(missing.artifact.signals, null)
assert.equal(missing.artifact.signalEvidence.mode, 'fallback-defaults')
assert.equal(missing.artifact.signalEvidence.signalFilePresent, false)
assert.equal(missing.artifact.signalEvidence.signalRecordCount, 0)
assert.equal(missing.artifact.signalEvidence.coveredGovernedCandidateCount, 0)
assert.equal(missing.artifact.signalEvidence.partiallyCoveredGovernedCandidateCount, 0)
assert.equal(missing.artifact.signalEvidence.expectedDemandFieldCount, 6)
assert.equal(missing.artifact.signalEvidence.observedDemandFieldCount, 0)
assert.equal(missing.artifact.signalEvidence.demandFieldCoverageRatio, 0)
assert.equal(missing.artifact.signalEvidence.coverageRatio, 0)
assert.match(missing.artifact.signalEvidence.warning, /fallback-driven/)
assert.match(missing.run.stdout, /opportunity signal coverage: 0\/6 demand fields \(fallback-defaults\)/)

const metadataOnly = runScenario('metadata-only', {
  [objectId]: { effort: 2, existingAngleCohorts: ['already-produced'] },
})
assert.equal(metadataOnly.artifact.signalEvidence.mode, 'fallback-defaults')
assert.equal(metadataOnly.artifact.signalEvidence.signalFilePresent, true)
assert.equal(metadataOnly.artifact.signalEvidence.signalRecordCount, 1)
assert.equal(metadataOnly.artifact.signalEvidence.coveredGovernedCandidateCount, 0)
assert.equal(metadataOnly.artifact.signalEvidence.partiallyCoveredGovernedCandidateCount, 0)
assert.equal(metadataOnly.artifact.signalEvidence.observedDemandFieldCount, 0)
assert.equal(metadataOnly.artifact.signalEvidence.demandFieldCoverageRatio, 0)
assert.match(metadataOnly.artifact.signalEvidence.warning, /fallback-driven/)

const partial = runScenario('partial', {
  [objectId]: {
    searchOpportunity: 8,
    aiCitationOpportunity: '7',
    socialSuitability: null,
    commercialValue: '',
    informationUniqueness: 'not-a-number',
    evergreenValue: undefined,
    effort: 2,
  },
})
assert.equal(partial.artifact.signalEvidence.mode, 'partial-observed-signals')
assert.equal(partial.artifact.signalEvidence.coveredGovernedCandidateCount, 0)
assert.equal(partial.artifact.signalEvidence.partiallyCoveredGovernedCandidateCount, 1)
assert.deepEqual(partial.artifact.signalEvidence.partiallyCoveredGovernedIds, [objectId])
assert.equal(partial.artifact.signalEvidence.observedDemandFieldCount, 2)
assert.equal(partial.artifact.signalEvidence.expectedDemandFieldCount, 6)
assert.equal(partial.artifact.signalEvidence.demandFieldCoverageRatio, 0.3333)
assert.equal(partial.artifact.signalEvidence.coverageRatio, 0)
assert.deepEqual(partial.artifact.signalEvidence.demandFieldCoverageByGovernedId[objectId].observedFields, ['searchOpportunity', 'aiCitationOpportunity'])
assert.match(partial.artifact.signalEvidence.warning, /fallback-driven/)

const complete = runScenario('complete', {
  [objectId]: {
    searchOpportunity: 8,
    aiCitationOpportunity: 7,
    socialSuitability: 8,
    commercialValue: 5,
    informationUniqueness: 9,
    evergreenValue: 9,
  },
})
assert.equal(complete.artifact.signalEvidence.mode, 'observed-signals')
assert.equal(complete.artifact.signalEvidence.coveredGovernedCandidateCount, 1)
assert.equal(complete.artifact.signalEvidence.partiallyCoveredGovernedCandidateCount, 0)
assert.deepEqual(complete.artifact.signalEvidence.coveredGovernedIds, [objectId])
assert.equal(complete.artifact.signalEvidence.observedDemandFieldCount, 6)
assert.equal(complete.artifact.signalEvidence.expectedDemandFieldCount, 6)
assert.equal(complete.artifact.signalEvidence.demandFieldCoverageRatio, 1)
assert.equal(complete.artifact.signalEvidence.coverageRatio, 1)
assert.equal(complete.artifact.signalEvidence.warning, null)

console.log('[distribution] opportunity signal provenance regression passed')

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  acquireLease,
  buildCoverageHeatmap,
  canAcquireLease,
  candidateFingerprint,
  classifyDifficulty,
  evidenceDecayScore,
  runBenchmark,
  scoreOpportunity,
  shouldDeepWork,
  sourceDiversity,
} from '../governor.mjs'

test('normalizes DOI identity for deduplication', () => {
  assert.equal(
    candidateFingerprint({ doi: 'https://doi.org/10.1234/ABC.9' }),
    candidateFingerprint({ doi: 'doi:10.1234/abc.9' })
  )
})

test('safety work bypasses normal deep-work score threshold', () => {
  assert.equal(shouldDeepWork({ kind: 'safety', evidenceGapSeverity: 1 }).deepWork, true)
})

test('hard scientific ambiguity escalates difficulty', () => {
  assert.equal(classifyDifficulty({ reasons: ['species_transfer_risk'] }), 'hard')
})

test('coordination lease blocks overlapping files and entities', () => {
  const first = acquireLease({ leases: [] }, { id: 'lease-a', files: ['a.json'], entities: ['herb:kava'] }, 0)
  assert.equal(first.acquired, true)
  assert.equal(canAcquireLease(first.queue, { files: ['a.json'] }, 1).ok, false)
  assert.equal(canAcquireLease(first.queue, { entities: ['herb:kava'] }, 1).ok, false)
  assert.equal(canAcquireLease(first.queue, { files: ['b.json'], entities: ['herb:chamomile'] }, 1).ok, true)
})

test('source diversity flags single-source dominance', () => {
  const result = sourceDiversity([
    { sourceId: 's1', evidenceClass: 'human-clinical', claimType: 'efficacy_signal' },
    { sourceId: 's1', evidenceClass: 'human-clinical', claimType: 'efficacy_null_or_mixed' },
  ])
  assert.ok(result.flags.includes('single_source_dominance'))
  assert.ok(result.flags.includes('low_source_independence'))
})

test('decay score increases with integrity concerns', () => {
  const stable = evidenceDecayScore({ ageDays: 30, supportingSources: 3 })
  const concern = evidenceDecayScore({ ageDays: 30, supportingSources: 3, integrityConcern: true })
  assert.ok(concern > stable)
})

test('opportunity score rewards high-value, low-risk work', () => {
  const high = scoreOpportunity({
    evidenceGapSeverity: 100,
    pageImportance: 100,
    evidenceQuality: 90,
    freshness: 90,
    safetyImportance: 100,
    userFacingAccuracyImpact: 100,
    implementationEffort: 10,
    scientificMergeRisk: 10,
  })
  const low = scoreOpportunity({
    evidenceGapSeverity: 20,
    pageImportance: 20,
    evidenceQuality: 20,
    freshness: 20,
    safetyImportance: 0,
    userFacingAccuracyImpact: 20,
    implementationEffort: 90,
    scientificMergeRisk: 90,
  })
  assert.ok(high > low)
})

test('preclinical efficacy is not counted as human merely because another human entry exists', () => {
  const heatmap = buildCoverageHeatmap([
    {
      entityType: 'herb', entitySlug: 'fixture', sourceId: 's1',
      evidenceClass: 'human-clinical', claimType: 'mechanistic_signal', topicType: 'pathway',
      reviewedAt: new Date().toISOString(),
    },
    {
      entityType: 'herb', entitySlug: 'fixture', sourceId: 's2',
      evidenceClass: 'preclinical-mechanistic', claimType: 'efficacy_signal', topicType: 'supported_use',
      reviewedAt: new Date().toISOString(),
    },
    {
      entityType: 'herb', entitySlug: 'fixture', sourceId: 's3',
      evidenceClass: 'preclinical-mechanistic', claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use',
      reviewedAt: new Date().toISOString(),
    },
  ])
  assert.equal(heatmap.rows[0].dimensions.human_efficacy_signal, false)
  assert.equal(heatmap.rows[0].dimensions.null_or_mixed_human_evidence, false)
})

test('fixed benchmark suite is fully green', () => {
  const result = runBenchmark()
  assert.equal(result.ok, true, JSON.stringify(result, null, 2))
})

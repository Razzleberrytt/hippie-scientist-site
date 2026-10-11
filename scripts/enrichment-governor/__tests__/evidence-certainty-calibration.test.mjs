import test from 'node:test'
import assert from 'node:assert/strict'
import { gradeEvidenceEntries } from '../../enrichment/evidence-grading.mjs'
import { rankEvidenceTier } from '../../enrichment/normalize-enrichment-lib.mjs'

function source(sourceClass = 'randomized-human-trial') {
  return { sourceClass, reliabilityTier: 'tier-a', publicationYear: 2024 }
}
function row(id, changes = {}) {
  return {
    enrichmentId: 'synthetic-' + id, sourceId: id,
    topicType: 'supported_use', claimType: 'efficacy_signal',
    evidenceClass: 'human-clinical',
    ...changes,
  }
}
function classified(rows, sourceMap) {
  return rankEvidenceTier(rows, gradeEvidenceEntries(rows, sourceMap, { nowYear: 2026 }))
}

test('a single RCT never establishes strong entity-level certainty', () => {
  const studies = new Map([['trial1', source()]])
  assert.equal(classified([row('trial1')], studies), 'tier-3-limited')
})

test('several claims from one study do not count as independent efficacy replication', () => {
  const studies = new Map([['trial1', source()]])
  const rows = [row('trial1'), row('trial1', { enrichmentId: 'alternate-endpoint' })]
  assert.equal(classified(rows, studies), 'tier-3-limited')
})

test('safety-only trials do not upgrade a single efficacy trial', () => {
  const studies = new Map([['trial1', source()], ['safety', source()]])
  const rows = [
    row('trial1'),
    row('safety', { topicType: 'adverse_effect', claimType: 'safety_risk' }),
  ]
  assert.equal(classified(rows, studies), 'tier-3-limited')
})

test('distinct source-backed efficacy signals can reach moderate, never automatic strong', () => {
  const studies = new Map([['trial1', source()], ['trial2', source()]])
  const rows = [row('trial1'), row('trial2')]
  assert.equal(gradeEvidenceEntries(rows, studies, { nowYear: 2026 }).evidenceLabel, 'stronger_human_support')
  assert.equal(classified(rows, studies), 'tier-2-moderate')
})

test('null or conflicting human findings prevent moderate confidence inflation', () => {
  const studies = new Map([['trial1', source()], ['trial2', source()], ['null', source()]])
  const rows = [
    row('trial1'), row('trial2'),
    row('null', { topicType: 'unsupported_or_unclear_use', claimType: 'efficacy_null_or_mixed' }),
  ]
  assert.equal(classified(rows, studies), 'tier-3-limited')
})

test('only preclinical and traditional sources remain insufficient for human outcomes', () => {
  const studies = new Map([['mouse', source('preclinical-mechanistic-study')]])
  assert.equal(classified([
    row('mouse', { evidenceClass: 'preclinical-mechanistic', topicType: 'pathway', claimType: 'mechanistic_signal' }),
  ], studies), 'tier-4-insufficient')
})

test('human observational evidence remains limited rather than strong', () => {
  const studies = new Map([['cohort', source('observational-human-evidence')]])
  assert.equal(classified([
    row('cohort', { evidenceClass: 'human-observational', topicType: 'conflict_note' }),
  ], studies), 'tier-3-limited')
})

test('tier calibration is deterministic across source-record ordering', () => {
  const studies = new Map([['trial1', source()], ['trial2', source()]])
  const rows = [row('trial1'), row('trial2')]
  assert.equal(classified(rows, studies), classified([...rows].reverse(), studies))
})

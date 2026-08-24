import test from 'node:test'
import assert from 'node:assert/strict'

import { verifyCanaries } from '../canary.mjs'

const anchors = ['ashwagandha', 'chamomile', 'kava', 'cbd', 'luteolin']

function entry(slug, suffix, overrides = {}) {
  return {
    enrichmentId: `enr_${slug}-${suffix}`,
    entityType: slug === 'cbd' || slug === 'luteolin' ? 'compound' : 'herb',
    entitySlug: slug,
    sourceId: `src_${slug}-${suffix}`,
    claimType: 'efficacy_signal',
    evidenceClass: 'human-clinical',
    topicType: 'supported_use',
    findingTextShort: 'A sufficiently specific source-backed finding.',
    findingTextNormalized: 'A sufficiently specific normalized source-backed finding for the canary regression fixture.',
    reviewer: 'governor-test',
    active: true,
    editorialStatus: 'approved',
    reviewedAt: new Date().toISOString(),
    ...overrides,
  }
}

function completeEntries() {
  return anchors.flatMap(slug => [
    entry(slug, 'efficacy'),
    entry(slug, 'null', { claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use' }),
    entry(slug, 'safety', { claimType: 'safety_risk', topicType: 'adverse_effect' }),
  ])
}

function baselineDebtEntries() {
  return [
    entry('ashwagandha', 'efficacy', { sourceId: 'src_pubmed-31517876' }),
    entry('ashwagandha', 'safety', { sourceId: 'src_nccih-ashwagandha-safety', claimType: 'safety_risk', topicType: 'pregnancy_note', evidenceClass: 'regulatory-monograph' }),
    entry('chamomile', 'safety', { sourceId: 'src_pubmed-31006899', claimType: 'safety_risk', topicType: 'adverse_effect' }),
    entry('chamomile', 'null', { sourceId: 'src_pubmed-31006899', claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use' }),
    entry('kava', 'safety', { sourceId: 'src_cochrane-cd003383', claimType: 'safety_risk', topicType: 'condition_caution' }),
    entry('kava', 'conflict', { sourceId: 'src_cochrane-cd003383', claimType: 'evidence_conflict', topicType: 'conflict_note' }),
    entry('cbd', 'safety', { sourceId: 'src_fda-epidiolex-label-2021', claimType: 'safety_risk', topicType: 'medication_class_caution', evidenceClass: 'regulatory-monograph' }),
    entry('cbd', 'gap', { sourceId: 'src_pubmed-40622698', claimType: 'research_gap', topicType: 'research_gap' }),
    entry('luteolin', 'null', { sourceId: 'src_pubmed-29801717', claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use', evidenceClass: 'preclinical-mechanistic' }),
  ]
}

test('required canary checks block missing source linkage and schema validity', () => {
  const entries = completeEntries()
  entries.find(row => row.entitySlug === 'ashwagandha').sourceId = ''
  const registry = completeEntries().map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.some(value => value.includes('ashwagandha:required_check_failed:source_linkage')))
  assert.ok(result.blockers.some(value => value.includes('ashwagandha:required_check_failed:schema_validity')))
})

test('real normalized-entry schema rejects an invalid enum value', () => {
  const entries = completeEntries()
  entries.find(row => row.entitySlug === 'ashwagandha').entityType = 'plant'
  const registry = entries.map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('ashwagandha:required_check_failed:schema_validity'))
})

test('inactive evidence cannot satisfy a required canary', () => {
  const entries = completeEntries()
  const chamomileSafety = entries.find(row => row.entitySlug === 'chamomile' && row.claimType === 'safety_risk')
  chamomileSafety.active = false
  const registry = entries.map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('chamomile:anchor_requirement_failed:safety_visibility'))
  assert.equal(result.excludedEntryCount, 1)
})

test('unapproved evidence cannot satisfy a required canary', () => {
  const entries = completeEntries()
  const kavaNull = entries.find(row => row.entitySlug === 'kava' && row.claimType === 'efficacy_null_or_mixed')
  kavaNull.editorialStatus = 'needs_review'
  const registry = entries.map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('kava:anchor_requirement_failed:null_visibility'))
  assert.equal(result.excludedEntryCount, 1)
})

test('known baseline debt remains visible without being mislabeled as clean', () => {
  const entries = baselineDebtEntries()
  const result = verifyCanaries(entries, [{ sourceId: 'src_nccih-ashwagandha-safety' }])
  assert.equal(result.pass, true, JSON.stringify(result, null, 2))
  assert.equal(result.idealPass, false)
  assert.equal(result.status, 'PASS_WITH_BASELINE_DEBT')
  assert.deepEqual(result.debt.unresolvedSourceIds, [
    'src_cochrane-cd003383',
    'src_fda-epidiolex-label-2021',
    'src_pubmed-29801717',
    'src_pubmed-31006899',
    'src_pubmed-31517876',
    'src_pubmed-40622698',
  ])
  assert.deepEqual(result.debt.missingNullVisibilityAnchors, ['ashwagandha'])
  assert.deepEqual(result.debt.missingSafetyVisibilityAnchors, ['luteolin'])
  assert.deepEqual(result.debt.unexpectedUnresolvedSourceIds, [])
})

test('ashwagandha pregnancy canary uses the entity-specific NCCIH source, not the CBD label', () => {
  const safety = baselineDebtEntries().find(row => row.entitySlug === 'ashwagandha' && row.topicType === 'pregnancy_note')
  assert.equal(safety.sourceId, 'src_nccih-ashwagandha-safety')
  assert.notEqual(safety.sourceId, 'src_fda-epidiolex-label-2021')
})

test('canary ratchet blocks a new unresolved source even when total debt count does not grow', () => {
  const entries = baselineDebtEntries().map(row => row.sourceId === 'src_pubmed-31517876' ? { ...row, sourceId: 'src_new-source' } : row)
  const result = verifyCanaries(entries, [{ sourceId: 'src_nccih-ashwagandha-safety' }])
  assert.equal(result.debt.unresolvedSourceIds.length, 6)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('new_provenance_debt:unresolved_source:src_new-source'))
})

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

test('required canary checks block missing source linkage and schema shape', () => {
  const entries = completeEntries()
  entries.find(row => row.entitySlug === 'ashwagandha').sourceId = ''
  const registry = completeEntries().map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.some(value => value.includes('ashwagandha:required_check_failed:source_linkage')))
  assert.ok(result.blockers.some(value => value.includes('ashwagandha:required_check_failed:schema_validity')))
})

test('known baseline debt remains visible without being mislabeled as clean', () => {
  const entries = [
    entry('ashwagandha', 'a', { claimType: 'safety_risk', topicType: 'pregnancy_note' }),
    entry('chamomile', 'b', { claimType: 'safety_risk', topicType: 'adverse_effect' }),
    entry('chamomile', 'c', { claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use' }),
    entry('kava', 'd', { claimType: 'safety_risk', topicType: 'condition_caution' }),
    entry('kava', 'e', { claimType: 'evidence_conflict', topicType: 'conflict_note' }),
    entry('cbd', 'f', { claimType: 'safety_risk', topicType: 'medication_class_caution' }),
    entry('cbd', 'g', { claimType: 'research_gap', topicType: 'research_gap' }),
    entry('luteolin', 'h', { claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use' }),
  ]
  // Resolve two IDs so the unresolved-source debt is exactly six, matching the declared baseline budget.
  const registry = [{ sourceId: entries[0].sourceId }, { sourceId: entries[1].sourceId }]
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, true, JSON.stringify(result, null, 2))
  assert.equal(result.idealPass, false)
  assert.equal(result.status, 'PASS_WITH_BASELINE_DEBT')
  assert.equal(result.debt.unresolvedSourceIds.length, 6)
  assert.deepEqual(result.debt.missingNullVisibilityAnchors, ['ashwagandha'])
  assert.deepEqual(result.debt.missingSafetyVisibilityAnchors, ['luteolin'])
})

test('canary ratchet blocks an increase in unresolved-source debt', () => {
  const entries = completeEntries()
  // Seven unique unresolved sources are enough to exceed the six-source baseline debt budget.
  const reduced = [
    entries.find(row => row.entitySlug === 'ashwagandha' && row.claimType === 'efficacy_signal'),
    entries.find(row => row.entitySlug === 'ashwagandha' && row.claimType === 'efficacy_null_or_mixed'),
    entries.find(row => row.entitySlug === 'ashwagandha' && row.claimType === 'safety_risk'),
    entries.find(row => row.entitySlug === 'chamomile' && row.claimType === 'efficacy_null_or_mixed'),
    entries.find(row => row.entitySlug === 'chamomile' && row.claimType === 'safety_risk'),
    entries.find(row => row.entitySlug === 'kava' && row.claimType === 'efficacy_null_or_mixed'),
    entries.find(row => row.entitySlug === 'kava' && row.claimType === 'safety_risk'),
    entries.find(row => row.entitySlug === 'cbd' && row.claimType === 'efficacy_null_or_mixed'),
    entries.find(row => row.entitySlug === 'cbd' && row.claimType === 'safety_risk'),
    entries.find(row => row.entitySlug === 'luteolin' && row.claimType === 'efficacy_null_or_mixed'),
    entries.find(row => row.entitySlug === 'luteolin' && row.claimType === 'safety_risk'),
  ]
  // Resolve all but seven unique IDs.
  const uniqueIds = [...new Set(reduced.map(row => row.sourceId))]
  const registry = uniqueIds.slice(7).map(sourceId => ({ sourceId }))
  const result = verifyCanaries(reduced, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('baseline_debt_increased:unresolved_source_ids:7'))
})

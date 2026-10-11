import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateEntryReadiness,
  rollupToResearchEnrichment,
} from '../../enrichment/normalize-enrichment-lib.mjs'

const approved = {
  enrichmentId: 'enr_synthetic-quarantine-proof',
  entityType: 'herb',
  entitySlug: 'quarantine-proof',
  sourceId: 'src_synthetic',
  topicType: 'supported_use',
  evidenceClass: 'human-clinical',
  findingTextShort: 'Synthetic gate regression test only',
  findingTextNormalized: 'Synthetic regression text not intended for publication.',
  reviewer: 'test-fixture-reviewer',
  reviewedAt: '2026-10-10T00:00:00.000Z',
  editorialStatus: 'approved',
  reviewStatus: 'approved_for_rollup',
  active: true,
}
const source = { active: true, publicationStatus: 'current' }

test('transform readiness accepts only explicit independent review approval', () => {
  assert.equal(evaluateEntryReadiness(approved, source).publishable, true)
})

test('transform refuses August 30-style draft despite editorial approval', () => {
  const outcome = evaluateEntryReadiness({ ...approved, reviewStatus: 'draft_submission' }, source)
  assert.equal(outcome.publishable, false)
  assert.ok(outcome.reasons.includes('submission_review_not_approved'))
})

test('transform refuses missing independent approval', () => {
  assert.equal(evaluateEntryReadiness({ ...approved, reviewStatus: undefined }, source).publishable, false)
})

test('transform refuses review-ready and deprecated approvals', () => {
  for (const reviewStatus of ['ready_for_review', 'under_review', 'deprecated_submission']) {
    assert.equal(evaluateEntryReadiness({ ...approved, reviewStatus }, source).publishable, false)
  }
})

test('transform requires active entries and publishable editorial status', () => {
  assert.equal(evaluateEntryReadiness({ ...approved, active: false }, source).publishable, false)
  assert.equal(evaluateEntryReadiness({ ...approved, editorialStatus: 'draft' }, source).publishable, false)
})

test('transform cannot be bypassed by unrecognized migration flags', () => {
  const outcome = evaluateEntryReadiness({ ...approved, reviewStatus: undefined, legacyApproved: true }, source)
  assert.equal(outcome.publishable, false)
})

test('rollup does not emit an unapproved entity with editorial approval', () => {
  const entry = { ...approved, reviewStatus: 'draft_submission' }
  const rows = rollupToResearchEnrichment([entry], new Map([[entry.sourceId, source]]))
  assert.deepEqual(rows, [])
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { stagedClosureEntityKeys } from '../../enrichment-pipeline/lib/staged-closure-seeds.mjs'

function record(submission, canonicalWorkpackId = submission.workpackId, sourceKind = 'parallel') {
  return {
    sourceKind,
    submission,
    reconciliation: { canonicalWorkpackId },
  }
}

test('nonterminal parallel closure debt seeds canonical health owners only', () => {
  const reconciliation = {
    candidates: [
      record({
        submissionId: 'sub_cobalamin_pending',
        workpackId: 'wp_compound_cobalamin',
        reviewStatus: 'draft_submission',
        active: true,
      }),
      record({
        submissionId: 'sub_alias_pending',
        workpackId: 'wp_compound_old_name',
        reviewStatus: 'ready_for_review',
        active: true,
      }, 'wp_compound_canonical_name'),
      record({
        submissionId: 'sub_legacy_pending',
        workpackId: 'wp_compound_legacy',
        reviewStatus: 'draft_submission',
        active: true,
      }, 'wp_compound_legacy', 'legacy'),
    ],
    blocked: [
      record({
        submissionId: 'sub_missing_source_pending',
        workpackId: 'wp_herb_example',
        reviewStatus: 'draft_submission',
        active: true,
      }),
    ],
  }

  const attestations = {
    entries: [
      { submissionId: 'sub_alias_pending', promotionStatus: 'promoted' },
    ],
  }

  assert.deepEqual(
    stagedClosureEntityKeys({ reconciliation, attestations }),
    ['compound:cobalamin', 'herb:example'],
  )
})

test('terminal review and promotion states do not remain staged health seeds', () => {
  const reconciliation = {
    candidates: [
      record({ submissionId: 'sub_rejected', workpackId: 'wp_compound_rejected', reviewStatus: 'rejected', active: true }),
      record({ submissionId: 'sub_inactive', workpackId: 'wp_compound_inactive', reviewStatus: 'draft_submission', active: false }),
      record({ submissionId: 'sub_not_promoted', workpackId: 'wp_compound_np', reviewStatus: 'draft_submission', active: true }),
      record({ submissionId: 'sub_quarantined', workpackId: 'wp_compound_q', reviewStatus: 'under_review', active: true }),
    ],
    blocked: [],
  }
  const attestations = {
    entries: [
      { submissionId: 'sub_not_promoted', promotionStatus: 'not_promoted' },
      { submissionId: 'sub_quarantined', promotionStatus: 'quarantined' },
    ],
  }
  assert.deepEqual(stagedClosureEntityKeys({ reconciliation, attestations }), [])
})

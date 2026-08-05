import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildCollisionReviewRows,
  collisionReviewToCsv,
} from '../build-identity-collision-review.mjs'

test('sorts collision review rows by severity and preserves editorial fields', () => {
  const rows = buildCollisionReviewRows({
    collisions: [
      {
        type: 'alias-collision',
        key: 'withania-somnifera',
        classification: 'same-type-alias-duplicate',
        severity: 'medium',
        recommendedAction: 'Choose a canonical record.',
        recordIds: ['herb:ashwagandha', 'herb:withania-somnifera'],
        entities: [
          {
            entityType: 'herb',
            canonicalName: 'Ashwagandha',
            canonicalSlug: 'ashwagandha',
            provenance: { sheet: 'Entity_Master', sourceRow: 2 },
          },
          {
            entityType: 'herb',
            canonicalName: 'Withania somnifera',
            canonicalSlug: 'withania-somnifera',
            provenance: { sheet: 'Entity_Master', sourceRow: 3 },
          },
        ],
      },
      {
        type: 'canonical-slug-collision',
        key: 'magnesium',
        classification: 'identity-critical',
        severity: 'blocking',
        recommendedAction: 'Resolve the slug.',
        recordIds: ['compound:magnesium', 'herb:magnesium'],
        entities: [
          {
            entityType: 'compound',
            canonicalName: 'Magnesium',
            canonicalSlug: 'magnesium',
            provenance: { sheet: 'Entity_Master', sourceRow: 4 },
          },
          {
            entityType: 'herb',
            canonicalName: 'Magnesium',
            canonicalSlug: 'magnesium',
            provenance: { sheet: 'Entity_Master', sourceRow: 5 },
          },
        ],
      },
    ],
  })

  assert.equal(rows.length, 2)
  assert.equal(rows[0].severity, 'blocking')
  assert.equal(rows[0].resolutionStatus, 'pending')
  assert.equal(rows[1].collisionKey, 'withania-somnifera')
  assert.deepEqual(rows[1].provenance, ['Entity_Master!row2', 'Entity_Master!row3'])
})

test('writes a quoted CSV with one data row per collision', () => {
  const rows = [{
    severity: 'high',
    classification: 'same-type-name-duplicate',
    collisionType: 'canonical-name-collision',
    collisionKey: 'coenzyme-q10',
    entityCount: 2,
    recordIds: ['compound:coenzyme-q10', 'compound:coq10'],
    entityTypes: ['compound', 'compound'],
    canonicalNames: ['Coenzyme Q10', 'Coenzyme Q10'],
    canonicalSlugs: ['coenzyme-q10', 'coq10'],
    provenance: ['Entity_Master!row20', 'Entity_Master!row21'],
    recommendedAction: 'Choose a canonical record and preserve the other as an alias.',
    resolutionStatus: 'pending',
    canonicalRecordId: '',
    resolutionNotes: '',
  }]

  const csv = collisionReviewToCsv(rows)
  const lines = csv.trimEnd().split('\n')

  assert.equal(lines.length, 2)
  assert.match(lines[0], /"resolution_status"/)
  assert.match(lines[1], /"compound:coenzyme-q10 \| compound:coq10"/)
  assert.match(lines[1], /"pending"/)
})

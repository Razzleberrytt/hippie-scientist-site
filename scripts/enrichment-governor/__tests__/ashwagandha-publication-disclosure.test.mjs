import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  parseNormalizedInput,
  rollupToResearchEnrichment,
} from '../../enrichment/normalize-enrichment-lib.mjs'

const DISCLOSURE_PREFIX = 'Arjuna Natural Ltd funded the study and supplied the tested Shoden extract'
const REPLICATION_BOUNDARY =
  'does not establish independent replication of the exact formulation, dose, population, and duration'

test('Ashwagandha sponsor disclosure survives a synthetic approved rollup without migrating real claims', () => {
  const entries = parseNormalizedInput()
  const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
  const sourceById = new Map(registry.map(source => [source.sourceId, source]))

  // Test only: deliberately simulate independent approval on in-memory copies.
  // This does not authorize, mutate or publish any legacy normalized finding.
  // The actual source data must remain fail-closed until claim-specific review.
  const syntheticApproved = entries
    .filter(entry => entry.entityType === 'herb' && entry.entitySlug === 'ashwagandha' &&
      entry.active === true && entry.editorialStatus === 'approved')
    .map(entry => ({ ...entry, reviewStatus: 'approved_for_rollup' }))

  assert.ok(syntheticApproved.length > 0, 'expected source-backed Ashwagandha test records')
  assert.ok(syntheticApproved.every(entry => entry.reviewStatus === 'approved_for_rollup'))
  const ashwagandha = rollupToResearchEnrichment(syntheticApproved, sourceById).find(
    item => item.entityType === 'herb' && item.entitySlug === 'ashwagandha',
  )

  assert.ok(ashwagandha, 'expected an Ashwagandha rollup')
  const { researchEnrichment } = ashwagandha
  assert.equal(
    researchEnrichment.editorialReadiness.conflictLabelingPresent,
    true,
    'embedded sponsor disclosure must count as conflict labeling before publication gating',
  )
  assert.equal(
    researchEnrichment.editorialReadiness.publishable,
    true,
    'Ashwagandha rollup must remain publishable once the source-backed conflict is labeled',
  )
  assert.ok(
    researchEnrichment.conflictNotes.some(
      note =>
        note.sourceRefIds.includes('src_pubmed-31517876') &&
        note.claim.includes(DISCLOSURE_PREFIX) &&
        note.claim.includes(REPLICATION_BOUNDARY),
    ),
    'expected the sponsor and exact-context replication disclosure in top-level conflictNotes',
  )
})

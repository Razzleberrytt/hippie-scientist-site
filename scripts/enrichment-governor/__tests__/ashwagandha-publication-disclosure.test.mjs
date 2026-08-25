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

test('Ashwagandha sponsor disclosure clears the real rollup publication boundary', () => {
  const entries = parseNormalizedInput()
  const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
  const sourceById = new Map(registry.map(source => [source.sourceId, source]))

  const ashwagandha = rollupToResearchEnrichment(entries, sourceById).find(
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

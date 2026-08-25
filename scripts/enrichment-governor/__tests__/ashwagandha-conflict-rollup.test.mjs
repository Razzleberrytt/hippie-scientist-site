import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  parseNormalizedInput,
  rollupToResearchEnrichment,
} from '../../enrichment/normalize-enrichment-lib.mjs'

test('Ashwagandha sponsor disclosure reaches published conflictNotes rollup', () => {
  const entries = parseNormalizedInput()
  const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
  const sourceById = new Map(registry.map(source => [source.sourceId, source]))

  const rollups = rollupToResearchEnrichment(entries, sourceById)
  const ashwagandha = rollups.find(
    item => item.entityType === 'herb' && item.entitySlug === 'ashwagandha',
  )

  assert.ok(ashwagandha, 'expected an Ashwagandha research-enrichment rollup')
  const conflictClaims = ashwagandha.researchEnrichment.conflictNotes.map(item => item.claim)
  assert.ok(
    conflictClaims.some(
      claim =>
        claim.includes('Arjuna Natural Ltd funded the study') &&
        claim.includes('does not establish independent replication of the exact formulation, dose, population, and duration'),
    ),
    'expected sponsor and exact-context replication disclosure in published conflictNotes',
  )
})

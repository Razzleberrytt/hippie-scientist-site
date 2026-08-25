import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import {
  INPUT_PATH_DEFAULT,
  parseNormalizedInput,
  rollupToResearchEnrichment,
  validateAndNormalizeEntries,
} from '../../enrichment/normalize-enrichment-lib.mjs'

const ROOT = process.cwd()
const GOVERNED_PATH = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')

function buildExpectedRollup() {
  const entries = parseNormalizedInput(INPUT_PATH_DEFAULT)
  const { normalizedEntries, issues, sourceById } = validateAndNormalizeEntries(entries, {
    includeNearDuplicateCheck: true,
  })
  assert.deepEqual(issues, [], 'canonical normalized ledger must validate before governed rollup')
  return rollupToResearchEnrichment(normalizedEntries, sourceById)
}

test('committed governed artifact exactly matches serialized canonical normalized rollup', () => {
  const expected = JSON.parse(JSON.stringify(buildExpectedRollup()))
  const actual = JSON.parse(fs.readFileSync(GOVERNED_PATH, 'utf8'))
  assert.deepEqual(actual, expected)
})

test('production governed artifact publishes the Ashwagandha sponsor disclosure', () => {
  const actual = JSON.parse(fs.readFileSync(GOVERNED_PATH, 'utf8'))
  assert.ok(Array.isArray(actual), 'governed enrichment artifact must be the rollup array, not the fallback object')

  const ashwagandha = actual.find(
    row => row?.entityType === 'herb' && row?.entitySlug === 'ashwagandha',
  )
  assert.ok(ashwagandha, 'Ashwagandha governed rollup row must exist')
  assert.equal(ashwagandha.researchEnrichment?.editorialReadiness?.publishable, true)
  assert.equal(ashwagandha.researchEnrichment?.editorialReadiness?.conflictLabelingPresent, true)

  const disclosures = ashwagandha.researchEnrichment?.conflictNotes ?? []
  assert.ok(
    disclosures.some(
      note =>
        /Arjuna Natural Ltd funded the study/u.test(note?.claim ?? '') &&
        /does not establish independent replication/u.test(note?.claim ?? ''),
    ),
    'top-level production conflictNotes must retain sponsor and exact-replication disclosure',
  )
})

import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const SOURCE_ID = 'src_pubmed-41943502'
const normalized = fs
  .readFileSync('public/data/enrichment-normalized.jsonl', 'utf8')
  .trim()
  .split(/\r?\n/u)
  .map(line => JSON.parse(line))
const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const governed = JSON.parse(fs.readFileSync('public/data/enrichment-governed.json', 'utf8'))

test('KSM-66 safety evidence preserves its exact short-term boundary and provenance', () => {
  const source = registry.find(item => item.sourceId === SOURCE_ID)
  assert.ok(source)
  assert.equal(source.pmid, '41943502')
  assert.equal(source.pmcid, 'PMC13436282')
  assert.equal(source.doi, '10.1002/ptr.70315')
  assert.match(source.notes, /root-only KSM-66/)
  assert.match(source.notes, /Shri Kartikeya Pharma/)
  assert.match(source.notes, /Ixoreal Biomed/)
  assert.match(source.notes, /does not establish comparative efficacy/)

  const records = normalized.filter(item => item.sourceId === SOURCE_ID)
  assert.equal(records.length, 3)
  assert.equal(records.some(item => item.topicType === 'supported_use'), false)
  assert.deepEqual(
    records.map(item => item.topicType).sort(),
    ['adverse_effect', 'population_specific_note', 'research_gap'],
  )

  const safety = records.find(item => item.topicType === 'adverse_effect')
  assert.match(safety.findingTextNormalized, /28\/498 \(5\.6%\)/)
  assert.match(safety.findingTextNormalized, /46\/504 \(9\.2%\)/)
  assert.match(safety.findingTextNormalized, /p=0\.487/)
  assert.match(safety.usageContext, /600 mg\/day/)
  assert.match(safety.uncertaintyNote, /rare or longer-latency/)

  const labGap = records.find(item => item.topicType === 'research_gap')
  assert.match(labGap.findingTextNormalized, /892 participants/)
  assert.match(labGap.uncertaintyNote, /paired laboratory data were incomplete/)

  const boundary = records.find(item => item.topicType === 'population_specific_note')
  assert.match(boundary.findingTextNormalized, /withaferin A below 0\.1%/)
  assert.match(boundary.findingTextNormalized, /most of whom were enrolled in India/)
})

test('governed Ashwagandha rollup publishes the source without broad safety or efficacy claims', () => {
  const ashwagandha = governed.find(item => item.entityType === 'herb' && item.entitySlug === 'ashwagandha')
  assert.ok(ashwagandha)
  const evidence = ashwagandha.researchEnrichment
  assert.ok(evidence.sourceRegistryIds.includes(SOURCE_ID))
  assert.equal(
    evidence.supportedUses.some(item => item.sourceRefIds.includes(SOURCE_ID)),
    false,
  )
  assert.ok(
    evidence.adverseEffects.some(
      item =>
        item.sourceRefIds.includes(SOURCE_ID) &&
        /short-term product-specific tolerability observation/.test(item.claim),
    ),
  )
  assert.ok(
    evidence.researchGaps.some(
      item =>
        item.sourceRefIds.includes(SOURCE_ID) &&
        /cannot establish broad or long-term/.test(item.claim),
    ),
  )
  assert.ok(
    evidence.populationSpecificNotes.some(
      item =>
        item.sourceRefIds.includes(SOURCE_ID) &&
        /should not be generalized/.test(item.claim),
    ),
  )
})

import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const SOURCE_ID = 'src_pubmed-41789242'
const normalized = fs
  .readFileSync('public/data/enrichment-normalized.jsonl', 'utf8')
  .trim()
  .split(/\r?\n/u)
  .map(line => JSON.parse(line))
const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const governed = JSON.parse(fs.readFileSync('public/data/enrichment-governed.json', 'utf8'))

test('healthy-adult CBD safety meta-analysis preserves signal, null findings, and provenance', () => {
  const source = registry.find(item => item.sourceId === SOURCE_ID)
  assert.ok(source)
  assert.equal(source.pmid, '41789242')
  assert.equal(source.doi, '10.1097/MS9.0000000000004549')
  assert.equal(source.studyDesign, 'meta-analysis')
  assert.match(source.notes, /four randomized placebo-controlled trials involving 269 healthy adults/)
  assert.match(source.notes, /RR 5\.85, 95% CI 1\.14–30\.02; P=0\.03/)
  assert.match(source.notes, /abdominal pain and headache trends were not statistically significant/)
  assert.match(source.notes, /fatigue, dizziness, and upper respiratory tract infection did not differ significantly/)
  assert.match(source.notes, /PMCID PMC12959810/)
  assert.match(source.notes, /does not establish a general dose or long-term safety/)
  assert.match(source.notes, /declared no conflict of interest/)

  const records = normalized.filter(item => item.sourceId === SOURCE_ID)
  assert.equal(records.length, 1)
  const safety = records[0]
  assert.equal(safety.topicType, 'adverse_effect')
  assert.equal(safety.claimType, 'safety_risk')
  assert.match(safety.findingTextNormalized, /four randomized placebo-controlled trials involving 269 healthy adults/)
  assert.match(safety.findingTextNormalized, /RR 5\.85, 95% CI 1\.14–30\.02; P=0\.03/)
  assert.match(safety.findingTextNormalized, /abdominal pain and headache trended higher without statistical significance/)
  assert.match(safety.findingTextNormalized, /fatigue, dizziness, and upper respiratory tract infection did not differ significantly/)
  assert.match(safety.usageContext, /no single dose or regimen is established/)
  assert.match(safety.uncertaintyNote, /do not establish risk outside healthy adults, a general dose, or long-term safety/)
  assert.equal(records.some(item => item.topicType === 'supported_use'), false)
  assert.equal(records.some(item => item.topicType === 'dosage_context'), false)
})

test('governed CBD rollup publishes the narrow safety finding without efficacy or dose claims', () => {
  const cbd = governed.find(item => item.entityType === 'compound' && item.entitySlug === 'cannabidiol')
  assert.ok(cbd)
  const evidence = cbd.researchEnrichment
  assert.ok(evidence.sourceRegistryIds.includes(SOURCE_ID))
  assert.ok(evidence.adverseEffects.some(item => item.sourceRefIds.includes(SOURCE_ID) && /more diarrhea/.test(item.claim)))
  assert.ok(evidence.safetyProfile.safetyEntries.some(item => item.sourceId === SOURCE_ID && item.severityLabel === 'moderate'))
  assert.equal(evidence.supportedUses.some(item => item.sourceRefIds.includes(SOURCE_ID)), false)
  assert.equal(evidence.dosageContextNotes.some(item => item.sourceRefIds.includes(SOURCE_ID)), false)
  assert.equal(evidence.topicEvidenceJudgments.adverse_effect.grading.replicationDepth, 2)
  assert.equal(evidence.topicEvidenceJudgments.adverse_effect.grading.sourceReliabilityTier, 'tier-a')
})

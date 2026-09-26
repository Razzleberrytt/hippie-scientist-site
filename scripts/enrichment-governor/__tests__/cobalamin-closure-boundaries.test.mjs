import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSessionBootstrap } from '../../enrichment-pipeline/lib/session-bootstrap.mjs'

const SOURCE_IDS = [
  'src_pubmed-33809274',
  'src_pubmed-22221769',
  'src_pubmed-37046885',
  'src_pubmed-42227307',
  'src_pubmed-39655146',
]
const SOURCE_PMIDS = new Set(['33809274', '22221769', '37046885', '42227307', '39655146'])
const SUBMISSION_IDS = [
  'sub_session-c-cobalamin-nondeficient-meta-null-20260905',
  'sub_session-c-cobalamin-deficiency-cognition-boundary-20260905',
  'sub_session-c-cobalamin-neurologic-review-mixed-20260905',
  'sub_session-c-cobalamin-child-cochrane-20260905',
  'sub_session-c-cobalamin-memory-depression-meta-null-20260920',
]

const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const normalized = fs.readFileSync('public/data/enrichment-normalized.jsonl', 'utf8').trim().split(/\r?\n/u).map(line => JSON.parse(line))
const governed = JSON.parse(fs.readFileSync('public/data/enrichment-governed.json', 'utf8'))
const attestations = JSON.parse(fs.readFileSync('ops/enrichment-semantic-attestations.json', 'utf8'))
const manifest = JSON.parse(fs.readFileSync('ops/research-sessions/session-manifest.json', 'utf8'))
const detail = JSON.parse(fs.readFileSync('public/data/compounds-detail/cobalamin.json', 'utf8'))
const aiEntity = JSON.parse(fs.readFileSync('public/data/ai-entities/compound/cobalamin.json', 'utf8'))

test('Cobalamin closure registers exactly the five governed PubMed identities', () => {
  const sources = registry.filter(item => SOURCE_PMIDS.has(String(item.pmid || '')))
  assert.equal(sources.length, 5)
  assert.deepEqual(new Set(sources.map(item => item.sourceId)), new Set(SOURCE_IDS))
  assert.ok(sources.every(item => item.active === true))
  assert.ok(sources.every(item => item.doi))

  const leaked = normalized.filter(item => item.entitySlug === 'methylcobalamin' && SOURCE_IDS.includes(item.sourceId))
  assert.equal(leaked.length, 0)
})

test('Cobalamin normalized evidence preserves deficiency, null, and pediatric boundaries', () => {
  const records = normalized.filter(item => item.entityType === 'compound' && item.entitySlug === 'cobalamin')
  assert.equal(records.length, 5)
  assert.equal(records.some(item => item.topicType === 'dosage_context'), false)
  assert.equal(records.some(item => item.topicType === 'supported_use'), false)

  const nondeficient = records.find(item => item.sourceId === 'src_pubmed-33809274')
  assert.ok(nondeficient)
  assert.equal(nondeficient.topicType, 'unsupported_or_unclear_use')
  assert.match(nondeficient.findingTextNormalized, /without overt vitamin B12 deficiency/i)
  assert.match(nondeficient.uncertaintyNote, /does not negate treatment of true deficiency/i)

  const deficiency = records.find(item => item.sourceId === 'src_pubmed-22221769')
  assert.ok(deficiency)
  assert.equal(deficiency.topicType, 'population_specific_note')
  assert.match(deficiency.findingTextNormalized, /pre-existing B12 deficiency/i)
  assert.match(deficiency.findingTextNormalized, /did not improve cognition.*without pre-existing deficiency/i)

  const pediatric = records.find(item => item.sourceId === 'src_pubmed-42227307')
  assert.ok(pediatric)
  assert.match(pediatric.populationContext, /children younger than 12 years/i)
  assert.match(pediatric.findingTextNormalized, /little to no effect on cognitive function, growth, development, or anemia/i)

  const recentNull = records.find(item => item.sourceId === 'src_pubmed-39655146')
  assert.ok(recentNull)
  assert.equal(recentNull.topicType, 'unsupported_or_unclear_use')
  assert.match(recentNull.findingTextNormalized, /no significant effect.*cognitive memory/i)
  assert.match(recentNull.findingTextNormalized, /depressive symptoms/i)
  assert.match(recentNull.uncertaintyNote, /do not negate treatment of documented vitamin B12 deficiency/i)
})

test('Cobalamin governed and runtime output fail closed instead of inheriting permissive placeholders', () => {
  const row = governed.find(item => item.entityType === 'compound' && item.entitySlug === 'cobalamin')
  assert.ok(row)
  assert.deepEqual(new Set(row.researchEnrichment.sourceRegistryIds), new Set(SOURCE_IDS))
  assert.equal(row.researchEnrichment.supportedUses.length, 0)
  assert.equal(row.researchEnrichment.dosageContextNotes.length, 0)
  assert.ok(row.researchEnrichment.unsupportedOrUnclearUses.length >= 2)
  assert.ok(row.researchEnrichment.populationSpecificNotes.length >= 2)
  assert.ok(row.researchEnrichment.conflictNotes.length >= 1)

  assert.equal(detail.dosage ?? '', '')
  assert.equal(detail.typical_dosage ?? '', '')
  assert.equal(detail.governance?.recommendationAllowed, false)
  assert.equal(detail.governance?.monetizationAllowed, false)
  assert.equal(detail.governance?.indexingAllowed, false)
  assert.equal(detail.governance?.requiresHumanReview, true)
  assert.equal(detail.evidence?.sourceCount, 5)
  assert.deepEqual(new Set(detail.evidence?.sourceIds || []), new Set(SOURCE_IDS))

  const serialized = JSON.stringify(aiEntity)
  assert.match(serialized, /deficien/i)
  assert.match(serialized, /cognit/i)
  assert.doesNotMatch(serialized, /capsule or softgel/i)
})

test('all five targeted Session C cobalamin findings are terminally promoted', () => {
  const bySubmission = new Map(attestations.entries.map(item => [item.submissionId, item]))
  for (const submissionId of SUBMISSION_IDS) {
    assert.equal(bySubmission.get(submissionId)?.promotionStatus, 'promoted')
    assert.equal(bySubmission.get(submissionId)?.attestation?.confidence, 'high')
  }

  const report = buildSessionBootstrap({ root: process.cwd(), sessionId: 'C', manifest })
  const candidate = report.candidates.find(item => item.workpackId === 'wp_compound_cobalamin')
  assert.ok(candidate)
  assert.equal(candidate.findingCount, 5)
  assert.equal(candidate.pendingFindings, 0)
  assert.equal(candidate.promotedFindings, 5)
  assert.equal(candidate.completed, true)
  assert.equal(candidate.closureState, 'terminal_with_promotion')
})

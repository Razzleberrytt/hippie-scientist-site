import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSessionBootstrap } from '../../enrichment-pipeline/lib/session-bootstrap.mjs'

const PROMOTED_SOURCE_IDS = [
  'src_pubmed-10334745',
  'src_pubmed-38684926',
  'src_pubmed-31928364',
  'src_pubmed-35851507',
  'src_pubmed-37447150',
]
const PROMOTED_SUBMISSION_IDS = [
  'sub_f-b6-pms-quality-limited-benefit',
  'sub_f-b6-pms-recent-review-bias-limit',
  'sub_f-b6-80mg-comparator-pilot',
  'sub_f-b6-high-dose-anxiety-experimental',
  'sub_f-b6-neuropathy-safety-systematic-review',
]
const NOT_PROMOTED_SUBMISSION_ID = 'sub_f-b6-prolonged-high-dose-neuropathy-warning'

const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const normalized = fs.readFileSync('public/data/enrichment-normalized.jsonl', 'utf8').trim().split(/\r?\n/u).map(line => JSON.parse(line))
const attestations = JSON.parse(fs.readFileSync('ops/enrichment-semantic-attestations.json', 'utf8'))
const detail = JSON.parse(fs.readFileSync('public/data/compounds-detail/vitamin-b6.json', 'utf8'))
const aiEntity = JSON.parse(fs.readFileSync('public/data/ai-entities/compound/vitamin-b6.json', 'utf8'))
const manifest = JSON.parse(fs.readFileSync('ops/research-sessions/session-manifest.json', 'utf8'))

test('Vitamin B6 closure registers five proposition-compatible sources and calibrated claims', () => {
  const byId = new Map(registry.map(item => [item.sourceId, item]))
  for (const sourceId of PROMOTED_SOURCE_IDS) assert.equal(byId.get(sourceId)?.active, true, sourceId)
  assert.equal(byId.has('src_pubmed-25137514'), false)

  const records = normalized.filter(item => item.entityType === 'compound' && item.entitySlug === 'vitamin-b6')
  assert.equal(records.length, 5)
  assert.equal(records.some(item => item.topicType === 'dosage_context'), false)
  assert.ok(records.some(item => item.topicType === 'conflict_note'))
  assert.ok(records.some(item => item.topicType === 'unsupported_or_unclear_use'))
  assert.equal(records.filter(item => item.topicType === 'adverse_effect').length, 1)
  assert.equal(records.some(item => item.sourceId === 'src_pubmed-25137514'), false)

  const neuropathy = records.find(item => item.sourceId === 'src_pubmed-37447150')
  assert.ok(neuropathy)
  assert.match(neuropathy.findingTextNormalized, /sensory.*axonal.*neuropathy/i)
  assert.match(neuropathy.findingTextNormalized, /therapeutic role.*cannot be confirmed/i)

  const anxiety = records.find(item => item.sourceId === 'src_pubmed-35851507')
  assert.ok(anxiety)
  assert.match(anxiety.usageContext, /100 mg/i)
  assert.match(anxiety.uncertaintyNote, /not.*anxiety-disorder treatment/i)
})

test('Vitamin B6 public/runtime record fails closed instead of retaining Grade A or placeholder dose semantics', () => {
  assert.doesNotMatch(detail.summary, /Grade A/i)
  assert.doesNotMatch(detail.description, /high confidence/i)
  assert.equal(detail.dosage ?? '', '')
  assert.equal(detail.typical_dosage ?? '', '')
  assert.equal(detail.governance?.recommendationAllowed, false)
  assert.equal(detail.governance?.monetizationAllowed, false)
  assert.equal(detail.governance?.requiresHumanReview, true)
  assert.equal(detail.evidence?.sourceCount, 5)
  assert.deepEqual(new Set(detail.evidence?.sourceIds || []), new Set(PROMOTED_SOURCE_IDS))

  const serialized = JSON.stringify(aiEntity)
  assert.doesNotMatch(serialized, /Grade A/i)
  assert.match(serialized, /peripheral neuropathy/i)
  assert.match(serialized, /37447150/)
})

test('all six staged Session F Vitamin B6 findings reach a terminal governed disposition', () => {
  const bySubmission = new Map(attestations.entries.map(item => [item.submissionId, item]))
  for (const submissionId of PROMOTED_SUBMISSION_IDS) assert.equal(bySubmission.get(submissionId)?.promotionStatus, 'promoted')
  assert.equal(bySubmission.get(NOT_PROMOTED_SUBMISSION_ID)?.promotionStatus, 'not_promoted')

  const report = buildSessionBootstrap({ root: process.cwd(), sessionId: 'F', manifest })
  const candidate = report.candidates.find(item => item.workpackId === 'wp_compound_vitamin_b6')
  assert.ok(candidate)
  assert.equal(candidate.completed, true)
  assert.equal(candidate.pendingFindings, 0)
  assert.equal(candidate.closureState, 'terminal_with_promotion')
  assert.equal(candidate.findingCount, 6)
  assert.equal(candidate.promotedFindings, 5)
  assert.equal(candidate.outcomes.not_promoted, 1)
})

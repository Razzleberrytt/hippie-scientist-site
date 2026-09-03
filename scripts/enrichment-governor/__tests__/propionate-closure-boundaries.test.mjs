import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSessionBootstrap } from '../../enrichment-pipeline/lib/session-bootstrap.mjs'

const SOURCE_IDS = new Set([
  'src_pubmed-29134744',
  'src_pubmed-34312159',
  'src_pubmed-40663640',
])
const SUBMISSION_IDS = [
  'sub_e-propionate-acute-energy-surrogate',
  'sub_e-propionate-counterregulatory-signal',
  'sub_e-propionate-ipe-weight-null',
  'sub_e-propionate-form-delivery-firewall',
]

const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const normalized = fs
  .readFileSync('public/data/enrichment-normalized.jsonl', 'utf8')
  .trim()
  .split(/\r?\n/u)
  .map(line => JSON.parse(line))
const governed = JSON.parse(fs.readFileSync('public/data/enrichment-governed.json', 'utf8'))
const attestations = JSON.parse(fs.readFileSync('ops/enrichment-semantic-attestations.json', 'utf8'))
const manifest = JSON.parse(fs.readFileSync('ops/research-sessions/session-manifest.json', 'utf8'))

test('Propionate closure registers exact source identities and calibrated canonical findings', () => {
  const sources = registry.filter(item => SOURCE_IDS.has(item.sourceId))
  assert.equal(sources.length, 3)
  assert.deepEqual(new Set(sources.map(item => item.pmid)), new Set(['29134744', '34312159', '40663640']))
  assert.deepEqual(
    new Set(sources.map(item => item.doi)),
    new Set(['10.1111/dom.13159', '10.1136/bmjdrc-2021-002336', '10.3310/GKWP5267']),
  )
  assert.ok(sources.every(item => item.sourceClass === 'randomized-human-trial'))
  assert.ok(sources.every(item => item.studyDesign === 'randomized-controlled-trial'))

  const records = normalized.filter(item => item.entityType === 'compound' && item.entitySlug === 'propionate')
  assert.equal(records.length, 4)
  assert.equal(records.some(item => item.topicType === 'supported_use'), false)
  assert.equal(records.some(item => item.topicType === 'dosage_context'), false)

  const acute = records.find(item => item.sourceId === 'src_pubmed-29134744')
  assert.ok(acute)
  assert.equal(acute.topicType, 'pathway')
  assert.equal(acute.relationType, 'observed_to_affect')
  assert.match(acute.findingTextNormalized, /acutely increased resting energy expenditure and whole-body lipid oxidation/)
  assert.match(acute.uncertaintyNote, /does not establish durable weight loss/)

  const preservative = records.find(item => item.sourceId === 'src_pubmed-34312159')
  assert.ok(preservative)
  assert.equal(preservative.topicType, 'conflict_note')
  assert.match(preservative.usageContext, /Calcium propionate 1500 mg/)
  assert.match(preservative.uncertaintyNote, /Do not generalize calcium-propionate preservative exposure/)

  const iprevent = records.filter(item => item.sourceId === 'src_pubmed-40663640')
  assert.equal(iprevent.length, 2)
  const weightNull = iprevent.find(item => item.topicType === 'unsupported_or_unclear_use')
  assert.ok(weightNull)
  assert.equal(weightNull.claimType, 'efficacy_null_or_mixed')
  assert.match(weightNull.findingTextNormalized, /did not prevent weight gain versus inulin/)
  assert.ok(iprevent.some(item => item.topicType === 'research_gap' && /not make these interventions interchangeable/.test(item.findingTextNormalized)))
})

// The lock this test exists for is that the four attested Session E findings stay
// terminally promoted and never silently regress to staged.
//
// It deliberately does NOT assert the workpack is closed. `closure_required` is the
// resting state of every workpack in the repository — propionate is the only one with
// any promoted findings at all — so staging further research legitimately reopens it.
// Asserting `completed === true` conflated "these four stayed promoted" with "nobody
// may study propionate again", and broke the moment the MS-biomarker submissions were
// staged in #4990. Promoting those newer findings is a governance act: it needs
// src_pubmed-42402345 registered and attested by a person, and until that happens the
// pipeline is right to hold them.
test('Propionate Session E promotions stay terminal as later research is staged', () => {
  const bySubmission = new Map(attestations.entries.map(item => [item.submissionId, item]))
  for (const submissionId of SUBMISSION_IDS) {
    assert.equal(bySubmission.get(submissionId)?.promotionStatus, 'promoted')
  }

  const report = buildSessionBootstrap({ root: process.cwd(), sessionId: 'E', manifest })
  const candidate = report.candidates.find(item => item.workpackId === 'wp_compound_propionate')
  assert.ok(candidate)
  assert.ok(candidate.promotedFindings >= SUBMISSION_IDS.length)
  assert.ok(candidate.terminalFindings >= SUBMISSION_IDS.length)
  assert.ok(candidate.findingCount >= candidate.terminalFindings)
  assert.equal(candidate.outcomes.promoted, candidate.promotedFindings)
})

test('governed Propionate output preserves null/conflict/form boundaries without efficacy or dose inflation', () => {
  const row = governed.find(item => item.entityType === 'compound' && item.entitySlug === 'propionate')
  assert.ok(row)
  const evidence = row.researchEnrichment

  assert.deepEqual(new Set(evidence.sourceRegistryIds), SOURCE_IDS)
  assert.equal(evidence.supportedUses.length, 0)
  assert.equal(evidence.dosageContextNotes.length, 0)
  assert.equal(evidence.adverseEffects.length, 0)
  assert.ok(evidence.unsupportedOrUnclearUses.some(item => /did not prevent weight gain versus inulin/.test(item.claim)))
  assert.ok(evidence.mechanisms.some(item => /resting energy expenditure and whole-body lipid oxidation/.test(item.claim)))
  assert.ok(evidence.conflictNotes.some(item => /counter-regulatory hormones/.test(item.claim)))
  assert.ok(evidence.researchGaps.some(item => /not make these interventions interchangeable/.test(item.claim)))
  assert.equal(evidence.editorialReadiness.publishable, true)
  assert.equal(evidence.pageEvidenceJudgment.evidenceLabel, 'mixed_or_uncertain')
})

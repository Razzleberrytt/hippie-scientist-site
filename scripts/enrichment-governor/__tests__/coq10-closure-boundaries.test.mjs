import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const SOURCE_IDS = [
  'src_pubmed-25282031',
  'src_pubmed-36091835',
  'src_pubmed-40833470',
  'src_pubmed-41294251',
  'src_pubmed-41457257',
]
const SOURCE_PMIDS = new Set(['25282031', '36091835', '40833470', '41294251', '41457257'])
const PROMOTED_SUBMISSIONS = [
  'sub_session-c-coq10-fatigue-meta-signal-20260829',
  'sub_session-c-coq10-depression-fatigue-null-20260829',
  'sub_session-c-coq10-exercise-low-certainty-20260829',
  'sub_session-e-coenzyme-q10-heart-failure-rct-20260926',
  'sub_session-e-coenzyme-q10-depression-anxiety-discordance-20260926',
]
const QUARANTINED_SUBMISSION = 'sub_session-c-coq10-wrong-source-quarantine-20260829'

const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const normalized = fs.readFileSync('public/data/enrichment-normalized.jsonl', 'utf8')
  .trim()
  .split(/\r?\n/u)
  .map(line => JSON.parse(line))
const governed = JSON.parse(fs.readFileSync('public/data/enrichment-governed.json', 'utf8'))
const attestations = JSON.parse(fs.readFileSync('ops/enrichment-semantic-attestations.json', 'utf8'))
const aliases = JSON.parse(fs.readFileSync('data/canonical/enrichment-owner-aliases.json', 'utf8'))
const detail = JSON.parse(fs.readFileSync('public/data/compounds-detail/coenzyme-q10.json', 'utf8'))
const claims = JSON.parse(fs.readFileSync('public/data/claims.json', 'utf8'))

test('CoQ10 closure registers exactly the five canonical PubMed evidence identities', () => {
  const sources = registry.filter(item => SOURCE_PMIDS.has(String(item.pmid || '')))
  assert.equal(sources.length, 5)
  assert.deepEqual(new Set(sources.map(item => item.sourceId)), new Set(SOURCE_IDS))
  assert.ok(sources.every(item => item.active === true))
  assert.ok(sources.every(item => item.evidenceClass === 'human-clinical'))
  assert.ok(sources.every(item => item.doi))

  const wrongSource = registry.find(item => String(item.pmid || '') === '25174896')
  assert.equal(wrongSource, undefined)
})

test('CoQ10 normalized evidence preserves endpoint discordance and population boundaries', () => {
  const records = normalized.filter(item => item.entityType === 'compound' && item.entitySlug === 'coenzyme-q10')
  assert.equal(records.length, 5)
  assert.equal(records.some(item => item.topicType === 'dosage_context'), false)

  const fatigue = records.find(item => item.sourceId === 'src_pubmed-36091835')
  assert.ok(fatigue)
  assert.equal(fatigue.topicType, 'supported_use')
  assert.match(fatigue.findingTextNormalized, /13 randomized controlled trials/i)
  assert.match(fatigue.uncertaintyNote, /must not be converted into an individualized dosing rule/i)

  const endpointDiscordance = records.find(item => item.sourceId === 'src_pubmed-40833470')
  assert.ok(endpointDiscordance)
  assert.equal(endpointDiscordance.topicType, 'conflict_note')
  assert.match(endpointDiscordance.findingTextNormalized, /Montgomery-Åsberg/i)
  assert.match(endpointDiscordance.findingTextNormalized, /Beck Depression Inventory.*not significant/i)
  assert.match(endpointDiscordance.findingTextNormalized, /anxiety estimate.*not significant/i)

  const depressionFatigue = records.find(item => item.sourceId === 'src_pubmed-41294251')
  assert.ok(depressionFatigue)
  assert.match(depressionFatigue.findingTextNormalized, /fatigue outcome.*not significant/i)
  assert.match(depressionFatigue.findingTextNormalized, /I²=89%/i)

  const exercise = records.find(item => item.sourceId === 'src_pubmed-41457257')
  assert.ok(exercise)
  assert.equal(exercise.topicType, 'unsupported_or_unclear_use')
  assert.match(exercise.findingTextNormalized, /increased circulating CoQ10 concentrations/i)
  assert.match(exercise.findingTextNormalized, /performance effects were small and inconsistent/i)

  const heartFailure = records.find(item => item.sourceId === 'src_pubmed-25282031')
  assert.ok(heartFailure)
  assert.equal(heartFailure.topicType, 'population_specific_note')
  assert.match(heartFailure.findingTextNormalized, /16-week.*did not significantly differ/i)
  assert.match(heartFailure.findingTextNormalized, /two-year composite major adverse cardiovascular endpoint/i)
})

test('CoQ10 governed rollup exposes the conflict instead of collapsing it into one benefit claim', () => {
  const row = governed.find(item => item.entityType === 'compound' && item.entitySlug === 'coenzyme-q10')
  assert.ok(row)
  assert.deepEqual(new Set(row.researchEnrichment.sourceRegistryIds), new Set(SOURCE_IDS))
  assert.equal(row.researchEnrichment.supportedUses.length, 1)
  assert.equal(row.researchEnrichment.unsupportedOrUnclearUses.length, 1)
  assert.equal(row.researchEnrichment.populationSpecificNotes.length, 1)
  assert.equal(row.researchEnrichment.conflictNotes.length, 2)
  assert.equal(row.researchEnrichment.dosageContextNotes.length, 0)
  assert.equal(row.researchEnrichment.pageEvidenceJudgment.evidenceLabel, 'conflicting_evidence')
  assert.equal(row.researchEnrichment.pageEvidenceJudgment.grading.conflictState, 'conflicting_evidence')
  assert.match(
    row.researchEnrichment.pageEvidenceJudgment.conflictNotes.join(' '),
    /efficacy-supporting and null\/mixed findings/i,
  )
})

test('CoQ10 canonical runtime fails closed and legacy runtime owners are gone', () => {
  assert.deepEqual(new Set(detail.evidence?.sourceIds || []), new Set(SOURCE_IDS))
  assert.equal(detail.evidence?.sourceCount, 5)
  assert.equal(detail.dosage ?? '', '')
  assert.equal(detail.typical_dosage ?? '', '')
  assert.equal(detail.governance?.recommendationAllowed, false)
  assert.equal(detail.governance?.monetizationAllowed, false)
  assert.equal(detail.governance?.indexingAllowed, false)
  assert.equal(detail.governance?.requiresHumanReview, true)
  assert.equal(detail.indexability_status, 'NOINDEX')
  assert.equal(detail.sitemap_included, false)
  assert.equal(JSON.stringify(detail).includes('25174896'), false)

  assert.equal(fs.existsSync('public/data/compounds-detail/coq10.json'), false)
  assert.equal(fs.existsSync('public/data/compounds-detail/coenzyme-q10-ubiquinol.json'), false)
  assert.equal(fs.existsSync('public/data/ai-entities/compound/coq10.json'), false)
  assert.equal(fs.existsSync('public/data/ai-entities/compound/coenzyme-q10-ubiquinol.json'), false)

  const aliasClaims = claims.filter(item => ['coq10', 'coenzyme-q10-ubiquinol'].includes(String(item.profile_slug || '')))
  assert.equal(aliasClaims.length, 0)
})

test('CoQ10 owner aliases and terminal dispositions preserve one canonical scientific owner', () => {
  assert.equal(aliases.compounds?.coq10, 'coenzyme-q10')
  assert.equal(aliases.compounds?.['coenzyme-q10-ubiquinol'], 'coenzyme-q10')

  const bySubmission = new Map(attestations.entries.map(item => [item.submissionId, item]))
  for (const submissionId of PROMOTED_SUBMISSIONS) {
    assert.equal(bySubmission.get(submissionId)?.promotionStatus, 'promoted')
    assert.equal(bySubmission.get(submissionId)?.attestation?.confidence, 'high')
  }
  assert.equal(bySubmission.get(QUARANTINED_SUBMISSION)?.promotionStatus, 'quarantined')
  assert.equal(bySubmission.get(QUARANTINED_SUBMISSION)?.attestation?.confidence, 'high')
})

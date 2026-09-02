import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSessionBootstrap } from '../../enrichment-pipeline/lib/session-bootstrap.mjs'

const SOURCE_ID = 'src_iarc-v134-methyleugenol-2024'
const SUBMISSION_IDS = [
  'sub_d-methyl-eugenol-iarc-group2a',
  'sub_d-methyl-eugenol-exposure-context-firewall',
]

const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const normalized = fs
  .readFileSync('public/data/enrichment-normalized.jsonl', 'utf8')
  .trim()
  .split(/\r?\n/u)
  .map(line => JSON.parse(line))
const attestations = JSON.parse(fs.readFileSync('ops/enrichment-semantic-attestations.json', 'utf8'))
const manifest = JSON.parse(fs.readFileSync('ops/research-sessions/session-manifest.json', 'utf8'))

test('methyleugenol closure preserves IARC hazard and human-evidence limits', () => {
  const source = registry.find(item => item.sourceId === SOURCE_ID)
  assert.ok(source)
  assert.equal(source.organization, 'International Agency for Research on Cancer')
  assert.equal(source.evidenceClass, 'regulatory-monograph')
  assert.equal(source.reliabilityTier, 'tier-a')
  assert.match(source.notes, /Group 2A/)
  assert.match(source.notes, /evidence regarding cancer in humans is inadequate/)

  const records = normalized.filter(item => item.entityType === 'compound' && item.entitySlug === 'methyl-eugenol')
  assert.equal(records.length, 2)
  assert.equal(records.some(item => item.topicType === 'supported_use'), false)
  assert.equal(records.some(item => item.topicType === 'dosage_context'), false)

  const hazard = records.find(item => item.topicType === 'adverse_effect')
  assert.ok(hazard)
  assert.equal(hazard.claimType, 'safety_risk')
  assert.equal(hazard.severityLabel, 'high')
  assert.match(hazard.findingTextNormalized, /probably carcinogenic to humans \(Group 2A\)/)
  assert.match(hazard.findingTextNormalized, /evidence regarding cancer in humans is inadequate/)
  assert.match(hazard.uncertaintyNote, /does not by itself quantify risk/)

  const exposure = records.find(item => item.topicType === 'research_gap')
  assert.ok(exposure)
  assert.match(exposure.findingTextNormalized, /occurs naturally in essential oils/)
  assert.match(exposure.findingTextNormalized, /prohibited in the United States and European Union/)
  assert.match(exposure.findingTextNormalized, /require separate exposure propositions/)
})

test('Session D methyl-eugenol staged findings are terminally promoted', () => {
  const bySubmission = new Map(attestations.entries.map(item => [item.submissionId, item]))
  for (const submissionId of SUBMISSION_IDS) {
    assert.equal(bySubmission.get(submissionId)?.promotionStatus, 'promoted')
  }

  const report = buildSessionBootstrap({ root: process.cwd(), sessionId: 'D', manifest })
  const candidate = report.candidates.find(item => item.workpackId === 'wp_compound_methyl_eugenol')
  assert.ok(candidate)
  assert.equal(candidate.completed, true)
  assert.equal(candidate.pendingFindings, 0)
  assert.equal(candidate.closureState, 'terminal_with_promotion')
  assert.ok(candidate.promotedFindings >= 2)
})

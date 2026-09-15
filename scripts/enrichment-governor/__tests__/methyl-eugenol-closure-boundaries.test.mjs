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
const normalized = fs.readFileSync('public/data/enrichment-normalized.jsonl', 'utf8').trim().split(/\r?\n/u).map(line => JSON.parse(line))
const governed = JSON.parse(fs.readFileSync('public/data/enrichment-governed.json', 'utf8'))
const attestations = JSON.parse(fs.readFileSync('ops/enrichment-semantic-attestations.json', 'utf8'))
const manifest = JSON.parse(fs.readFileSync('ops/research-sessions/session-manifest.json', 'utf8'))
const profile = JSON.parse(fs.readFileSync('public/data/compounds-detail/methyl-eugenol.json', 'utf8'))

test('Methyl eugenol closure admits the exact IARC authority without DOI substitution', () => {
  const source = registry.find(item => item.sourceId === SOURCE_ID)
  assert.ok(source)
  assert.equal(source.organization, 'International Agency for Research on Cancer')
  assert.equal(source.monographId, 'IARC Monographs Volume 134')
  assert.equal(source.sourceClass, 'regulatory-agency-monograph-guidance')
  assert.equal(source.evidenceClass, 'regulatory-monograph')
  assert.equal(source.reliabilityTier, 'tier-a')
  assert.equal(source.active, true)
  assert.match(source.canonicalUrl, /^https:\/\/monographs\.iarc\.who\.int\//u)
  assert.equal('doi' in source, false)
})

test('Methyl eugenol canonical evidence preserves hazard, human-evidence, and exposure boundaries', () => {
  const records = normalized.filter(item => item.entityType === 'compound' && item.entitySlug === 'methyl-eugenol')
  assert.equal(records.length, 2)
  assert.equal(records.some(item => item.topicType === 'supported_use'), false)
  assert.equal(records.some(item => item.topicType === 'dosage_context'), false)

  const hazard = records.find(item => item.topicType === 'adverse_effect')
  assert.ok(hazard)
  assert.match(hazard.findingTextNormalized, /probably carcinogenic to humans \(Group 2A\)/u)
  assert.match(hazard.findingTextNormalized, /evidence regarding cancer in humans is inadequate/u)
  assert.match(hazard.uncertaintyNote, /does not by itself quantify risk/u)

  const exposure = records.find(item => item.topicType === 'research_gap')
  assert.ok(exposure)
  assert.match(exposure.findingTextNormalized, /Natural occurrence, background dietary exposure/u)
  assert.match(exposure.uncertaintyNote, /Do not infer that ordinary background exposure has the same quantitative risk/u)
})

test('Session D dispositions are terminal and the public record remains fail-closed', () => {
  const bySubmission = new Map(attestations.entries.map(item => [item.submissionId, item]))
  for (const submissionId of SUBMISSION_IDS) {
    assert.equal(bySubmission.get(submissionId)?.promotionStatus, 'promoted')
    assert.equal(bySubmission.get(submissionId)?.attestation?.confidence, 'high')
  }

  const report = buildSessionBootstrap({ root: process.cwd(), sessionId: 'D', manifest })
  const workpack = report.candidates.find(item => item.workpackId === 'wp_compound_methyl_eugenol')
  assert.ok(workpack)
  assert.equal(workpack.pendingFindings, 0)
  assert.equal(workpack.promotedFindings, 2)
  assert.equal(workpack.completed, true)

  const row = governed.find(item => item.entityType === 'compound' && item.entitySlug === 'methyl-eugenol')
  assert.ok(row)
  assert.deepEqual(row.researchEnrichment.sourceRegistryIds, [SOURCE_ID])
  assert.equal(row.researchEnrichment.supportedUses.length, 0)
  assert.equal(row.researchEnrichment.dosageContextNotes.length, 0)
  assert.ok(row.researchEnrichment.adverseEffects.some(item => /Group 2A/u.test(item.claim)))
  assert.ok(row.researchEnrichment.researchGaps.some(item => /not interchangeable/u.test(item.claim)))

  assert.equal(profile.governance.medicalRisk, 'high')
  assert.equal(profile.governance.monetizationAllowed, false)
  assert.equal(profile.governance.recommendationAllowed, false)
  assert.equal(profile.governance.requiresHumanReview, true)
  assert.equal(profile.indexability_status, 'NOINDEX')
  assert.equal(profile.dosage, '')
  assert.equal(profile.typical_dosage, '')
})

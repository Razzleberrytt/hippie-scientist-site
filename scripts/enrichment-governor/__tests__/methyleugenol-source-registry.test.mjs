import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const SOURCE_ID = 'src_iarc-v134-methyleugenol-2024'
const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const fragment = JSON.parse(
  fs.readFileSync(
    'ops/enrichment-submissions/sessions/session-d/2026-08-30-methyl-eugenol-carcinogenic-hazard.json',
    'utf8',
  ),
)

test('methyleugenol IARC source identity stays pinned to Volume 134 authority metadata', () => {
  const source = registry.find(item => item.sourceId === SOURCE_ID)
  assert.ok(source)
  assert.equal(source.sourceType, 'monograph')
  assert.equal(source.sourceClass, 'regulatory-agency-monograph-guidance')
  assert.equal(source.organization, 'International Agency for Research on Cancer')
  assert.equal(source.publicationYear, 2024)
  assert.equal(source.monographId, 'IARC Monographs Volume 134')
  assert.equal(source.canonicalUrl, 'https://publications.iarc.who.int/627')
  assert.equal(source.evidenceClass, 'regulatory-monograph')
  assert.equal(source.studyDesign, 'regulatory-guidance')
  assert.equal(source.publicationStatus, 'published')
  assert.equal(source.reliabilityTier, 'tier-a')
  assert.equal(source.active, true)
})

test('Session D methyleugenol findings stay attached to the exact IARC source and preserve hazard boundaries', () => {
  assert.equal(fragment.sessionId, 'D')
  assert.equal(fragment.shard, 3)
  assert.equal(fragment.submissions.length, 2)
  assert.ok(fragment.submissions.every(item => item.sourceId === SOURCE_ID))

  const hazard = fragment.submissions.find(item => item.submissionId === 'sub_d-methyl-eugenol-iarc-group2a')
  assert.ok(hazard)
  assert.match(hazard.findingTextNormalized, /probably carcinogenic to humans/i)
  assert.match(hazard.findingTextNormalized, /sufficient evidence.*experimental animals/i)
  assert.match(hazard.findingTextNormalized, /strong mechanistic evidence/i)
  assert.match(hazard.findingTextNormalized, /inadequate/i)

  const exposure = fragment.submissions.find(
    item => item.submissionId === 'sub_d-methyl-eugenol-exposure-context-firewall',
  )
  assert.ok(exposure)
  assert.match(exposure.findingTextNormalized, /food|foods|consumer/i)
  assert.match(exposure.findingTextNormalized, /concentrated|isolated/i)
})

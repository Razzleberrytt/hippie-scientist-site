import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const SOURCE_ID = 'src_pubmed-42402345'
const registry = JSON.parse(fs.readFileSync('public/data/source-registry.json', 'utf8'))
const fragment = JSON.parse(
  fs.readFileSync(
    'ops/enrichment-submissions/sessions/session-e/2026-08-31-propionate-ms-biomarker-boundary.json',
    'utf8',
  ),
)

test('propionic-acid MS source identity stays pinned to the exact 2026 phase-2b trial', () => {
  const source = registry.find(item => item.sourceId === SOURCE_ID)
  assert.ok(source)
  assert.equal(source.sourceType, 'journal-article')
  assert.equal(source.sourceClass, 'randomized-human-trial')
  assert.equal(source.publicationYear, 2026)
  assert.equal(source.pmid, '42402345')
  assert.equal(source.doi, '10.1093/brain/awag099')
  assert.equal(source.canonicalUrl, 'https://pubmed.ncbi.nlm.nih.gov/42402345/')
  assert.equal(source.evidenceClass, 'human-clinical')
  assert.equal(source.studyDesign, 'randomized-controlled-trial')
  assert.equal(source.publicationStatus, 'published')
  assert.equal(source.reliabilityTier, 'tier-b')
  assert.equal(source.active, true)
})

test('Session E MS findings preserve biomarker, clinical-outcome, formulation, and safety ceilings', () => {
  assert.equal(fragment.sessionId, 'E')
  assert.equal(fragment.shard, 4)
  assert.equal(fragment.submissions.length, 3)
  assert.ok(fragment.submissions.every(item => item.sourceId === SOURCE_ID))

  const biomarker = fragment.submissions.find(
    item => item.submissionId === 'sub_e-propionate-ms-snfl-biomarker-signal',
  )
  assert.ok(biomarker)
  assert.match(biomarker.findingTextNormalized, /serum neurofilament light chain/i)
  assert.match(biomarker.findingTextNormalized, /500 mg twice daily/i)
  assert.match(biomarker.findingTextNormalized, /90 days/i)
  assert.match(biomarker.findingTextNormalized, /does not establish relapse prevention/i)
  assert.match(biomarker.usageContext, /not sodium\/calcium propionate/i)

  const secondary = fragment.submissions.find(
    item => item.submissionId === 'sub_e-propionate-ms-secondary-outcome-ceiling',
  )
  assert.ok(secondary)
  assert.match(secondary.findingTextNormalized, /trend toward improvement in motor fatigue/i)
  assert.match(secondary.findingTextNormalized, /must therefore remain separate/i)

  const safety = fragment.submissions.find(
    item => item.submissionId === 'sub_e-propionate-ms-shortterm-safety-ceiling',
  )
  assert.ok(safety)
  assert.match(safety.findingTextNormalized, /no serious adverse events related to study medication/i)
  assert.match(safety.findingTextNormalized, /cannot establish long-term safety/i)
  assert.match(safety.safetyContext, /must not be converted into long-term safety assurance/i)
})

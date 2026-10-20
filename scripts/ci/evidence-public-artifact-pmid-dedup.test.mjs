import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => JSON.parse(readFileSync(path, 'utf8'))
const claims = read('public/data/claims.json')
const cases = [
  { kind: 'herbs', slug: 'black-seed', pmid: '26875640', authored: 'a', studyCount: 4 },
  { kind: 'compounds', slug: 'plant-sterols', pmid: '24780090', authored: 'high', studyCount: 1 },
  { kind: 'compounds', slug: 'zinc', pmid: '15496046', authored: 'high', studyCount: 2 },
]

test('duplicated PubMed identities cannot retain inflated Grade A in committed public artifacts', () => {
 for (const { kind, slug, pmid, authored, studyCount } of cases) {
  const list = read('public/data/' + kind + '.json').find((row) => row.slug === slug)
  const detail = read('public/data/' + kind + '-detail/' + slug + '.json')
  assert.ok(list, 'missing index ' + slug)
  assert.equal(detail.slug, slug)
  const claimCopies = claims.filter((claim) => claim.profile_slug === slug && String(claim.pmid) === pmid)
  const sourceCopies = (detail.sources || []).filter((source) => String(source.pmid ?? source.pubmedId) === pmid)
  assert.ok(claimCopies.length > 0 && sourceCopies.length > 0, 'missing recorded shared publication ' + slug)
  for (const entry of [list, detail]) {
   assert.equal(entry.evidence_grade, null, slug + ' must not have settled Grade A')
   assert.equal(entry.evidence_grade_source, authored, slug + ' must preserve authored source grade')
   assert.equal(entry.evidence_grade_backed, false)
   assert.equal(entry.evidence_grade_backing_gap, 'single-human-study-for-grade-a')
   assert.equal(entry.evidence_human_study_count, 1)
   assert.equal(entry.evidence_recorded_study_count, studyCount)
   assert.equal(entry.evidence_grade_band, null)
   assert.equal(entry.evidence_grade_adjusted, true)
   for (const field of ['evidence_tier', 'evidenceLevel', 'evidenceTier']) {
    assert.equal(entry[field], 'Editorial grade not demonstrated by recorded studies')
   }
  }
 }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { verifyCanaries } from '../canary.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..', '..')
const anchors = ['ashwagandha', 'matricaria-chamomilla', 'piper-methysticum', 'cannabidiol', 'luteolin']
const herbAnchors = new Set(['ashwagandha', 'matricaria-chamomilla', 'piper-methysticum'])

function entry(slug, suffix, overrides = {}) {
  return {
    enrichmentId: `enr_${slug}-${suffix}`,
    entityType: herbAnchors.has(slug) ? 'herb' : 'compound',
    entitySlug: slug,
    sourceId: `src_${slug}-${suffix}`,
    claimType: 'efficacy_signal',
    evidenceClass: 'human-clinical',
    topicType: 'supported_use',
    findingTextShort: 'A sufficiently specific source-backed finding.',
    findingTextNormalized: 'A sufficiently specific normalized source-backed finding for the canary regression fixture.',
    reviewer: 'governor-test',
    active: true,
    editorialStatus: 'approved',
    reviewedAt: new Date().toISOString(),
    ...overrides,
  }
}

function completeEntries() {
  return anchors.flatMap(slug => [
    entry(slug, 'efficacy'),
    entry(slug, 'null', { claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use' }),
    entry(slug, 'safety', { claimType: 'safety_risk', topicType: 'adverse_effect' }),
  ])
}

function baselineDebtEntries() {
  return [
    entry('ashwagandha', 'efficacy', { sourceId: 'src_pubmed-31517876' }),
    entry('ashwagandha', 'safety', { sourceId: 'src_pubmed-31517876', claimType: 'safety_risk', topicType: 'adverse_effect', evidenceClass: 'human-clinical' }),
    entry('matricaria-chamomilla', 'safety', { sourceId: 'src_pubmed-31006899', claimType: 'safety_risk', topicType: 'adverse_effect' }),
    entry('matricaria-chamomilla', 'null', { sourceId: 'src_pubmed-31006899', claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use' }),
    entry('piper-methysticum', 'safety', { sourceId: 'src_cochrane-cd003383', claimType: 'safety_risk', topicType: 'condition_caution' }),
    entry('piper-methysticum', 'conflict', { sourceId: 'src_cochrane-cd003383', claimType: 'evidence_conflict', topicType: 'conflict_note' }),
    entry('cannabidiol', 'safety', { sourceId: 'src_fda-epidiolex-label-2021', claimType: 'safety_risk', topicType: 'medication_class_caution', evidenceClass: 'regulatory-monograph' }),
    entry('cannabidiol', 'gap', { sourceId: 'src_pubmed-40622698', claimType: 'research_gap', topicType: 'research_gap' }),
    entry('luteolin', 'null', { sourceId: 'src_pubmed-29801717', claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use', evidenceClass: 'preclinical-mechanistic' }),
  ]
}

test('required canary checks block missing source linkage and schema validity', () => {
  const entries = completeEntries()
  entries.find(row => row.entitySlug === 'ashwagandha').sourceId = ''
  const registry = completeEntries().map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.some(value => value.includes('ashwagandha:required_check_failed:source_linkage')))
  assert.ok(result.blockers.some(value => value.includes('ashwagandha:required_check_failed:schema_validity')))
})

test('real normalized-entry schema rejects an invalid enum value', () => {
  const entries = completeEntries()
  entries.find(row => row.entitySlug === 'ashwagandha').entityType = 'plant'
  const registry = entries.map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('ashwagandha:required_check_failed:schema_validity'))
})

test('inactive evidence cannot satisfy a required canary', () => {
  const entries = completeEntries()
  const chamomileSafety = entries.find(row => row.entitySlug === 'matricaria-chamomilla' && row.claimType === 'safety_risk')
  chamomileSafety.active = false
  const registry = entries.map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('matricaria-chamomilla:anchor_requirement_failed:safety_visibility'))
  assert.equal(result.excludedEntryCount, 1)
})

test('unapproved evidence cannot satisfy a required canary', () => {
  const entries = completeEntries()
  const kavaNull = entries.find(row => row.entitySlug === 'piper-methysticum' && row.claimType === 'efficacy_null_or_mixed')
  kavaNull.editorialStatus = 'needs_review'
  const registry = entries.map(row => ({ sourceId: row.sourceId }))
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('piper-methysticum:anchor_requirement_failed:null_visibility'))
  assert.equal(result.excludedEntryCount, 1)
})

test('known baseline debt remains visible without being mislabeled as clean', () => {
  const entries = baselineDebtEntries()
  const result = verifyCanaries(entries, [])
  assert.equal(result.pass, true, JSON.stringify(result, null, 2))
  assert.equal(result.idealPass, false)
  assert.equal(result.status, 'PASS_WITH_BASELINE_DEBT')
  assert.deepEqual(result.debt.unresolvedSourceIds, [
    'src_cochrane-cd003383',
    'src_fda-epidiolex-label-2021',
    'src_pubmed-29801717',
    'src_pubmed-31006899',
    'src_pubmed-31517876',
    'src_pubmed-40622698',
  ])
  assert.deepEqual(result.debt.missingNullVisibilityAnchors, ['ashwagandha'])
  assert.deepEqual(result.debt.missingSafetyVisibilityAnchors, ['luteolin'])
  assert.deepEqual(result.debt.unexpectedUnresolvedSourceIds, [])
})

test('ashwagandha safety canary stays on the ashwagandha RCT and rejects the CBD label', () => {
  const entries = baselineDebtEntries()
  const safety = entries.find(row => row.entitySlug === 'ashwagandha' && row.topicType === 'adverse_effect')
  assert.equal(safety.sourceId, 'src_pubmed-31517876')

  safety.sourceId = 'src_fda-epidiolex-label-2021'
  const result = verifyCanaries(entries, [])
  assert.equal(result.pass, false, JSON.stringify(result, null, 2))
  assert.ok(result.blockers.some(value => value.includes('ashwagandha') && value.includes('provenance')))
})

test('canary ratchet blocks a new unresolved source even when total debt count does not grow', () => {
  const entries = baselineDebtEntries().map(row => row.sourceId === 'src_pubmed-31517876' ? { ...row, sourceId: 'src_new-source' } : row)
  const result = verifyCanaries(entries, [])
  assert.equal(result.debt.unresolvedSourceIds.length, 6)
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('new_provenance_debt:unresolved_source:src_new-source'))
})

test('changed normalized rows reference real canonical detail entities without requiring source registry readiness', () => {
  const normalizedPath = path.join(repoRoot, 'public', 'data', 'enrichment-normalized.jsonl')
  const rows = fs.readFileSync(normalizedPath, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => JSON.parse(line))

  const expected = new Map([
    ['enr_chamomile-supported-use-anxiety-review', ['herb', 'matricaria-chamomilla']],
    ['enr_chamomile-unsupported-remission', ['herb', 'matricaria-chamomilla']],
    ['enr_chamomile-adverse-effect-sedation', ['herb', 'matricaria-chamomilla']],
    ['enr_kava-supported-use-anxiety-review', ['herb', 'piper-methysticum']],
    ['enr_kava-conflict-hepatotoxicity-note', ['herb', 'piper-methysticum']],
    ['enr_kava-condition-caution-liver-disease', ['herb', 'piper-methysticum']],
    ['enr_cbd-medication-class-caution-cns-depressants', ['compound', 'cannabidiol']],
    ['enr_cbd-enzyme-cyp2c19', ['compound', 'cannabidiol']],
    ['enr_cbd-adverse-effect-transaminase', ['compound', 'cannabidiol']],
    ['enr_cbd-research-gap-non-epilepsy', ['compound', 'cannabidiol']],
  ])

  for (const [enrichmentId, [entityType, entitySlug]] of expected) {
    const row = rows.find(candidate => candidate.enrichmentId === enrichmentId)
    assert.ok(row, `missing normalized row ${enrichmentId}`)
    assert.equal(row.entityType, entityType, `${enrichmentId} entityType`)
    assert.equal(row.entitySlug, entitySlug, `${enrichmentId} entitySlug`)

    const detailDir = entityType === 'herb' ? 'herbs-detail' : 'compounds-detail'
    const detailPath = path.join(repoRoot, 'public', 'data', detailDir, `${entitySlug}.json`)
    assert.equal(fs.existsSync(detailPath), true, `${enrichmentId} missing canonical detail file ${detailPath}`)
  }
})

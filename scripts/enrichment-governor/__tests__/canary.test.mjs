import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { verifyCanaries } from '../canary.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..', '..')
const anchors = ['ashwagandha', 'chamomile', 'kava', 'cbd', 'luteolin']
const canonical = {
  ashwagandha: { entityType: 'herb', entitySlug: 'ashwagandha' },
  chamomile: { entityType: 'herb', entitySlug: 'matricaria-chamomilla' },
  kava: { entityType: 'herb', entitySlug: 'piper-methysticum' },
  cbd: { entityType: 'compound', entitySlug: 'cannabidiol' },
  luteolin: { entityType: 'compound', entitySlug: 'luteolin' },
}

const expectedUnresolvedWithoutRegistry = [
  'src_cochrane-cd003383',
  'src_fda-epidiolex-label-2021',
  'src_pubmed-23348842',
  'src_pubmed-29801717',
  'src_pubmed-31006899',
  'src_pubmed-31517876',
  'src_pubmed-40622698',
]

function entry(anchor, suffix, overrides = {}) {
  const identity = canonical[anchor]
  return {
    enrichmentId: `enr_${anchor}-${suffix}`,
    entityType: identity.entityType,
    entitySlug: identity.entitySlug,
    sourceId: `src_${anchor}-${suffix}`,
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
  return anchors.flatMap(anchor => [
    entry(anchor, 'efficacy'),
    entry(anchor, 'null', { claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use' }),
    entry(anchor, 'safety', { claimType: 'safety_risk', topicType: 'adverse_effect' }),
  ])
}

function registryFor(entries) {
  return [...new Set(entries.map(row => row.sourceId).filter(Boolean))].map(sourceId => ({
    sourceId,
    active: true,
    publicationStatus: 'published',
  }))
}

function baselineDebtEntries() {
  return [
    entry('ashwagandha', 'efficacy', { sourceId: 'src_pubmed-31517876' }),
    entry('ashwagandha', 'safety', { sourceId: 'src_pubmed-31517876', claimType: 'safety_risk', topicType: 'adverse_effect', evidenceClass: 'human-clinical' }),
    entry('chamomile', 'safety', { sourceId: 'src_pubmed-31006899', claimType: 'safety_risk', topicType: 'adverse_effect' }),
    entry('chamomile', 'null', { sourceId: 'src_pubmed-31006899', claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use' }),
    entry('kava', 'safety', { sourceId: 'src_pubmed-23348842', claimType: 'safety_risk', topicType: 'adverse_effect' }),
    entry('kava', 'conflict', { sourceId: 'src_cochrane-cd003383', claimType: 'evidence_conflict', topicType: 'conflict_note' }),
    entry('cbd', 'safety', { sourceId: 'src_fda-epidiolex-label-2021', claimType: 'safety_risk', topicType: 'medication_class_caution', evidenceClass: 'regulatory-monograph' }),
    entry('cbd', 'gap', { sourceId: 'src_pubmed-40622698', claimType: 'research_gap', topicType: 'research_gap' }),
    entry('luteolin', 'null', { sourceId: 'src_pubmed-29801717', claimType: 'efficacy_null_or_mixed', topicType: 'unsupported_or_unclear_use', evidenceClass: 'preclinical-mechanistic' }),
  ]
}

test('required canary checks block missing source linkage and schema validity', () => {
  const entries = completeEntries()
  entries.find(row => row.entitySlug === 'ashwagandha').sourceId = ''
  const result = verifyCanaries(entries, registryFor(entries))
  assert.equal(result.pass, false)
  assert.ok(result.blockers.some(value => value.includes('ashwagandha:required_check_failed:source_linkage')))
  assert.ok(result.blockers.some(value => value.includes('ashwagandha:required_check_failed:schema_validity')))
})

test('real normalized-entry schema rejects an invalid enum value while retaining canonical anchor identity', () => {
  const entries = completeEntries()
  entries.find(row => row.entitySlug === 'ashwagandha').evidenceClass = 'not-a-real-evidence-class'
  const result = verifyCanaries(entries, registryFor(entries))
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('ashwagandha:required_check_failed:schema_validity'))
})

test('inactive evidence cannot satisfy a required canary', () => {
  const entries = completeEntries()
  const chamomileSafety = entries.find(row => row.entitySlug === 'matricaria-chamomilla' && row.claimType === 'safety_risk')
  chamomileSafety.active = false
  const result = verifyCanaries(entries, registryFor(entries))
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('chamomile:anchor_requirement_failed:safety_visibility'))
  assert.equal(result.excludedEntryCount, 1)
})

test('unapproved evidence cannot satisfy a required canary', () => {
  const entries = completeEntries()
  const kavaNull = entries.find(row => row.entitySlug === 'piper-methysticum' && row.claimType === 'efficacy_null_or_mixed')
  kavaNull.editorialStatus = 'needs_review'
  const result = verifyCanaries(entries, registryFor(entries))
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('kava:anchor_requirement_failed:null_visibility'))
  assert.equal(result.excludedEntryCount, 1)
})

test('canonical entity identities satisfy stable display anchors', () => {
  const entries = completeEntries()
  const result = verifyCanaries(entries, registryFor(entries))
  assert.equal(result.pass, true, JSON.stringify(result, null, 2))
  assert.deepEqual(result.fixed.map(row => row.entityKey), [
    'herb:ashwagandha',
    'herb:matricaria-chamomilla',
    'herb:piper-methysticum',
    'compound:cannabidiol',
    'compound:luteolin',
  ])
})

test('remaining allowed baseline debt is limited to coverage dimensions', () => {
  const entries = baselineDebtEntries()
  const result = verifyCanaries(entries, registryFor(entries))
  assert.equal(result.pass, true, JSON.stringify(result, null, 2))
  assert.equal(result.idealPass, false)
  assert.equal(result.status, 'PASS_WITH_BASELINE_DEBT')
  assert.deepEqual(result.debt.unresolvedSourceIds, [])
  assert.deepEqual(result.debt.missingNullVisibilityAnchors, ['ashwagandha'])
  assert.deepEqual(result.debt.missingSafetyVisibilityAnchors, ['luteolin'])
  assert.deepEqual(result.debt.unexpectedUnresolvedSourceIds, [])
})

test('all current fixture sources block when registry support is absent', () => {
  const result = verifyCanaries(baselineDebtEntries(), [])
  assert.equal(result.pass, false)
  assert.deepEqual(result.debt.unresolvedSourceIds, expectedUnresolvedWithoutRegistry)
  assert.deepEqual(result.debt.unexpectedUnresolvedSourceIds, expectedUnresolvedWithoutRegistry)
  for (const sourceId of expectedUnresolvedWithoutRegistry) {
    assert.ok(result.blockers.includes(`new_provenance_debt:unresolved_source:${sourceId}`))
  }
})

test('registered but superseded or inactive evidence remains unresolved publication debt and blocks', () => {
  const entries = baselineDebtEntries()
  const registry = registryFor(entries).map(row => row.sourceId === 'src_fda-epidiolex-label-2021'
    ? { ...row, active: false, publicationStatus: 'superseded' }
    : row)
  const result = verifyCanaries(entries, registry)
  assert.equal(result.pass, false)
  assert.deepEqual(result.debt.unresolvedSourceIds, ['src_fda-epidiolex-label-2021'])
  assert.deepEqual(result.debt.unexpectedUnresolvedSourceIds, ['src_fda-epidiolex-label-2021'])
})

test('ashwagandha safety canary stays on the ashwagandha RCT and rejects the CBD label', () => {
  const entries = baselineDebtEntries()
  const safety = entries.find(row => row.entitySlug === 'ashwagandha' && row.topicType === 'adverse_effect')
  assert.equal(safety.sourceId, 'src_pubmed-31517876')

  safety.sourceId = 'src_fda-epidiolex-label-2021'
  const result = verifyCanaries(entries, registryFor(entries))
  assert.equal(result.pass, false, JSON.stringify(result, null, 2))
  assert.ok(result.blockers.some(value => value.includes('ashwagandha') && value.includes('provenance')))
})

test('canary ratchet blocks one newly unresolved source immediately', () => {
  const entries = completeEntries()
  const registry = registryFor(entries)
  entries.find(row => row.entitySlug === 'ashwagandha').sourceId = 'src_new-source'
  const result = verifyCanaries(entries, registry)
  assert.deepEqual(result.debt.unresolvedSourceIds, ['src_new-source'])
  assert.equal(result.pass, false)
  assert.ok(result.blockers.includes('new_provenance_debt:unresolved_source:src_new-source'))
})

test('changed normalized rows reference real canonical detail entities independent of source readiness', () => {
  const rows = fs.readFileSync(path.join(repoRoot, 'public', 'data', 'enrichment-normalized.jsonl'), 'utf8')
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
    ['enr_kava-short-term-liver-tolerability-rct', ['herb', 'piper-methysticum']],
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

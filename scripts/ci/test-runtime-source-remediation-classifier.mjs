#!/usr/bin/env node
import assert from 'node:assert/strict'
import { buildRuntimeSourceRemediationQueue, RUNTIME_SOURCE_REMEDIATION_STATES } from '../lib/runtime-source-remediation-classifier.mjs'

const entries = [
  { kind: 'herb', record: { slug: 'recoverable', governance: { indexingAllowed: true }, sources: [{ id: 'src_recoverable', doi: '10.1002/example.1', title: 'Randomized clinical trial' }], claimMap: [{ id: 'c1', claim: 'Human randomized trial with adverse event monitoring', evidenceLevel: 'human-clinical', sourceRefIds: ['src_recoverable'] }] } },
  { kind: 'herb', record: { slug: 'historical', governance: { indexingAllowed: false }, sources: [{ id: 'src_historical', pmid: '12345678', active: false, title: 'Archived clinical record' }], claimMap: [{ id: 'c2', sourceRefIds: ['src_historical'] }] } },
  { kind: 'compound', record: { slug: 'candidate-conflict', governance: { indexingAllowed: true }, sources: [{ sourceId: 'src_candidate', doi: '10.1002/example.2', pmid: '23456789', title: 'Systematic review' }], claimMap: [{ id: 'c3', claim: 'Systematic review in adults', evidenceLevel: 'human-clinical', sourceRefIds: ['src_candidate'] }] } },
  { kind: 'compound', record: { slug: 'insufficient', governance: { indexingAllowed: false }, sources: [{ id: 'src_insufficient', title: 'Local citation without canonical identity' }], claimMap: [{ id: 'c4', sourceRefIds: ['src_insufficient'] }] } },
  { kind: 'herb', record: { slug: 'quarantine', governance: { indexingAllowed: true }, sources: [{ id: 'src_quarantine', doi: '10.1002/example.3', title: 'First identity' }, { id: 'src_quarantine', doi: '10.1002/example.4', title: 'Conflicting identity' }], claimMap: [{ id: 'c5', claim: 'Safety toxicity signal', sourceRefIds: ['src_quarantine'] }] } },
  { kind: 'herb', record: { slug: 'fanout-copy', governance: { indexingAllowed: false }, sources: [{ id: 'src_recoverable', doi: '10.1002/example.1', title: 'Randomized clinical trial' }], claimMap: [{ id: 'c6', sourceRefIds: ['src_recoverable'] }] } },
]

const orphanRows = [
  { kind: 'herb', slug: 'recoverable', sourceId: 'src_recoverable', url: '/herbs/recoverable/' },
  { kind: 'herb', slug: 'historical', sourceId: 'src_historical', url: '/herbs/historical/' },
  { kind: 'compound', slug: 'candidate-conflict', sourceId: 'src_candidate', url: '/compounds/candidate-conflict/' },
  { kind: 'compound', slug: 'insufficient', sourceId: 'src_insufficient', url: '/compounds/insufficient/' },
  { kind: 'herb', slug: 'quarantine', sourceId: 'src_quarantine', url: '/herbs/quarantine/' },
  { kind: 'herb', slug: 'fanout-copy', sourceId: 'src_recoverable', url: '/herbs/fanout-copy/' },
]

const sourceCandidates = [{ candidateSourceId: 'cand_candidate', doi: '10.1002/example.2', pmid: '23456789', reviewStatus: 'approved_for_registry', approvalNotes: 'Promoted to source registry during prior workflow.' }]

const result = buildRuntimeSourceRemediationQueue({ orphanRows, entries, sourceCandidates, promotionReconciliations: [] })
assert.equal(result.orphanRows, orphanRows.length)
assert.equal(result.uniqueAffectedProfiles, orphanRows.length)
assert.equal(result.uniqueOrphanSourceIds, 5)
assert.deepEqual(Object.keys(result.countsByClass), RUNTIME_SOURCE_REMEDIATION_STATES)
assert.equal(result.countsByClass.attestation_ready_identity, 2)
assert.equal(result.countsByClass.historical_identity_recovery, 1)
assert.equal(result.countsByClass.candidate_reconciliation_required, 1)
assert.equal(result.countsByClass.identity_metadata_insufficient, 1)
assert.equal(result.countsByClass.quarantine_unverifiable, 1)

const bySlug = new Map(result.queue.map(item => [item.slug, item]))
assert.equal(bySlug.get('recoverable').remediationClass, 'attestation_ready_identity')
assert.match(bySlug.get('recoverable').reason, /not yet verified/iu)
assert.equal(bySlug.get('historical').remediationClass, 'historical_identity_recovery')
assert.equal(bySlug.get('candidate-conflict').remediationClass, 'candidate_reconciliation_required')
assert.equal(bySlug.get('insufficient').remediationClass, 'identity_metadata_insufficient')
assert.equal(bySlug.get('quarantine').remediationClass, 'quarantine_unverifiable')
assert.equal(bySlug.get('recoverable').sourceIdFanout, 2)
assert.equal(bySlug.get('fanout-copy').sourceIdFanout, 2)
assert.equal(bySlug.get('recoverable').published, true)
assert.equal(bySlug.get('recoverable').humanEvidenceRelevant, true)
assert.equal(bySlug.get('recoverable').safetyRelevant, true)
assert(bySlug.get('recoverable').priorityScore > bySlug.get('fanout-copy').priorityScore)
assert.deepEqual(result.sourceIdFanout[0], { sourceId: 'src_recoverable', fanout: 2 })

const missingLocal = buildRuntimeSourceRemediationQueue({ orphanRows: [{ kind: 'herb', slug: 'missing-local', sourceId: 'src_missing', url: '/herbs/missing-local/' }], entries: [{ kind: 'herb', record: { slug: 'missing-local', sources: [], claimMap: [] } }] })
assert.equal(missingLocal.queue[0].remediationClass, 'identity_metadata_insufficient')

const malformed = buildRuntimeSourceRemediationQueue({ orphanRows: [{ kind: 'herb', slug: 'malformed', sourceId: 'src_bad', url: '/herbs/malformed/' }], entries: [{ kind: 'herb', record: { slug: 'malformed', sources: [{ id: 'src_bad', doi: 'not-a-doi' }], claimMap: [] } }] })
assert.equal(malformed.queue[0].remediationClass, 'quarantine_unverifiable')

const mixedValidMalformed = buildRuntimeSourceRemediationQueue({ orphanRows: [{ kind: 'herb', slug: 'mixed-malformed', sourceId: 'src_mixed', url: '/herbs/mixed-malformed/' }], entries: [{ kind: 'herb', record: { slug: 'mixed-malformed', sources: [{ id: 'src_mixed', doi: '10.1002/example.5', pmid: 'bad-pmid' }], claimMap: [] } }] })
assert.equal(mixedValidMalformed.queue[0].remediationClass, 'quarantine_unverifiable')

assert.throws(() => buildRuntimeSourceRemediationQueue({ orphanRows: [orphanRows[0], orphanRows[0]], entries }), /Duplicate runtime registry orphan rows/u)
const rerun = buildRuntimeSourceRemediationQueue({ orphanRows, entries, sourceCandidates, promotionReconciliations: [] })
assert.deepEqual(rerun, result)

console.log('[runtime-source-remediation-classifier-tests] PASS')

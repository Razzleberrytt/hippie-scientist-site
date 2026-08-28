#!/usr/bin/env node
import assert from 'node:assert/strict'
import {
  evaluateRuntimeSourceRegistryReferences,
  ORPHANED_CANONICAL_SOURCE_REFERENCE,
} from '../lib/runtime-source-registry-audit.mjs'

const base = {
  slug: 'fixture',
  evidence: { sourceIds: ['src_registered'] },
  claimMap: [{ id: 'c1', sourceRefIds: ['src_registered'] }],
}

const registered = [{ sourceId: 'src_registered', active: false }]
assert.deepEqual(evaluateRuntimeSourceRegistryReferences(base, 'herb', registered), [])

const orphan = structuredClone(base)
orphan.evidence.sourceIds = ['src_orphan']
orphan.claimMap = [{ id: 'c2', sourceRefIds: ['src_orphan'] }]
const orphanFindings = evaluateRuntimeSourceRegistryReferences(orphan, 'herb', registered)
assert.equal(orphanFindings.length, 1)
assert.equal(orphanFindings[0].code, ORPHANED_CANONICAL_SOURCE_REFERENCE)
assert.equal(orphanFindings[0].blocking, false)
assert.equal(orphanFindings[0].sourceId, 'src_orphan')
assert.match(orphanFindings[0].detail, /src_orphan/u)

const localOnly = structuredClone(base)
localOnly.evidence.sourceIds = ['profile-local-source']
localOnly.claimMap = [{ id: 'c3', sourceRefIds: ['profile-local-source'] }]
assert.deepEqual(evaluateRuntimeSourceRegistryReferences(localOnly, 'compound', []), [])

const mixed = structuredClone(base)
mixed.evidence.sourceIds = ['src_registered', 'src_orphan']
mixed.claimMap = [
  { id: 'c4', sourceRefIds: ['src_orphan'] },
  { id: 'c5', sourceRefIds: ['src_second_orphan'] },
]
const mixedFindings = evaluateRuntimeSourceRegistryReferences(mixed, 'herb', registered)
assert.deepEqual(mixedFindings.map(finding => finding.sourceId), [
  'src_orphan',
  'src_second_orphan',
])
assert.deepEqual(mixedFindings.map(finding => finding.detail), [
  'Runtime source reference src_orphan is absent from public/data/source-registry.json',
  'Runtime source reference src_second_orphan is absent from public/data/source-registry.json',
])

console.log('[runtime-source-registry-audit-tests] PASS')

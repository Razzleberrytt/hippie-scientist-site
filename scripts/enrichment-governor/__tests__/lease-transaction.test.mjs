import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import {
  assertFreshBase,
  parseList,
  resolveWorkflowActor,
  validateLeaseEntity,
  validateLeaseFile,
  validateLeaseTransactionInput,
} from '../lease-transaction.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const controlPath = path.resolve(here, '..', 'control.mjs')

test('persistent acquire accepts exact bounded scope and deduplicates repeated inputs', () => {
  const request = validateLeaseTransactionInput({
    operation: 'acquire',
    id: 'lease-ashwagandha-4266',
    owner: 'research-session-e',
    purpose: 'canonical enrichment',
    files: 'public/data/source-registry.json,public/data/source-registry.json',
    entities: 'herb:ashwagandha',
    actor: 'Razzleberrytt',
    baseSha: 'a'.repeat(40),
  })

  assert.equal(request.operation, 'acquire')
  assert.deepEqual(request.files, ['public/data/source-registry.json'])
  assert.deepEqual(request.entities, ['herb:ashwagandha'])
  assert.equal(request.purpose, 'canonical enrichment')
})

test('explicit workflow actor preserves initiating human and falls back to native GitHub actor', () => {
  assert.equal(resolveWorkflowActor('Razzleberrytt', 'github-actions[bot]'), 'Razzleberrytt')
  assert.equal(resolveWorkflowActor('', 'Razzleberrytt'), 'Razzleberrytt')
  assert.equal(resolveWorkflowActor('  Razzleberrytt  ', 'github-actions[bot]'), 'Razzleberrytt')

  const request = validateLeaseTransactionInput({
    operation: 'acquire',
    id: 'lease-actor-fixture',
    owner: 'integration-agent',
    purpose: 'actor provenance',
    entities: 'herb:ashwagandha',
    actor: resolveWorkflowActor('Razzleberrytt', 'github-actions[bot]'),
  })
  assert.equal(request.actor, 'Razzleberrytt')
  assert.throws(() => validateLeaseTransactionInput({
    operation: 'acquire',
    id: 'lease-actor-fixture',
    owner: 'integration-agent',
    purpose: 'actor provenance',
    entities: 'herb:ashwagandha',
    actor: resolveWorkflowActor('', 'github-actions[bot]'),
  }), /workflow actor contains unsupported characters/)
})

test('persistent release is owner-bound and cannot redefine lease scope', () => {
  const request = validateLeaseTransactionInput({
    operation: 'release',
    id: 'lease-ashwagandha-4266',
    owner: 'research-session-e',
    disposition: 'verified',
  })
  assert.equal(request.disposition, 'verified')

  assert.throws(() => validateLeaseTransactionInput({
    operation: 'release',
    id: 'lease-ashwagandha-4266',
    owner: 'research-session-e',
    files: 'public/data/source-registry.json',
  }), /must not redefine file\/entity scope/)
})

test('unknown operations and empty acquire scopes fail closed', () => {
  assert.throws(() => validateLeaseTransactionInput({
    operation: 'delete-everything',
    id: 'lease-a',
    owner: 'agent-a',
  }), /unknown lease operation/)

  assert.throws(() => validateLeaseTransactionInput({
    operation: 'acquire',
    id: 'lease-a',
    owner: 'agent-a',
  }), /requires at least one exact file or entity scope/)
})

test('path traversal, shell metacharacters and globs are rejected before control.mjs runs', () => {
  for (const unsafe of ['../secret.json', '/tmp/file.json', 'safe.json;touch-pwned', 'ops/**/state.json', 'ops\\state.json']) {
    assert.throws(() => validateLeaseFile(unsafe))
  }
  assert.equal(validateLeaseFile('ops/enrichment-governor/work-queue.json'), 'ops/enrichment-governor/work-queue.json')
})

test('direct control CLI shares the same fail-closed lease path validation', () => {
  const result = spawnSync(process.execPath, [
    controlPath,
    'lease-acquire',
    '--id=lease-invalid-path-fixture',
    '--owner=ci-fixture',
    '--files=../outside-governor.json',
  ], { encoding: 'utf8' })

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /traversal is not allowed/)
})

test('entity keys must be typed canonical-style identifiers', () => {
  assert.equal(validateLeaseEntity('compound:l-tyrosine'), 'compound:l-tyrosine')
  for (const unsafe of ['l-tyrosine', 'compound:', 'Compound:l-tyrosine', 'compound:l tyrosine', 'compound:l-tyrosine;echo']) {
    assert.throws(() => validateLeaseEntity(unsafe), /malformed entity key/)
  }
})

test('workflow input list parsing is deterministic', () => {
  assert.deepEqual(parseList('a,b,a, c '), ['a', 'b', 'c'])
  assert.deepEqual(parseList(''), [])
})

test('stale main state loses safely instead of overwriting a newer governor state', () => {
  const expected = '1'.repeat(40)
  const current = '2'.repeat(40)
  assert.equal(assertFreshBase(expected, expected), true)
  assert.throws(() => assertFreshBase(expected, current), /stale governor transaction base/)
  assert.throws(() => assertFreshBase('not-a-sha', current), /expected base SHA is invalid/)
})

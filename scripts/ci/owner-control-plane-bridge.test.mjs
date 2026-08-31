import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  governorDispatchInputs,
  parseGovernorComment,
  sessionFromChangedFiles,
  validateReadySnapshot,
} from './owner-control-plane-bridge.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')

function draftPr(overrides = {}) {
  return {
    state: 'open',
    draft: true,
    base: { ref: 'main' },
    head: {
      ref: 'research/session-c-fixture',
      sha: 'a'.repeat(40),
      repo: { full_name: 'Razzleberrytt/hippie-scientist-site' },
    },
    ...overrides,
  }
}

test('parses a strict owner governor acquire payload into canonical workflow inputs', () => {
  const request = parseGovernorComment('/governor {"operation":"acquire","id":"lease-4266","owner":"integration-agent","purpose":"Ashwagandha canonical review","entities":["herb:ashwagandha"],"files":[]}')
  assert.equal(request.operation, 'acquire')
  assert.deepEqual(request.entities, ['herb:ashwagandha'])
  assert.deepEqual(governorDispatchInputs(request), {
    operation: 'acquire',
    lease_id: 'lease-4266',
    owner: 'integration-agent',
    purpose: 'Ashwagandha canonical review',
    files: '',
    entities: 'herb:ashwagandha',
    disposition: '',
  })
})

test('rejects unsupported governor fields instead of silently ignoring them', () => {
  assert.throws(
    () => parseGovernorComment('/governor {"operation":"acquire","id":"lease-1","owner":"agent","entities":["herb:test"],"shell":"rm -rf /"}'),
    /unsupported governor command fields: shell/,
  )
})

test('rejects path traversal through the canonical lease validator', () => {
  assert.throws(
    () => parseGovernorComment('/governor {"operation":"acquire","id":"lease-1","owner":"agent","files":["../secret"],"entities":[]}'),
    /path traversal|repository-relative/,
  )
})

test('rejects release commands that try to redefine lease scope', () => {
  assert.throws(
    () => parseGovernorComment('/governor {"operation":"release","id":"lease-1","owner":"agent","disposition":"completed","entities":["herb:test"]}'),
    /lease release must not redefine file\/entity scope/,
  )
})

test('detects one enrichment session and rejects a multi-session PR', () => {
  assert.equal(
    sessionFromChangedFiles(['ops/enrichment-submissions/sessions/session-c/example.json', 'README.md']),
    'session-c',
  )
  assert.throws(
    () => sessionFromChangedFiles([
      'ops/enrichment-submissions/sessions/session-c/a.json',
      'ops/enrichment-submissions/sessions/session-d/b.json',
    ]),
    /may not span multiple enrichment sessions/,
  )
})

test('ready transition requires open draft same-repository PR based on main', () => {
  assert.equal(validateReadySnapshot(draftPr(), 'Razzleberrytt/hippie-scientist-site'), true)
  assert.throws(() => validateReadySnapshot(draftPr({ draft: false }), 'Razzleberrytt/hippie-scientist-site'), /must still be draft/)
  assert.throws(() => validateReadySnapshot(draftPr({ base: { ref: 'release' } }), 'Razzleberrytt/hippie-scientist-site'), /base must be main/)
  assert.throws(
    () => validateReadySnapshot(draftPr({ head: { ref: 'fixture', sha: 'a'.repeat(40), repo: { full_name: 'someone/fork' } } }), 'Razzleberrytt/hippie-scientist-site'),
    /same repository/,
  )
  assert.throws(
    () => validateReadySnapshot(draftPr({ head: { sha: 'a'.repeat(40), repo: { full_name: 'Razzleberrytt/hippie-scientist-site' } } }), 'Razzleberrytt/hippie-scientist-site'),
    /head ref is missing or invalid/,
  )
})

test('workflow is owner-only, main-trusted, and explicitly dispatches exact-head recovery validation', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'owner-control-plane-bridge.yml'), 'utf8')
  assert.match(workflow, /issue_comment:/)
  assert.match(workflow, /github\.event\.comment\.user\.login == github\.repository_owner/)
  assert.match(workflow, /actions:\s*write/)
  assert.match(workflow, /pull-requests:\s*write/)
  assert.match(workflow, /ref:\s*main/)
  assert.match(workflow, /gh workflow run enrichment-governor-transaction\.yml/)
  assert.match(workflow, /gh pr ready/)
  assert.match(workflow, /Verify ready transition preserved exact head/)
  assert.match(workflow, /gh workflow run ci\.yml/)
  assert.match(workflow, /gh workflow run check\.yml/)
  assert.match(workflow, /gh workflow run atomic-upgrade-gate\.yml/)
  assert.match(workflow, /gh workflow run build-quality-regression\.yml/)
  assert.doesNotMatch(workflow, /pull_request_target:/)
})

test('site health workflow binds recovery dispatch to the current PR head', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'check.yml'), 'utf8')
  assert.match(workflow, /recovery_pr_number:/)
  assert.match(workflow, /pull-requests:\s*read/)
  assert.match(workflow, /Assert exact recovery PR head/)
  assert.match(workflow, /Recovery dispatch is stale/)
  assert.match(workflow, /Recovery dispatch requires base main/)
})

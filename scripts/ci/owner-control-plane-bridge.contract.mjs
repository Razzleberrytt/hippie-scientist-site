import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  governorDispatchInputs,
  parseGovernorComment,
  sessionFromChangedFiles,
  shouldInspectSessionCandidate,
  validateCurrentMainAncestry,
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

test('session conflict inspection includes non-draft fork PRs', () => {
  assert.equal(
    shouldInspectSessionCandidate({ number: 17, draft: false, head: { repo: { full_name: 'someone/fork' } } }, 16),
    true,
  )
  assert.equal(shouldInspectSessionCandidate({ number: 16, draft: false }, 16), false)
  assert.equal(shouldInspectSessionCandidate({ number: 17, draft: true }, 16), false)
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

test('ready transition requires the head to contain exact current main', () => {
  const mainSha = 'b'.repeat(40)
  const headSha = 'a'.repeat(40)
  assert.equal(validateCurrentMainAncestry({ behind_by: 0, merge_base_commit: { sha: mainSha } }, mainSha, headSha), true)
  assert.throws(
    () => validateCurrentMainAncestry({ behind_by: 1, merge_base_commit: { sha: 'c'.repeat(40) } }, mainSha, headSha),
    /behind current main by 1 commit/,
  )
  assert.throws(
    () => validateCurrentMainAncestry({ behind_by: 0, merge_base_commit: { sha: 'c'.repeat(40) } }, mainSha, headSha),
    /does not contain exact current main/,
  )
})

test('workflow is owner-only, serialized, main-trusted, and explicitly dispatches exact-head recovery validation', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'owner-control-plane-bridge.yml'), 'utf8')
  assert.match(workflow, /issue_comment:/)
  assert.match(workflow, /github\.event\.comment\.user\.login == github\.repository_owner/)
  assert.match(workflow, /group:\s*owner-control-plane-bridge-global/)
  assert.match(workflow, /actions:\s*write/)
  assert.match(workflow, /pull-requests:\s*write/)
  assert.match(workflow, /ref:\s*main/)
  assert.match(workflow, /gh workflow run enrichment-governor-transaction\.yml/)
  assert.match(workflow, /TRANSACTION_ACTOR:\s*\$\{\{ github\.event\.comment\.user\.login \}\}/)
  assert.match(workflow, /-f "actor=\$TRANSACTION_ACTOR"/)
  assert.match(workflow, /gh pr ready/)
  assert.match(workflow, /Verify transition preserved exact head and current main/)
  assert.match(workflow, /gh pr ready "\$PR_NUMBER" --undo/)
  assert.match(workflow, /gh workflow run ci\.yml/)
  assert.match(workflow, /gh workflow run check\.yml/)
  assert.match(workflow, /gh workflow run atomic-upgrade-gate\.yml/)
  assert.match(workflow, /gh workflow run build-quality-regression\.yml/)
  assert.doesNotMatch(workflow, /pull_request_target:/)
})

test('governor transaction workflow accepts explicit actor provenance without relaxing fallback validation', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'enrichment-governor-transaction.yml'), 'utf8')
  assert.match(workflow, /\n      actor:\n/)
  assert.match(workflow, /Initiating human actor/)
  assert.match(workflow, /TRANSACTION_ACTOR:\s*\$\{\{ inputs\.actor \}\}/)
  assert.match(workflow, /Actor:\s*\\`\$\{\{ inputs\.actor \|\| github\.actor \}\}\\`/)
})

test('site health workflow binds recovery dispatch to the current PR head', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'check.yml'), 'utf8')
  assert.match(workflow, /recovery_pr_number:/)
  assert.match(workflow, /pull-requests:\s*read/)
  assert.match(workflow, /Assert exact recovery PR head/)
  assert.match(workflow, /Recovery dispatch is stale/)
  assert.match(workflow, /Recovery dispatch requires base main/)
})

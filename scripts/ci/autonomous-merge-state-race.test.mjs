import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { evaluateReadiness } from './autonomous-merge-controller.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const baseSha = 'base'
const headSha = 'head'

function pr(overrides = {}) {
  return {
    number: 1,
    state: 'open',
    draft: false,
    mergeable: true,
    mergeable_state: 'clean',
    labels: [],
    head: { sha: headSha, repo: { full_name: 'owner/repo' } },
    base: { sha: baseSha, repo: { full_name: 'owner/repo' } },
    ...overrides,
  }
}

test('authorization-changing PR events cancel stale per-PR merge-controller runs', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'autonomous-merge-controller.yml'), 'utf8')
  assert.match(workflow, /types:\s*\[[^\]]*converted_to_draft[^\]]*\]/)
  assert.match(workflow, /types:\s*\[[^\]]*labeled[^\]]*\]/)
  assert.match(workflow, /types:\s*\[[^\]]*unlabeled[^\]]*\]/)
  assert.match(workflow, /types:\s*\[[^\]]*closed[^\]]*\]/)
  assert.match(workflow, /group:\s*autonomous-merge-\$\{\{ github\.event\.pull_request\.number \|\| 'fallback' \}\}/)
  assert.match(workflow, /cancel-in-progress:\s*true/)
})

test('draft, closed, held, and moved-head snapshots are never merge-ready', () => {
  const cases = [
    pr({ draft: true }),
    pr({ state: 'closed' }),
    pr({ labels: [{ name: 'hold-merge' }] }),
    pr({ head: { sha: 'other', repo: { full_name: 'owner/repo' } } }),
  ]

  for (const candidate of cases) {
    const verdict = evaluateReadiness({
      pr: candidate,
      workflowRuns: [],
      checkRuns: [],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'high',
      changedFiles: ['scripts/ci/autonomous-merge-controller.mjs'],
    })
    assert.equal(verdict.action, 'stop')
  }
})

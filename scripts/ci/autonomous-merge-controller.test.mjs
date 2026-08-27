import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import { classifyRisk, evaluateReadiness } from './autonomous-merge-controller.mjs'

const baseSha = 'base'
const headSha = 'head'
const pr = {
  number: 1,
  state: 'open',
  draft: false,
  mergeable: true,
  mergeable_state: 'clean',
  labels: [],
  head: { sha: headSha, repo: { full_name: 'owner/repo' } },
  base: { sha: baseSha, repo: { full_name: 'owner/repo' } },
}

function run(name, status = 'completed', conclusion = 'success') {
  return {
    name,
    status,
    conclusion,
    run_number: 1,
    run_attempt: 1,
    pull_requests: [{ number: 1, base: { sha: baseSha } }],
  }
}

const mediumRequired = [
  run('CI'),
  run('Site Health Check'),
  run('Atomic upgrade gate'),
  run('Production Content Lint'),
  run('Build quality regression'),
]

test('scientific and governance paths are high risk', () => {
  for (const changedFile of [
    'public/data/herbs/foo.json',
    'scripts/ci/example.mjs',
    'data-sources/herb_monograph_master.xlsx',
    'data-sources/workbook-patches/example.json',
    'scripts/build-runtime-data.mjs',
    'scripts/enrichment-governor/control.mjs',
  ]) {
    assert.equal(classifyRisk({ pr, changedFiles: [changedFile] }), 'high', changedFile)
  }
})

test('changed-file pagination has no four-page truncation', () => {
  const source = fs.readFileSync(new URL('./autonomous-merge-controller.mjs', import.meta.url), 'utf8')
  assert.match(source, /for \(let page = 1; ; page \+= 1\)/)
  assert.doesNotMatch(source, /page\s*<=\s*4/)
})

test('test/docs-only changes are low risk', () => {
  assert.equal(classifyRisk({ pr, changedFiles: ['docs/merge-policy.md', 'lib/__tests__/foo.test.ts'] }), 'low')
})

test('ordinary product code is medium risk', () => {
  assert.equal(classifyRisk({ pr, changedFiles: ['src/components/SearchBox.tsx'] }), 'medium')
})

test('medium risk ignores unrelated pending workflows after required gates pass', () => {
  const verdict = evaluateReadiness({
    pr,
    workflowRuns: [...mediumRequired, run('Lighthouse CI', 'in_progress', null)],
    checkRuns: [],
    expectedHeadSha: headSha,
    currentBaseSha: baseSha,
    controllerRunId: 'controller',
    riskTier: 'medium',
  })
  assert.equal(verdict.action, 'merge')
})

test('medium risk still fails closed on a known optional failure', () => {
  const verdict = evaluateReadiness({
    pr,
    workflowRuns: [...mediumRequired, run('Lighthouse CI', 'completed', 'failure')],
    checkRuns: [],
    expectedHeadSha: headSha,
    currentBaseSha: baseSha,
    controllerRunId: 'controller',
    riskTier: 'medium',
  })
  assert.equal(verdict.action, 'failed')
})

test('high risk waits for every triggered workflow', () => {
  const verdict = evaluateReadiness({
    pr,
    workflowRuns: [...mediumRequired, run('Lighthouse CI', 'in_progress', null)],
    checkRuns: [],
    expectedHeadSha: headSha,
    currentBaseSha: baseSha,
    controllerRunId: 'controller',
    riskTier: 'high',
  })
  assert.equal(verdict.action, 'wait')
})

test('low risk waits only for CI and ignores unrelated pending checks', () => {
  const verdict = evaluateReadiness({
    pr,
    workflowRuns: [run('CI'), run('Lighthouse CI', 'in_progress', null)],
    checkRuns: [{ id: 5, name: 'optional-check', status: 'in_progress', conclusion: null, app: { slug: 'github-actions' } }],
    expectedHeadSha: headSha,
    currentBaseSha: baseSha,
    controllerRunId: 'controller',
    riskTier: 'low',
  })
  assert.equal(verdict.action, 'merge')
})

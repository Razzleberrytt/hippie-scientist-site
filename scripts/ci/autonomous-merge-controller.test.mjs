import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

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

describe('risk-tiered autonomous merge controller', () => {
  it('classifies scientific and governance paths as high risk', () => {
    for (const changedFile of [
      'public/data/herbs/foo.json',
      'scripts/ci/example.mjs',
      'data-sources/herb_monograph_master.xlsx',
      'data-sources/workbook-patches/example.json',
      'scripts/build-runtime-data.mjs',
      'scripts/enrichment-governor/control.mjs',
    ]) {
      expect(classifyRisk({ pr, changedFiles: [changedFile] }), changedFile).toBe('high')
    }
  })

  it('has no four-page changed-file truncation', () => {
    const source = fs.readFileSync(new URL('./autonomous-merge-controller.mjs', import.meta.url), 'utf8')
    expect(source).toMatch(/for \(let page = 1; ; page \+= 1\)/)
    expect(source).not.toMatch(/page\s*<=\s*4/)
  })

  it('classifies test/docs-only changes as low risk', () => {
    expect(classifyRisk({ pr, changedFiles: ['docs/merge-policy.md', 'lib/__tests__/foo.test.ts'] })).toBe('low')
  })

  it('classifies ordinary product code as medium risk', () => {
    expect(classifyRisk({ pr, changedFiles: ['src/components/SearchBox.tsx'] })).toBe('medium')
  })

  it('lets medium risk ignore unrelated pending workflows after required gates pass', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [...mediumRequired, run('Lighthouse CI', 'in_progress', null)],
      checkRuns: [],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
    })
    expect(verdict.action).toBe('merge')
  })

  it('keeps medium risk fail-closed on a known optional failure', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [...mediumRequired, run('Lighthouse CI', 'completed', 'failure')],
      checkRuns: [],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
    })
    expect(verdict.action).toBe('failed')
  })

  it('makes high risk wait for every triggered workflow', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [...mediumRequired, run('Lighthouse CI', 'in_progress', null)],
      checkRuns: [],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'high',
    })
    expect(verdict.action).toBe('wait')
  })

  it('lets low risk wait only for CI while unrelated checks remain pending', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [run('CI'), run('Lighthouse CI', 'in_progress', null)],
      checkRuns: [{ id: 5, name: 'optional-check', status: 'in_progress', conclusion: null, app: { slug: 'github-actions' } }],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'low',
    })
    expect(verdict.action).toBe('merge')
  })
})

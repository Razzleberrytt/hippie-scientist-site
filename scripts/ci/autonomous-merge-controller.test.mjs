import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { classifyRisk, evaluateReadiness, requiredChecksFor, requiredWorkflowsFor } from './autonomous-merge-controller.mjs'

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

function check(name, status = 'completed', conclusion = 'success', id = 1) {
  return { id, name, status, conclusion, app: { slug: 'github-actions' } }
}

const mediumCore = [
  run('Atomic upgrade gate'),
  run('Build quality regression'),
]

const highRequired = [
  run('CI'),
  ...mediumCore,
  run('Site Health Check'),
  run('Production Content Lint'),
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
    const source = fs.readFileSync(path.join(process.cwd(), 'scripts/ci/autonomous-merge-controller.mjs'), 'utf8')
    expect(source).toMatch(/for \(let page = 1; ; page \+= 1\)/)
    expect(source).not.toMatch(/page\s*<=\s*4/)
  })

  it('classifies test/docs-only changes as low risk', () => {
    expect(classifyRisk({ pr, changedFiles: ['docs/merge-policy.md', 'lib/__tests__/foo.test.ts'] })).toBe('low')
  })

  it('classifies ordinary product code as medium risk', () => {
    expect(classifyRisk({ pr, changedFiles: ['src/components/SearchBox.tsx'] })).toBe('medium')
  })

  it('requires targeted distribution workflows for a medium renderer but not the whole CI workflow', () => {
    expect(requiredWorkflowsFor('medium', ['scripts/distribution/render-carousel-svg.mjs'])).toEqual([
      'Atomic upgrade gate',
      'Build quality regression',
      'Research Distribution',
    ])
    expect(requiredChecksFor('medium')).toEqual(['Validation, tests, and data'])
  })

  it('requires site and production-content gates for medium public-site changes', () => {
    expect(requiredWorkflowsFor('medium', ['src/components/SearchBox.tsx'])).toEqual([
      'Atomic upgrade gate',
      'Build quality regression',
      'Site Health Check',
      'Production Content Lint',
    ])
  })

  it('lets a medium renderer merge after validation while CI production build and content lint remain pending', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        ...mediumCore,
        run('Research Distribution'),
        run('CI', 'in_progress', null),
        run('Site Health Check', 'in_progress', null),
        run('Production Content Lint', 'in_progress', null),
        run('Lighthouse CI', 'in_progress', null),
      ],
      checkRuns: [
        check('Validation, tests, and data', 'completed', 'success', 10),
        check('Production build, output, and SEO', 'in_progress', null, 11),
      ],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['scripts/distribution/render-carousel-svg.mjs'],
    })
    expect(verdict.action).toBe('merge')
  })

  it('waits for the validation job on medium risk even when targeted workflows are green', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [...mediumCore, run('Research Distribution'), run('CI', 'in_progress', null)],
      checkRuns: [check('Validation, tests, and data', 'in_progress', null, 10)],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['scripts/distribution/render-carousel-svg.mjs'],
    })
    expect(verdict.action).toBe('wait')
    expect(verdict.reason).toContain('Validation, tests, and data')
  })

  it('waits for Research Distribution when a medium renderer changed', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [...mediumCore, run('Research Distribution', 'in_progress', null)],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['scripts/distribution/render-carousel-svg.mjs'],
    })
    expect(verdict.action).toBe('wait')
    expect(verdict.reason).toContain('Research Distribution')
  })

  it('waits for Production Content Lint when a medium public-site file changed', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        ...mediumCore,
        run('Site Health Check'),
        run('Production Content Lint', 'in_progress', null),
      ],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['src/components/SearchBox.tsx'],
    })
    expect(verdict.action).toBe('wait')
    expect(verdict.reason).toContain('Production Content Lint')
  })

  it('keeps medium risk fail-closed on a known optional failure', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [...mediumCore, run('Lighthouse CI', 'completed', 'failure')],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['scripts/media/example.mjs'],
    })
    expect(verdict.action).toBe('failed')
  })

  it('keeps medium risk fail-closed on a known optional check failure', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: mediumCore,
      checkRuns: [
        check('Validation, tests, and data', 'completed', 'success', 10),
        check('Production build, output, and SEO', 'completed', 'failure', 11),
      ],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['scripts/media/example.mjs'],
    })
    expect(verdict.action).toBe('failed')
  })

  it('makes high risk wait for every triggered workflow', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [...highRequired, run('Lighthouse CI', 'in_progress', null)],
      checkRuns: [],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'high',
      changedFiles: ['scripts/ci/autonomous-merge-controller.mjs'],
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
      changedFiles: ['docs/merge-policy.md'],
    })
    expect(verdict.action).toBe('merge')
  })
})

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { classifyRisk, evaluateReadiness, requiredChecksFor, requiredWorkflowsFor, shouldDispatchRegisteredWorkflow, recoveryInputsFor } from './autonomous-merge-controller.mjs'

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
    event: 'pull_request',
    head_sha: headSha,
    run_number: 1,
    run_attempt: 1,
    pull_requests: [{ number: 1, base: { sha: baseSha } }],
  }
}

function dispatchedRun(name, status = 'completed', conclusion = 'success') {
  return {
    ...run(name, status, conclusion),
    event: 'workflow_dispatch',
    pull_requests: [],
  }
}

function check(name, status = 'completed', conclusion = 'success', id = 1) {
  return { id, name, status, conclusion, app: { slug: 'github-actions' } }
}

function externalCheck(name, appSlug, status = 'completed', conclusion = 'success', id = 1000) {
  return { id, name, status, conclusion, app: { slug: appSlug } }
}

const mediumCore = [
  run('CI'),
  run('Atomic upgrade gate'),
  run('Build quality regression'),
]

const highRequired = [
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

  it('has one trusted completion wake owner without a dispatch bridge', () => {
    const controllerWorkflow = fs.readFileSync(path.join(process.cwd(), '.github/workflows/autonomous-merge-controller.yml'), 'utf8')

    expect(controllerWorkflow).toContain('pr_number:')
    expect(controllerWorkflow).toContain('expected_head_sha:')
    expect(controllerWorkflow).toContain("group: autonomous-merge-${{ github.event.pull_request.number || inputs.pr_number || 'fallback' }}")
    expect(controllerWorkflow).toContain('SWEEP_OPEN_PRS: ${{ steps.wake.outputs.sweep }}')
    expect(controllerWorkflow).toContain("CONTROLLER_SINGLE_PASS: 'true'")

    expect(controllerWorkflow).toContain('workflow_run:')
    for (const workflowName of ['Build Check', 'Lighthouse CI', 'Production Content Lint', 'P0 Visual Proof']) {
      expect(controllerWorkflow).toContain(`- ${workflowName}`)
    }
    expect(fs.existsSync('.github/workflows/governed-consumer-wake.yml')).toBe(false)
    expect(controllerWorkflow).toContain('node scripts/ci/autonomous-merge-wake.mjs')
    expect(controllerWorkflow).toContain('EXPECTED_HEAD_SHA: ${{ steps.wake.outputs.head_sha }}')

    for (const workflow of ['build-check.yml', 'lighthouse.yml', 'production-content-lint.yml', 'visual-proof.yml']) {
      const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows', workflow), 'utf8')
      expect(source, workflow).toContain('actions: read')
      expect(source, workflow).not.toContain('actions: write')
      expect(source, workflow).not.toContain('Wake autonomous merge controller')
    }
  })

  it('classifies test/docs-only changes as low risk', () => {
    expect(classifyRisk({ pr, changedFiles: ['docs/merge-policy.md', 'lib/__tests__/foo.test.ts'] })).toBe('low')
  })

  it('classifies ordinary product code as medium risk', () => {
    expect(classifyRisk({ pr, changedFiles: ['src/components/SearchBox.tsx'] })).toBe('medium')
  })

  it('uses the exact-head validation job instead of the whole CI workflow for low risk', () => {
    expect(requiredWorkflowsFor('low', ['docs/merge-policy.md'])).toEqual([])
    expect(requiredChecksFor('low')).toEqual(['Validation, tests, and data'])
  })

  it('requires CI plus P0 proof when a low-risk test file still triggers visual validation', () => {
    expect(requiredWorkflowsFor('low', ['app/__tests__/foo.test.ts'])).toEqual([
      'CI',
      'P0 Visual Proof',
    ])
  })

  it('requires CI plus targeted distribution workflows for a medium renderer', () => {
    expect(requiredWorkflowsFor('medium', ['scripts/distribution/render-carousel-svg.mjs'])).toEqual([
      'CI',
      'Atomic upgrade gate',
      'Build quality regression',
      'Research Distribution',
    ])
    expect(requiredChecksFor('medium')).toEqual(['Validation, tests, and data'])
  })

  it('requires CI, site health, and production-content gates for medium public-site changes', () => {
    expect(requiredWorkflowsFor('medium', ['src/components/SearchBox.tsx'])).toEqual([
      'CI',
      'Atomic upgrade gate',
      'Build quality regression',
      'Site Health Check',
      'Production Content Lint',
    ])
  })

  it('requires CI, site health, production-content, and P0 visual proof for medium visual paths', () => {
    expect(requiredWorkflowsFor('medium', ['app/research/page.tsx'])).toEqual([
      'CI',
      'Atomic upgrade gate',
      'Build quality regression',
      'Site Health Check',
      'Production Content Lint',
      'P0 Visual Proof',
    ])
  })

  it('also requires P0 visual proof for high-risk changes that trigger the visual consumer', () => {
    expect(requiredWorkflowsFor('high', ['.github/workflows/visual-proof.yml'])).toContain('P0 Visual Proof')
  })

  it('lets a low-risk docs PR merge after validation while the CI production job remains pending', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [run('CI', 'in_progress', null), run('Lighthouse CI', 'in_progress', null)],
      checkRuns: [
        check('Validation, tests, and data', 'completed', 'success', 10),
        check('Production build, output, and SEO', 'in_progress', null, 11),
      ],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'low',
      changedFiles: ['docs/merge-policy.md'],
    })
    expect(verdict.action).toBe('merge')
  })

  it('waits for CI and dispatched P0 proof before merging a low-risk visual-path test', () => {
    const pending = evaluateReadiness({
      pr,
      workflowRuns: [run('CI'), dispatchedRun('P0 Visual Proof', 'in_progress', null)],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'low',
      changedFiles: ['app/__tests__/foo.test.ts'],
    })
    expect(pending.action).toBe('wait')
    expect(pending.reason).toContain('P0 Visual Proof')

    const green = evaluateReadiness({
      pr,
      workflowRuns: [run('CI'), dispatchedRun('P0 Visual Proof')],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'low',
      changedFiles: ['app/__tests__/foo.test.ts'],
    })
    expect(green.action).toBe('merge')
  })

  it('waits for medium-risk CI producer completion before merge', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        run('CI', 'in_progress', null),
        run('Atomic upgrade gate'),
        run('Build quality regression'),
        run('Research Distribution'),
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
    expect(verdict.action).toBe('wait')
    expect(verdict.reason).toContain('CI')
  })

  it('waits for the CI producer before merging a medium public-site change', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        run('CI', 'in_progress', null),
        run('Atomic upgrade gate'),
        run('Build quality regression'),
        run('Site Health Check'),
        run('Production Content Lint'),
      ],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['src/components/SearchBox.tsx'],
    })
    expect(verdict.action).toBe('wait')
    expect(verdict.reason).toContain('CI')
  })

  it('allows a medium public-site merge after CI and targeted gates are terminal-green', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        ...mediumCore,
        run('Site Health Check'),
        run('Production Content Lint'),
        run('Lighthouse CI', 'in_progress', null),
      ],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['src/components/SearchBox.tsx'],
    })
    expect(verdict.action).toBe('merge')
  })

  it('waits for dispatched P0 visual proof before merging a medium visual-path change', () => {
    const pending = evaluateReadiness({
      pr,
      workflowRuns: [
        ...mediumCore,
        run('Site Health Check'),
        run('Production Content Lint'),
        dispatchedRun('P0 Visual Proof', 'in_progress', null),
      ],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['app/research/page.tsx'],
    })
    expect(pending.action).toBe('wait')
    expect(pending.reason).toContain('P0 Visual Proof')

    const green = evaluateReadiness({
      pr,
      workflowRuns: [
        ...mediumCore,
        run('Site Health Check'),
        run('Production Content Lint'),
        dispatchedRun('P0 Visual Proof'),
      ],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['app/research/page.tsx'],
    })
    expect(green.action).toBe('merge')
  })

  it('accepts canonical workflow_dispatch evidence on the exact current head with base freshness proven separately', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        dispatchedRun('CI'),
        dispatchedRun('Atomic upgrade gate'),
        dispatchedRun('Build quality regression'),
        dispatchedRun('Site Health Check'),
        dispatchedRun('Production Content Lint'),
      ],
      checkRuns: [],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'high',
      changedFiles: ['scripts/ci/autonomous-merge-controller.mjs'],
    })
    expect(verdict.action).toBe('merge')
  })

  it('rejects dispatched evidence from a different head', () => {
    const wrongHeadRun = { ...dispatchedRun('CI'), head_sha: 'other-head' }
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        wrongHeadRun,
        dispatchedRun('Atomic upgrade gate'),
        dispatchedRun('Build quality regression'),
        dispatchedRun('Site Health Check'),
        dispatchedRun('Production Content Lint'),
      ],
      checkRuns: [],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'high',
      changedFiles: ['scripts/ci/autonomous-merge-controller.mjs'],
    })
    expect(verdict.action).toBe('wait')
    expect(verdict.reason).toContain('required workflow base proof missing')
  })

  it('ignores an optional action-required workflow shell for medium risk once required evidence is green', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        ...mediumCore,
        run('Research Distribution'),
        run('Lighthouse CI', 'completed', 'action_required'),
      ],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['scripts/distribution/render-carousel-svg.mjs'],
    })
    expect(verdict.action).toBe('merge')
  })

  it('does not ignore action-required on a required medium workflow', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [
        ...mediumCore,
        run('Research Distribution', 'completed', 'action_required'),
      ],
      checkRuns: [check('Validation, tests, and data')],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'medium',
      changedFiles: ['scripts/distribution/render-carousel-svg.mjs'],
    })
    expect(verdict.action).toBe('failed')
  })

  it('waits for the validation job on medium risk even when targeted workflows are green', () => {
    const verdict = evaluateReadiness({
      pr,
      workflowRuns: [...mediumCore, run('Research Distribution')],
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

  it('does not let the optional Cloudflare Pages PR preview hold a high-risk merge hostage', () => {
    for (const [status, conclusion] of [
      ['in_progress', null],
      ['completed', 'failure'],
    ]) {
      const verdict = evaluateReadiness({
        pr,
        workflowRuns: highRequired,
        checkRuns: [
          check('Validation, tests, and data', 'completed', 'success', 10),
          check('Production build, output, and SEO', 'completed', 'success', 11),
          externalCheck('Cloudflare Pages', 'cloudflare-workers-and-pages', status, conclusion, 12),
        ],
        expectedHeadSha: headSha,
        currentBaseSha: baseSha,
        controllerRunId: 'controller',
        riskTier: 'high',
        changedFiles: ['.github/workflows/autonomous-merge-controller.yml'],
      })
      expect(verdict.action).toBe('merge')
    }
  })

  it('keeps unknown third-party checks fail-closed for high-risk changes', () => {
    const pending = evaluateReadiness({
      pr,
      workflowRuns: highRequired,
      checkRuns: [
        check('Validation, tests, and data', 'completed', 'success', 10),
        externalCheck('Vendor Security Gate', 'unknown-security-app', 'in_progress', null, 20),
      ],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'high',
      changedFiles: ['.github/workflows/autonomous-merge-controller.yml'],
    })
    expect(pending.action).toBe('wait')
    expect(pending.reason).toContain('high-risk checks pending')

    const failed = evaluateReadiness({
      pr,
      workflowRuns: highRequired,
      checkRuns: [
        check('Validation, tests, and data', 'completed', 'success', 10),
        externalCheck('Vendor Security Gate', 'unknown-security-app', 'completed', 'failure', 21),
      ],
      expectedHeadSha: headSha,
      currentBaseSha: baseSha,
      controllerRunId: 'controller',
      riskTier: 'high',
      changedFiles: ['.github/workflows/autonomous-merge-controller.yml'],
    })
    expect(failed.action).toBe('failed')
    expect(failed.reason).toContain('known check failure')
  })

})

describe('P0 zero-job bot refresh recovery routing', () => {
  const zeroJob={id:42,name:'CI',event:'pull_request',status:'completed',conclusion:'action_required'}
  const confirmed=new Set([42])
  it('dispatches a missing workflow but never assumes a zero-job stub is validated', () => {
    expect(shouldDispatchRegisteredWorkflow('CI',[])).toBe(true)
    expect(shouldDispatchRegisteredWorkflow('CI',[zeroJob])).toBe(false)
    expect(shouldDispatchRegisteredWorkflow('CI',[zeroJob],confirmed)).toBe(true)
  })
  it('refuses to replace real failed, successful or pending workflow results', () => {
    for(const state of [
      {...zeroJob,conclusion:'failure'},
      {...zeroJob,conclusion:'success'},
      {...zeroJob,status:'in_progress',conclusion:null},
      {...zeroJob,event:'workflow_dispatch',conclusion:'success'},
    ]){
      expect(shouldDispatchRegisteredWorkflow('CI',[state],confirmed)).toBe(false)
    }
  })
  it('fails closed for a mixed zero-job and real workflow, including a prior recovery', () => {
    const another={...zeroJob,id:43,conclusion:'success'}
    expect(shouldDispatchRegisteredWorkflow('CI',[zeroJob,another],new Set([42,43]))).toBe(false)
    expect(shouldDispatchRegisteredWorkflow('CI',[
      zeroJob,{...zeroJob,id:44,event:'workflow_dispatch',status:'in_progress',conclusion:null},
    ],new Set([42,44]))).toBe(false)
  })
  it('requires zero-job proof for EVERY bot-suppressed same-name run', () => {
    const both=[zeroJob,{...zeroJob,id:43}]
    expect(shouldDispatchRegisteredWorkflow('CI',both,new Set([42]))).toBe(false)
    expect(shouldDispatchRegisteredWorkflow('CI',both,new Set([42,43]))).toBe(true)
  })
  it('scopes to the exact workflow and ignores unrelated suppression records', () => {
    expect(shouldDispatchRegisteredWorkflow('CI',[{...zeroJob,name:'Site Health Check'}])).toBe(true)
    expect(shouldDispatchRegisteredWorkflow('CI',[zeroJob,{...zeroJob,id:55,name:'Site Health Check'}],confirmed)).toBe(true)
  })
})

describe('P0 source-register exact-head workflow recovery', () => {
  const recoveryPr={number:6437,base:{ref:'main'},head:{sha:'a'.repeat(40)}}
  it('passes explicit PR, base and full head to the source-register recovery',()=>{
    expect(recoveryInputsFor('Research Source Register Integration',recoveryPr)).toEqual({
      recovery_pr_number:'6437',
      recovery_base_ref:'main',
      recovery_head_sha:'a'.repeat(40),
    })
  })
  it('retains the original inputs and lack of implicit authority in unrelated jobs',()=>{
    expect(recoveryInputsFor('CI',recoveryPr)).toEqual({recovery_pr_number:'6437'})
    expect(recoveryInputsFor('Atomic upgrade gate',recoveryPr)).toEqual({
      recovery_pr_number:'6437',recovery_base_ref:'main',
    })
    expect(recoveryInputsFor('Unexpected workflow',recoveryPr)).toBeNull()
  })
  it('only permits workflow dispatch through the original scientific validator path',()=>{
    const yaml=fs.readFileSync(path.join(process.cwd(),
      '.github/workflows/research-source-register-integration.yml'),'utf8')
    const proof=yaml.indexOf('Prove exact pull-request head and base before recovery execution')
    const checkout=yaml.indexOf('actions/checkout@v4')
    expect(yaml).toContain('workflow_dispatch:')
    expect(yaml).toContain('recovery_head_sha:')
    expect(yaml).toContain('pull-requests: read')
    expect(yaml).toContain('RECOVERY_HEAD_SHA')
    expect(yaml).toContain('pr_repo')
    expect(yaml).toContain('refs/heads/$pr_branch')
    expect(proof).toBeGreaterThan(0)
    expect(checkout).toBeGreaterThan(proof)
    expect(yaml).toContain('validate-research-intelligence-studio.ts')
    expect(yaml).toContain('validate-research-semantic-network.ts')
    expect(yaml).toContain('validate-research-source-register.mjs')
    expect(yaml).toContain('npm run typecheck')
  })
})

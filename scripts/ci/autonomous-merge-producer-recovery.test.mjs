import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  CI_OWNED_RECOVERY_CONSUMERS,
  evaluateReadiness,
  planRecoveryDispatch,
  shouldDispatchRegisteredWorkflow,
  workflowRunView,
} from './autonomous-merge-controller.mjs'

const sha = 'a'.repeat(40)
const otherSha = 'b'.repeat(40)
const consumers = [
  'Build Check',
  'Lighthouse CI',
  'Production Content Lint',
  'P0 Visual Proof',
  'Production Content Invariants',
  'Crawl Governance',
  'Schema and Media Governance',
  'Technical SEO Monitor',
]
const original = (name) => ({ name, workflow_id: 1 })
const realCI = (status = 'in_progress', conclusion = null, head_sha = sha) =>
  ({ name: 'CI', event: 'workflow_dispatch', status, conclusion, head_sha, id: 1 })
const suppressed = (name, id, head_sha = sha) =>
  ({ name, event: 'pull_request', status: 'completed', conclusion: 'action_required', head_sha, id })

describe('P0 #6447: one exact-head CI producer for recovery fan-out', () => {
  it('has exactly the eight governed artifact consumers used by CI fan-out', () => {
    expect([...CI_OWNED_RECOVERY_CONSUMERS].sort()).toEqual([...consumers].sort())
    const ci = fs.readFileSync('.github/workflows/ci.yml', 'utf8')
    for (const name of [
      'production-content-invariants.yml', 'crawl-governance.yml',
      'schema-media-governance.yml', 'technical-seo-monitor.yml',
    ]) expect(ci).toContain(`consumers+=(${name})`)
    expect(ci).toContain('governed-static-export.mjs write')
  })

  it('dispatches CI first and defers all same-head artifact consumers, but keeps independent checks', () => {
    const registered = [
      ...consumers.map(original),
      original('Research Source Register Integration'),
      original('Atomic upgrade gate'),
      original('CI'),
    ]
    const plan = planRecoveryDispatch(registered, [], new Set(), sha)
    expect(plan.ciOwnsFanout).toBe(true)
    expect(plan.direct.map(r => r.name)).toEqual([
      'CI', 'Research Source Register Integration', 'Atomic upgrade gate',
    ])
    expect(plan.deferred.map(r => r.name)).toEqual(consumers)
  })

  it('defers consumers when the exact-head CI producer is already in flight', () => {
    const plan = planRecoveryDispatch(consumers.map(original), [realCI()], new Set(), sha)
    expect(plan.ciOwnsFanout).toBe(true)
    expect(plan.direct).toEqual([])
    expect(plan.deferred.map(r => r.name)).toEqual(consumers)
  })

  it('does not defer if no CI producer or canonical CI recovery is registered', () => {
    const plan = planRecoveryDispatch(consumers.map(original), [], new Set(), sha)
    expect(plan.ciOwnsFanout).toBe(false)
    expect(plan.direct.map(r => r.name)).toEqual(consumers)
    expect(plan.deferred).toEqual([])
  })

  it('does not trust a CI run from another head, or a failed CI on the correct head', () => {
    for (const observed of [[realCI('in_progress', null, otherSha)], [realCI('completed', 'failure')]]) {
      const plan = planRecoveryDispatch(consumers.map(original), observed, new Set(), sha)
      expect(plan.direct.map(r => r.name)).toEqual(consumers)
      expect(plan.deferred).toEqual([])
    }
  })

  it('keeps actual completed CI green as producer authority, not a consumer PASS', () => {
    const plan = planRecoveryDispatch(
      [original('Production Content Invariants'), original('Technical SEO Monitor')],
      [realCI('completed', 'success')], new Set(), sha,
    )
    expect(plan.direct).toEqual([])
    expect(plan.deferred.map(x => x.name)).toEqual([
      'Production Content Invariants', 'Technical SEO Monitor',
    ])
  })

  it('preserves genuine same-head consumer completions and pending/failing records', () => {
    for (const run of [
      { name: 'Build Check', head_sha: sha, event: 'workflow_dispatch', status: 'completed', conclusion: 'success' },
      { name: 'Build Check', head_sha: sha, event: 'workflow_dispatch', status: 'in_progress', conclusion: null },
      { name: 'Build Check', head_sha: sha, event: 'workflow_dispatch', status: 'completed', conclusion: 'failure' },
    ]) {
      const plan = planRecoveryDispatch([original('CI'), original('Build Check')], [run], new Set(), sha)
      expect(plan.direct.map(x => x.name)).toEqual(['CI'])
      expect(plan.deferred).toEqual([])
    }
  })

  it('retains every same-head same-name run before verifying zero-job evidence', () => {
    const priorReal = {
      name: 'Build Check', head_sha: sha, id: 41,
      event: 'workflow_dispatch', status: 'completed', conclusion: 'failure',
      run_number: 12, run_attempt: 1,
    }
    const latestSuppressed = {
      ...suppressed('Build Check', 42),
      run_number: 13, run_attempt: 1,
    }
    const all = workflowRunView([priorReal, latestSuppressed], true)
    expect(all).toHaveLength(2)
    expect(shouldDispatchRegisteredWorkflow('Build Check', all, new Set([42]))).toBe(false)
    expect(planRecoveryDispatch([original('Build Check')], all, new Set([42]), sha).direct).toEqual([])
    expect(workflowRunView(all)).toEqual([latestSuppressed])
    const source = fs.readFileSync('scripts/ci/autonomous-merge-controller.mjs', 'utf8')
    expect(source).toContain('getWorkflowRuns(repo, pr.head.sha, { preserveAll: true })')
  })

  it('refuses recovery unless every action_required record is verified jobless', () => {
    const matched = [suppressed('Build Check', 7), suppressed('Build Check', 8)]
    const observed = [...matched]
    expect(shouldDispatchRegisteredWorkflow('Build Check', observed, new Set([7]))).toBe(false)
    expect(shouldDispatchRegisteredWorkflow('Build Check', observed, new Set([7, 8]))).toBe(true)
    const blocked = planRecoveryDispatch([original('Build Check')], observed, new Set([7]), sha)
    expect(blocked.direct).toEqual([])
  })

  it('does not treat suppressed artifacts as successful/mergeable', () => {
    const pr = {
      number: 6447, state: 'open', draft: false,
      mergeable: true, mergeable_state: 'clean', labels: [],
      head: { sha, repo: { full_name: 'owner/repo' } },
      base: { sha: otherSha, repo: { full_name: 'owner/repo' } },
    }
    const mandatory = ['CI', 'Atomic upgrade gate', 'Build quality regression', 'Site Health Check', 'Production Content Lint']
      .map(name => ({ name, status: 'completed', conclusion: 'success', event: 'pull_request', head_sha: sha, pull_requests: [{ number: 6447, base: { sha: otherSha } }] }))
    const verdict = evaluateReadiness({
      pr, workflowRuns: [...mandatory, suppressed('Technical SEO Monitor', 40)],
      checkRuns: [{ id: 1, name: 'Validation, tests, and data', status: 'completed', conclusion: 'success', app: { slug: 'github-actions' } }],
      expectedHeadSha: sha, currentBaseSha: otherSha,
      controllerRunId: 'controller', riskTier: 'high',
      changedFiles: ['scripts/ci/autonomous-merge-controller.mjs'],
    })
    expect(verdict.action).not.toBe('merge')
  })

  it('preserves existing canonical sequencing and exact-head check boundary', () => {
    const source = fs.readFileSync('scripts/ci/autonomous-merge-controller.mjs', 'utf8')
    expect(source).toContain('planRecoveryDispatch(registered, existingRuns, verifiedZeroJobIds, pr.head.sha)')
    expect(source).toContain('for (const run of plan.direct) await dispatchWorkflowRun(repo, run, pr)')
    expect(source).toContain('const otherRuns = !ciInFailedRuns')
    expect(source).toContain('run.head_sha === pr.head.sha')
    expect(source).toContain('DISPATCH_EVENTS.has(run.event)')
    expect(source).toContain('const directRuns = (ciOwnsFanout')
    expect(source).not.toContain('return { action: \'merge\', reason: \'CI dispatched\' }')
  })
})

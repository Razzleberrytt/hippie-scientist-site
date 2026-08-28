import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('autonomous merge controller contract', () => {
  it('runs privileged orchestration only from the trusted base workflow and never PR code', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')

    expect(workflow).toContain('pull_request_target:')
    expect(workflow).toContain("github.event.pull_request.head.repo.full_name == github.repository")
    expect(workflow).toContain('ref: ${{ github.event.repository.default_branch }}')
    expect(workflow).toContain('persist-credentials: false')
    expect(workflow).not.toContain('ref: ${{ github.event.pull_request.head.sha }}')
    expect(workflow).not.toContain('github.event.pull_request.head.ref')
  })

  it('has only the permissions needed to inspect checks, retry transient actions, refresh/merge, and dispatch canonical recovery workflows', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')

    expect(workflow).toContain('actions: write')
    expect(workflow).toContain('checks: read')
    expect(workflow).toContain('contents: write')
    expect(workflow).toContain('pull-requests: write')
    expect(workflow).not.toContain('issues: write')
    expect(workflow).not.toContain('deployments: write')
  })

  it('keeps high-risk workflow/check evidence fail-closed against current base', () => {
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    for (const workflowName of [
      'CI',
      'Site Health Check',
      'Atomic upgrade gate',
      'Production Content Lint',
      'Build quality regression',
    ]) {
      expect(controller).toContain(`'${workflowName}'`)
    }

    expect(controller).toContain('required workflows not registered yet')
    expect(controller).toContain('required workflow base proof missing')
    expect(controller).toContain('workflow evidence targets stale base')
    expect(controller).toContain('required workflows pending')
    expect(controller).toContain('known workflow failure')
    expect(controller).toContain('high-risk workflows pending')
    expect(controller).toContain('known check failure')
    expect(controller).toContain('high-risk checks pending')
    expect(controller).toContain('high-risk exact head is fully terminal-green against current base')
  })

  it('fails closed for drafts, forks, conflicts, moved heads, and explicit holds', () => {
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    expect(controller).toContain("if (pr.draft) return { action: 'stop'")
    expect(controller).toContain('fork PRs are never privileged-auto-merged')
    expect(controller).toContain('PR head moved; newer controller owns it')
    expect(controller).toContain("pr.mergeable_state === 'dirty'")
    expect(controller).toContain("'hold-merge'")
    expect(controller).toContain("'do-not-merge'")
    expect(controller).toContain("'manual-merge'")
  })

  it('refreshes stale branches and immediately dispatches the same canonical validation set on the new exact head', () => {
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    expect(controller).toContain("pr.mergeable_state === 'behind'")
    expect(controller).toContain('pr.base.sha !== currentBaseSha')
    expect(controller).toContain('update branch and revalidate exact head')
    expect(controller).toContain('/pulls/${number}/update-branch')
    expect(controller).toContain('expected_head_sha: expectedHeadSha')
    expect(controller).toContain('/actions/workflows/${run.workflow_id}/dispatches')
    expect(controller).toContain("DISPATCH_EVENTS = new Set(['pull_request', 'workflow_dispatch'])")
    expect(controller).toContain('base refreshed; canonical workflows dispatched on the new exact head')
    expect(controller).toContain('headContainsBase')
    expect(controller).not.toContain('synchronize event will own the new exact head')
  })

  it('makes the canonical workflows used by refresh recovery dispatchable without dropping PR context', () => {
    for (const workflowPath of [
      '.github/workflows/ci.yml',
      '.github/workflows/check.yml',
      '.github/workflows/production-content-lint.yml',
      '.github/workflows/atomic-upgrade-gate.yml',
      '.github/workflows/build-quality-regression.yml',
    ]) {
      expect(read(workflowPath)).toContain('workflow_dispatch:')
    }

    const atomic = read('.github/workflows/atomic-upgrade-gate.yml')
    const buildQuality = read('.github/workflows/build-quality-regression.yml')
    const productionLint = read('.github/workflows/production-content-lint.yml')
    expect(atomic).toContain('recovery_pr_number')
    expect(atomic).toContain('recovery_base_ref')
    expect(buildQuality).toContain('recovery_pr_number')
    expect(buildQuality).toContain('recovery_base_ref')
    expect(productionLint).toContain('recovery_pr_number')
    for (const workflow of [atomic, buildQuality, productionLint]) {
      expect(workflow).toContain('pull-requests: read')
      expect(workflow).toContain('gh api')
    }
  })

  it('classifies only zero-job pull-request action_required failures as dispatch-recoverable', () => {
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    expect(controller).toContain("run.event === 'pull_request'")
    expect(controller).toContain("run.conclusion === 'action_required'")
    expect(controller).toContain('getRunJobs')
    expect(controller).toContain('jobs.length !== 0')
    expect(controller).toContain('zero-job control-plane failure recovered through canonical workflow dispatch')
  })

  it('serializes the mutation step and rechecks base immediately before merge', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    expect(workflow).toContain('name: merge-controller-monitor')
    expect(workflow).toContain("CHECK_ONLY: 'true'")
    expect(workflow).toContain("needs.merge-controller.outputs.ready == 'true'")
    expect(workflow).toContain('group: autonomous-merge-commit')
    expect(workflow).toContain('cancel-in-progress: false')
    expect(controller).toContain('mergeIfStillCurrent')
    expect(controller).toContain('latestBaseSha !== validatedBaseSha')
    expect(controller).toContain('refreshPrAndDispatch')
    expect(controller).toContain('await mergePr(repo, number, headSha)')
    expect(controller).toContain('validatedBaseSha')
  })

  it('retries only bounded non-semantic workflow outcomes and never generic failures', () => {
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    for (const conclusion of ['cancelled', 'timed_out', 'stale', 'startup_failure']) {
      expect(controller).toContain(`'${conclusion}'`)
    }
    expect(controller).toContain('Number(run.run_attempt || 1) >= 2')
    expect(controller).toContain('/rerun-failed-jobs')
    expect(controller).not.toContain("TRANSIENT_CONCLUSIONS = new Set(['failure'")
  })

  it('continues without chat through a long-running monitor and scheduled fallback sweep', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    expect(workflow).toContain("cron: '*/10 * * * *'")
    expect(workflow).toContain('timeout-minutes: 180')
    expect(workflow).toContain("MERGE_MAX_WAIT_MINUTES: '165'")
    expect(workflow).toContain("SWEEP_OPEN_PRS: 'true'")
    expect(controller).toContain('Fallback sweep complete')
    expect(controller).toContain('fallback sweep will continue ownership')
  })

  it('preserves direct-main deploy as primary and dispatches only when a controller merge lacks a deploy run', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')
    const deploy = read('.github/workflows/deploy.yml')

    expect(deploy).toContain('push:')
    expect(deploy).toContain('- main')
    expect(deploy).toContain('workflow_dispatch:')
    expect(workflow).toContain('Ensure merged PR enters deploy lifecycle')
    expect(workflow).toContain('pulls/$PR_NUMBER')
    expect(workflow).toContain('if [ "$merged" != "true" ]')
    expect(workflow).toContain('actions/runs?head_sha=$main_sha')
    expect(workflow).toContain('select(.name == "Deploy to Cloudflare Pages")')
    expect(workflow).toContain('actions/workflows/deploy.yml/dispatches')
    expect(workflow).toContain('if [ "$deploy_count" -eq 0 ]')
  })
})

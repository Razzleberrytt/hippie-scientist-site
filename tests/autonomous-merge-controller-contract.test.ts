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

  it('has only the permissions needed to inspect checks, retry transient actions, and merge', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')

    expect(workflow).toContain('actions: write')
    expect(workflow).toContain('checks: read')
    expect(workflow).toContain('contents: write')
    expect(workflow).toContain('pull-requests: write')
    expect(workflow).not.toContain('issues: write')
    expect(workflow).not.toContain('deployments: write')
  })

  it('requires the universal workflow set and every triggered exact-head check to be green', () => {
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
    expect(controller).toContain('workflow runs pending')
    expect(controller).toContain('workflow runs failed')
    expect(controller).toContain('checks pending')
    expect(controller).toContain('checks failed')
    expect(controller).toContain('all universal workflows and every triggered exact-head check are terminal-green')
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

  it('retries only bounded non-semantic workflow outcomes and never generic failures', () => {
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    for (const conclusion of ['cancelled', 'timed_out', 'stale', 'startup_failure']) {
      expect(controller).toContain(`'${conclusion}'`)
    }
    expect(controller).toContain('Number(run.run_attempt || 1) >= 2')
    expect(controller).toContain('/rerun-failed-jobs')
    expect(controller).not.toContain("TRANSIENT_CONCLUSIONS = new Set(['failure'")
  })

  it('continues without chat through a long-running controller and scheduled fallback sweep', () => {
    const workflow = read('.github/workflows/autonomous-merge-controller.yml')
    const controller = read('scripts/ci/autonomous-merge-controller.mjs')

    expect(workflow).toContain("cron: '*/10 * * * *'")
    expect(workflow).toContain('timeout-minutes: 180')
    expect(workflow).toContain("MERGE_MAX_WAIT_MINUTES: '165'")
    expect(workflow).toContain("SWEEP_OPEN_PRS: 'true'")
    expect(controller).toContain('Fallback sweep complete')
    expect(controller).toContain('fallback sweep will continue ownership')
  })
})

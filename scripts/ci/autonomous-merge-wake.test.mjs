import fs from 'node:fs'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { describe, expect, it, vi } from 'vitest'
import { resolveWake } from './autonomous-merge-wake.mjs'

const repo = 'owner/repo'
const sha = 'a'.repeat(40)
const pr = { number: 42, state: 'open', draft: false, head: { sha, repo: { full_name: repo } } }
const run = { status: 'completed', conclusion: 'success', event: 'workflow_dispatch', head_sha: sha, head_repository: { full_name: repo } }
const wake = (event, get = vi.fn(async () => [pr]), eventName = 'workflow_run') => resolveWake({ event, get, repo, eventName })

describe('controller wake classification', () => {
  it.each(['failure', 'cancelled', 'skipped', 'timed_out', 'action_required'])('does no API work for %s completion; recovery remains scheduled', async conclusion => {
    const get = vi.fn()
    expect(await wake({ workflow_run: { ...run, conclusion } }, get)).toMatchObject({ proceed: false })
    expect(get).not.toHaveBeenCalled()
  })
  it.each(['push', 'schedule', 'workflow_run'])('ignores %s upstream events without a broad PR sweep', async event => {
    const get = vi.fn()
    expect(await wake({ workflow_run: { ...run, event } }, get)).toMatchObject({ proceed: false, sweep: false })
    expect(get).not.toHaveBeenCalled()
  })
  it('does not trust a foreign producer', async () => {
    const get = vi.fn()
    expect(await wake({ workflow_run: { ...run, head_repository: { full_name: 'fork/repo' } } }, get)).toMatchObject({ proceed: false })
    expect(get).not.toHaveBeenCalled()
  })
  it.each(['pull_request', 'workflow_dispatch'])('targets current SHA of %s completion without emitting another dispatch', async event => {
    const get = vi.fn(async () => [pr])
    expect(await wake({ workflow_run: { ...run, event } }, get)).toMatchObject({ proceed: true, sweep: false, pr_number: '42', head_sha: sha })
    expect(get).toHaveBeenCalledExactlyOnceWith(`/repos/${repo}/commits/${sha}/pulls?per_page=100&page=1`)
  })
  it.each([
    [], [{ ...pr, state: 'closed' }], [{ ...pr, draft: true }],
    [{ ...pr, head: { ...pr.head, sha: 'b'.repeat(40) } }],
    [{ ...pr, head: { ...pr.head, repo: { full_name: 'fork/repo' } } }], [pr, { ...pr, number: 43 }],
  ])('rejects missing, stale, closed, draft, fork or ambiguous targets', async (...rows) => {
    // Each parameter is a candidate array, including the empty case.
    expect(await wake({ workflow_run: run }, async () => rows)).toMatchObject({ proceed: false, sweep: false })
  })
  it('keeps scheduled and explicit untargeted recovery, but never turns malformed targets into a sweep', async () => {
    expect(await wake({}, undefined, 'schedule')).toMatchObject({ proceed: true, sweep: true })
    expect(await wake({}, undefined, 'workflow_dispatch')).toMatchObject({ proceed: true, sweep: true })
    for (const inputs of [{ pr_number: '42' }, { expected_head_sha: sha }, { pr_number: '42\nINJECT=true', expected_head_sha: sha }]) {
      expect(await wake({ inputs }, undefined, 'workflow_dispatch')).toMatchObject({ proceed: false, sweep: false })
    }
  })
  it('rechecks explicitly targeted manual wakes and fails closed on lookup errors', async () => {
    const event = { inputs: { pr_number: '42', expected_head_sha: sha } }
    expect(await wake(event, async () => pr, 'workflow_dispatch')).toMatchObject({ proceed: true, sweep: false })
    expect(await wake(event, async () => ({ ...pr, state: 'closed' }), 'workflow_dispatch')).toMatchObject({ proceed: false })
    await expect(wake(event, async () => { throw new Error('API unavailable') }, 'workflow_dispatch')).rejects.toThrow('API unavailable')
  })
  it('preserves serialization, bounded recovery and the existing merge gate authority', () => {
    const workflow = fs.readFileSync('.github/workflows/autonomous-merge-controller.yml', 'utf8')
    expect(workflow).not.toContain('cancel-in-progress: true')
    expect(workflow).toContain('group: autonomous-merge-commit')
    expect(workflow).toContain("CONTROLLER_SINGLE_PASS: 'true'")
    expect(workflow).toContain("cron: '*/10 * * * *'")
    expect(workflow).toContain("if: steps.wake.outputs.proceed == 'true'")
    expect(workflow).toContain("if: github.event_name != 'workflow_run' || steps.reconcile.outputs.merged == 'true'")
  })
  it('exits after one pending evaluation without reserving a runner or mutating GitHub', async () => {
    const requests = []
    const server = http.createServer((request, response) => {
      requests.push({ method: request.method, url: request.url })
      response.setHeader('Content-Type', 'application/json')
      const url = request.url
      if (url === `/repos/${repo}/pulls/42`) response.end(JSON.stringify({ ...pr, mergeable: true, labels: [], base: { ref: 'main', sha: 'base', repo: { full_name: repo } } }))
      else if (url.includes('/actions/runs?')) response.end(JSON.stringify({ workflow_runs: [] }))
      else if (url.includes('/check-runs?')) response.end(JSON.stringify({ check_runs: [] }))
      else if (url.includes('/files?')) response.end(JSON.stringify([{ filename: 'scripts/ci/autonomous-merge-controller.mjs' }]))
      else if (url.includes('/branches/main')) response.end(JSON.stringify({ commit: { sha: 'base' } }))
      else if (url.includes('/compare/')) response.end(JSON.stringify({ status: 'ahead' }))
      else { response.statusCode = 500; response.end('{}') }
    })
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    try {
      const result = await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['scripts/ci/autonomous-merge-controller.mjs'], { env: {
          ...process.env, GITHUB_API_URL: `http://127.0.0.1:${server.address().port}`, GITHUB_TOKEN: 'fixture',
          GITHUB_REPOSITORY: repo, PR_NUMBER: '42', EXPECTED_HEAD_SHA: sha,
          CONTROLLER_SINGLE_PASS: 'true', SWEEP_OPEN_PRS: 'false', GITHUB_OUTPUT: '',
        }, stdio: ['ignore', 'pipe', 'pipe'] })
        let output = ''
        child.stdout.on('data', data => { output += data })
        child.stderr.on('data', data => { output += data })
        const timeout = setTimeout(() => { child.kill(); reject(new Error('Single-pass controller polled instead of returning')) }, 5000)
        child.on('error', error => { clearTimeout(timeout); reject(error) })
        child.on('exit', code => { clearTimeout(timeout); resolve({ code, output }) })
      })
      expect(result.code, result.output).toBe(0)
      expect(result.output).toContain('required workflows not registered yet')
      expect(requests.filter(request => request.url === `/repos/${repo}/pulls/42`)).toHaveLength(1)
      expect(requests.every(request => request.method === 'GET')).toBe(true)
    } finally { await new Promise(resolve => server.close(resolve)) }
  })
})

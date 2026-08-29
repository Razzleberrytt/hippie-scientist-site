import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const servers = []
const tempFiles = []

afterEach(async () => {
  for (const server of servers.splice(0)) {
    await new Promise((resolve) => server.close(resolve))
  }
  for (const file of tempFiles.splice(0)) {
    try { fs.unlinkSync(file) } catch {}
  }
})

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve(server.address())
    })
  })
}

function runMonitor(env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/ci/autonomous-merge-monitor.mjs'], {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.once('error', reject)
    child.once('close', (code) => resolve({ code, stdout, stderr }))
  })
}

describe('read-only autonomous merge monitor', () => {
  it('defers stale-base refresh to the serialized fallback without writing', async () => {
    const requests = []
    const server = http.createServer((req, res) => {
      requests.push({ method: req.method, url: req.url })
      res.setHeader('content-type', 'application/json')

      if (req.url === '/repos/owner/repo/pulls/1') {
        res.end(JSON.stringify({
          number: 1,
          state: 'open',
          draft: false,
          mergeable: true,
          mergeable_state: 'clean',
          labels: [],
          head: { sha: 'head', repo: { full_name: 'owner/repo' } },
          base: { ref: 'main', sha: 'old-base', repo: { full_name: 'owner/repo' } },
        }))
        return
      }
      if (req.url === '/repos/owner/repo/branches/main') {
        res.end(JSON.stringify({ commit: { sha: 'new-base' } }))
        return
      }
      if (req.url?.startsWith('/repos/owner/repo/actions/runs?head_sha=head')) {
        res.end(JSON.stringify({ workflow_runs: [] }))
        return
      }
      if (req.url?.startsWith('/repos/owner/repo/commits/head/check-runs')) {
        res.end(JSON.stringify({ check_runs: [] }))
        return
      }
      if (req.url?.startsWith('/repos/owner/repo/pulls/1/files?')) {
        res.end(JSON.stringify([]))
        return
      }
      if (req.url?.startsWith('/repos/owner/repo/compare/new-base...head')) {
        res.end(JSON.stringify({ status: 'behind' }))
        return
      }

      res.statusCode = 404
      res.end(JSON.stringify({ message: 'unexpected test request' }))
    })
    servers.push(server)
    const address = await listen(server)
    const output = path.join(os.tmpdir(), `merge-monitor-${process.pid}-${Date.now()}.out`)
    tempFiles.push(output)

    const result = await runMonitor({
      GITHUB_API_URL: `http://127.0.0.1:${address.port}`,
      GITHUB_TOKEN: 'test-token',
      GITHUB_REPOSITORY: 'owner/repo',
      PR_NUMBER: '1',
      EXPECTED_HEAD_SHA: 'head',
      CONTROLLER_RUN_ID: 'test-controller',
      GITHUB_OUTPUT: output,
    })

    expect(result.code, result.stderr).toBe(0)
    expect(result.stdout).toContain('base drift is owned by the serialized fallback sweep')
    expect(fs.readFileSync(output, 'utf8')).toContain('ready=false')
    expect(fs.readFileSync(output, 'utf8')).toContain('head_sha=head')
    expect(requests.length).toBeGreaterThan(0)
    expect(requests.every((request) => request.method === 'GET')).toBe(true)
    expect(requests.some((request) => request.url?.includes('/update-branch'))).toBe(false)
    expect(requests.some((request) => request.url?.includes('/dispatches'))).toBe(false)
    expect(requests.some((request) => request.url?.includes('/merge'))).toBe(false)
  })
})

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const auditScript = path.join(process.cwd(), 'scripts/ci/audit-high-with-allowlist.mjs')
const tempDirs = []

function runAuditFixture(mode) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-high-retry-'))
  tempDirs.push(tempDir)
  const counterPath = path.join(tempDir, 'counter.txt')
  const fakeNpmPath = path.join(tempDir, 'fake-npm.mjs')

  fs.writeFileSync(fakeNpmPath, `
import fs from 'node:fs'
const counterPath = process.env.FAKE_AUDIT_COUNTER
let count = 0
try { count = Number(fs.readFileSync(counterPath, 'utf8')) || 0 } catch {}
count += 1
fs.writeFileSync(counterPath, String(count))
const clean = {
  auditReportVersion: 2,
  vulnerabilities: {},
  metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 } },
}
if (process.env.FAKE_AUDIT_MODE === 'transient-then-pass') {
  if (count === 1) {
    console.error('npm error code ERR_INVALID_CHAR Invalid character in header content ["x-fetch-attempts"]')
    process.exit(1)
  }
  console.log(JSON.stringify(clean))
  process.exit(0)
}
if (process.env.FAKE_AUDIT_MODE === 'always-transient') {
  console.error('npm error code ERR_INVALID_CHAR Invalid character in header content ["x-fetch-attempts"]')
  process.exit(1)
}
if (process.env.FAKE_AUDIT_MODE === 'json-error') {
  console.log(JSON.stringify({ error: { code: 'EAI_AGAIN', summary: 'registry unavailable' } }))
  process.exit(1)
}
if (process.env.FAKE_AUDIT_MODE === 'valid-high') {
  console.log(JSON.stringify({
    auditReportVersion: 2,
    vulnerabilities: {
      'definitely-unallowlisted-test-package': {
        name: 'definitely-unallowlisted-test-package',
        severity: 'high',
        via: [{ severity: 'high', url: 'https://example.invalid/GHSA-test' }],
      },
    },
    metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 0, total: 1 } },
  }))
  process.exit(1)
}
console.log(JSON.stringify(clean))
`, 'utf8')

  const result = spawnSync(process.execPath, [auditScript], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_execpath: fakeNpmPath,
      FAKE_AUDIT_COUNTER: counterPath,
      FAKE_AUDIT_MODE: mode,
      NPM_AUDIT_MAX_ATTEMPTS: '2',
      NPM_AUDIT_TIMEOUT_MS: '30000',
    },
  })

  const count = fs.existsSync(counterPath) ? Number(fs.readFileSync(counterPath, 'utf8')) : 0
  return { result, count }
}

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})

describe('high-severity audit transport retry', () => {
  it('recovers when the first transport attempt fails and the second yields a valid report', () => {
    const { result, count } = runAuditFixture('transient-then-pass')
    expect(result.status).toBe(0)
    expect(count).toBe(2)
    expect(result.stderr).toContain('transient audit transport/report failure on attempt 1/2')
    expect(result.stderr).toContain('recovered a valid npm audit report on attempt 2/2')
    expect(result.stdout).toContain('[audit:high] PASS')
  })

  it('fails closed after the bounded attempts are exhausted', () => {
    const { result, count } = runAuditFixture('always-transient')
    expect(result.status).toBe(1)
    expect(count).toBe(2)
    expect(result.stderr).toContain('unable to obtain valid npm audit JSON after 2 attempt(s)')
  })

  it('never treats an npm JSON error payload as a clean audit report', () => {
    const { result, count } = runAuditFixture('json-error')
    expect(result.status).toBe(1)
    expect(count).toBe(2)
    expect(result.stderr).toContain('invalid npm audit report')
  })

  it('fails immediately on a valid unallowlisted high finding instead of retrying it away', () => {
    const { result, count } = runAuditFixture('valid-high')
    expect(result.status).toBe(1)
    expect(count).toBe(1)
    expect(result.stderr).toContain('unallowlisted high/critical vulnerabilities found')
    expect(result.stderr).not.toContain('retrying')
  })
})

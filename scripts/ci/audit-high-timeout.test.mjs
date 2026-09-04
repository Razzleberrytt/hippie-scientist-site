import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'scripts/ci/audit-high-with-allowlist.mjs'), 'utf8')

describe('high-severity audit network bound', () => {
  it('bounds the retry sequence and still fails closed when no valid report arrives', () => {
    expect(source).toContain("process.env.NPM_AUDIT_TIMEOUT_MS || 120_000")
    expect(source).toContain("process.env.NPM_AUDIT_MAX_ATTEMPTS || '2'")
    expect(source).toContain('Math.min(3, Math.max(1')
    expect(source).toContain('Math.floor(auditTimeoutMs / auditMaxAttempts)')
    expect(source).toContain('timeout: auditAttemptTimeoutMs')
    expect(source).toContain("killSignal: 'SIGTERM'")
    expect(source).toContain("auditRun.error.code === 'ETIMEDOUT'")
    expect(source).toContain('transient audit transport/report failure')
    expect(source).toContain('unable to obtain valid npm audit JSON')
    expect(source).toContain("NPM_CONFIG_FETCH_TIMEOUT")
    expect(source).toContain("NPM_CONFIG_FETCH_RETRIES")
    expect(source).toContain('process.exit(1)')
  })

  it('rejects structurally invalid or npm-error JSON instead of treating it as a clean audit', () => {
    expect(source).toContain('Number.isFinite(report?.auditReportVersion)')
    expect(source).toContain('report.vulnerabilities')
    expect(source).toContain('report.metadata')
    expect(source).toContain('report?.error || !structurallyValid')
  })
})

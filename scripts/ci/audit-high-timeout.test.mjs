import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'scripts/ci/audit-high-with-allowlist.mjs'), 'utf8')

describe('high-severity audit network bound', () => {
  it('bounds npm audit and fails closed on timeout', () => {
    expect(source).toContain("process.env.NPM_AUDIT_TIMEOUT_MS || 120_000")
    expect(source).toContain('timeout: auditTimeoutMs')
    expect(source).toContain("killSignal: 'SIGTERM'")
    expect(source).toContain("auditRun.error.code === 'ETIMEDOUT'")
    expect(source).toContain("NPM_CONFIG_FETCH_TIMEOUT")
    expect(source).toContain("NPM_CONFIG_FETCH_RETRIES")
    expect(source).toContain('process.exit(1)')
  })
})

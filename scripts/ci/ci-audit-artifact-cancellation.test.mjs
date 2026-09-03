import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), '.github/workflows/ci.yml'), 'utf8')
const rawAuditStep = source.match(/- name: Generate raw npm audit JSON[\s\S]*?(?=\n {6}- name: Upload audit artifact)/u)?.[0] || ''

describe('CI raw audit artifact cancellation contract', () => {
  it('does not keep a cancelled superseded CI run alive', () => {
    expect(rawAuditStep).toContain('always() && !cancelled()')
  })

  it('bounds artifact-only npm audit network wait', () => {
    expect(rawAuditStep).toContain('timeout-minutes: 2')
    expect(rawAuditStep).toContain("NPM_CONFIG_FETCH_TIMEOUT: '60000'")
    expect(rawAuditStep).toContain("NPM_CONFIG_FETCH_RETRIES: '1'")
    expect(rawAuditStep).toContain('npm audit --json')
  })
})

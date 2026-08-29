import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('deployment authorization boundary', () => {
  it('requires exactly one associated merged PR for the deploy SHA', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain('/commits/${mergeSha}/pulls')
    expect(verifier).toContain('merged.length !== 1')
    expect(verifier).toContain('Direct pushes and ambiguous merge provenance fail closed')
  })

  it('binds authorization to the exact merged PR head', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain("const context = 'autonomous-merge/authorized'")
    expect(verifier).toContain('const headSha = pr.head?.sha')
    expect(verifier).toContain('/commits/${headSha}/status')
    expect(verifier).toContain("item.context === context && item.state === 'success'")
  })

  it('polls briefly so push-triggered deploy cannot race post-merge attestation', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain("DEPLOY_AUTH_ATTEMPTS || '30'")
    expect(verifier).toContain("DEPLOY_AUTH_INTERVAL_MS || '10000'")
    expect(verifier).toContain('await sleep(intervalMs)')
  })
})

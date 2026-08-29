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

  it('accepts a merge performed by the repository owner', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain('const mergedBy = pr.merged_by?.login')
    expect(verifier).toContain('mergedBy.toLowerCase() === owner.toLowerCase()')
    expect(verifier).toContain('merged by repository owner')
  })

  it('checks the owner before polling, so an owner merge does not wait for a receipt that never arrives', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    const ownerAt = verifier.indexOf('mergedBy.toLowerCase() === owner.toLowerCase()')
    const pollAt = verifier.indexOf('for (let attempt = 1')
    expect(ownerAt).toBeGreaterThan(-1)
    expect(pollAt).toBeGreaterThan(-1)
    expect(ownerAt).toBeLessThan(pollAt)
  })

  it('still fails closed for a merge by anyone else without a receipt', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    // The owner branch must not weaken the two things this gate exists for.
    expect(verifier).toContain('merged.length !== 1')
    expect(verifier).toContain('Direct pushes and ambiguous merge provenance fail closed')
    expect(verifier).toContain('rather than the repository owner')
  })

  it('polls briefly so push-triggered deploy cannot race post-merge attestation', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain("DEPLOY_AUTH_ATTEMPTS || '30'")
    expect(verifier).toContain("DEPLOY_AUTH_INTERVAL_MS || '10000'")
    expect(verifier).toContain('await sleep(intervalMs)')
  })
})

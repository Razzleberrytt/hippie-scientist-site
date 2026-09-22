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

  it('binds validation reuse to the exact merged PR head and exact base', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain("const context = 'autonomous-merge/authorized'")
    expect(verifier).toContain("const validatedContext = 'autonomous-merge/validated'")
    expect(verifier).toContain('const headSha = pr.head?.sha')
    expect(verifier).toContain('const baseSha = fullPr.base?.sha')
    expect(verifier).toContain('/commits/${headSha}/status')
    expect(verifier).toContain('item.context === validatedContext')
    expect(verifier).toContain('item.description === expected')
  })

  it('accepts a merge performed by the repository owner', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain('const mergedBy = fullPr.merged_by?.login')
    expect(verifier).toContain('mergedBy.toLowerCase() === owner.toLowerCase()')
    expect(verifier).toContain('merged by repository owner')
  })

  it('reads merged_by from the full PR, not the commit-pulls summary', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    // /commits/{sha}/pulls omits merged_by. Reading it there made every merge
    // look anonymous, so the owner branch could never match and the deploy
    // failed with "merged by an unknown account".
    expect(verifier).toContain('await api(`/pulls/${pr.number}`)')
    expect(verifier).toContain('fullPr.merged_by?.login')
  })

  it('checks the exact-head validation receipt before the owner/manual fallback', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    const validatedAt = verifier.indexOf('findValidatedReceipt(initialStatus')
    const ownerAt = verifier.indexOf('mergedBy.toLowerCase() === owner.toLowerCase()')
    expect(validatedAt).toBeGreaterThan(-1)
    expect(ownerAt).toBeGreaterThan(validatedAt)
  })

  it('still fails closed for a merge by anyone else without a receipt', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    // The owner branch must not weaken the two things this gate exists for.
    expect(verifier).toContain('merged.length !== 1')
    expect(verifier).toContain('Direct pushes and ambiguous merge provenance fail closed')
    expect(verifier).toContain('rather than the repository owner')
  })

  it('permits deploy validation reuse only when both merge tree and validated base are identical', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain('writeOutput')
    expect(verifier).toContain("writeOutput('skip_redundant_validation'")
    expect(verifier).toContain("writeOutput('base_identical'")
    expect(verifier).toContain('api(`/git/commits/${mergeSha}`)')
    expect(verifier).toContain('api(`/git/commits/${headSha}`)')
    expect(verifier).toContain('mergeTree === headTree')
    expect(verifier).toContain('mergeBase === baseSha')
    expect(verifier).toContain("mode: 'validated-head'")
    expect(verifier).toContain('const reusable = treeIdentical && baseIdentical')
    expect(verifier).toContain("mode: 'owner'")
    expect(verifier).toContain('skipRedundantValidation: false')
  })

  it('polls briefly so push-triggered deploy cannot race post-merge attestation', () => {
    const verifier = read('scripts/ci/verify-deploy-authorization.mjs')
    expect(verifier).toContain("DEPLOY_AUTH_ATTEMPTS || '30'")
    expect(verifier).toContain("DEPLOY_AUTH_INTERVAL_MS || '10000'")
    expect(verifier).toContain('await sleep(intervalMs)')
  })
})

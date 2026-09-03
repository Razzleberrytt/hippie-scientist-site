import { describe, expect, it } from 'vitest'
import { classifyRefreshSafety, touchesWorkflowFiles } from './autonomous-merge-safe-entry.mjs'

const basePr = {
  number: 42,
  mergeable_state: 'clean',
  head: { sha: 'head' },
  base: { sha: 'base', ref: 'main' },
}

describe('autonomous merge workflow-refresh safety', () => {
  it('recognizes workflow-control changes exactly under .github/workflows', () => {
    expect(touchesWorkflowFiles(['.github/workflows/ci.yml'])).toBe(true)
    expect(touchesWorkflowFiles(['scripts/ci/worker.mjs', 'docs/ci.md'])).toBe(false)
    expect(touchesWorkflowFiles(['.github/ISSUE_TEMPLATE/bug.yml'])).toBe(false)
  })

  it('permits an already-current workflow-changing PR without mutating its head', () => {
    expect(classifyRefreshSafety({
      pr: basePr,
      changedFiles: ['.github/workflows/ci.yml'],
      currentBaseSha: 'base',
      containsCurrentBase: true,
    })).toEqual({ safe: true, stale: false, reason: 'head already contains current base' })
  })

  it('fails closed instead of update-branch for a stale workflow-changing PR', () => {
    const result = classifyRefreshSafety({
      pr: { ...basePr, mergeable_state: 'behind' },
      changedFiles: ['.github/workflows/ci.yml', 'scripts/ci/helper.mjs'],
      currentBaseSha: 'new-base',
      containsCurrentBase: false,
    })

    expect(result.safe).toBe(false)
    expect(result.stale).toBe(true)
    expect(result.reason).toContain('clean restage')
    expect(result.reason).toContain('refusing bot-authored update-branch')
  })

  it('retains canonical update-branch recovery for ordinary stale PRs', () => {
    const result = classifyRefreshSafety({
      pr: { ...basePr, mergeable_state: 'behind' },
      changedFiles: ['app/page.tsx', 'scripts/seo/report.mjs'],
      currentBaseSha: 'new-base',
      containsCurrentBase: false,
    })

    expect(result).toEqual({
      safe: true,
      stale: true,
      reason: 'ordinary stale PR may use canonical update-branch recovery',
    })
  })

  it('fails closed when exact base/head state cannot be observed', () => {
    expect(classifyRefreshSafety({
      pr: { ...basePr, head: { sha: null } },
      changedFiles: [],
      currentBaseSha: 'base',
      containsCurrentBase: false,
    }).safe).toBe(false)

    expect(classifyRefreshSafety({
      pr: basePr,
      changedFiles: [],
      currentBaseSha: null,
      containsCurrentBase: false,
    }).safe).toBe(false)
  })
})

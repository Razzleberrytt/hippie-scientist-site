import fs from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

import {
  PrReviewConversationBlockedError,
  classifyMergeRejection,
  evaluateReadiness,
  evaluateSweepCandidate,
  mergePr,
} from './autonomous-merge-controller.mjs'

const headSha = 'a'.repeat(40)
const REVIEW = 'A conversation must be resolved before this pull request can be merged.'
const REAL_REJECTION = {
  message: `Repository rule violations found\n\n${REVIEW}\n\n`,
  documentation_url: 'https://docs.github.com/rest/pulls/pulls#merge-a-pull-request',
  status: '405',
}

function mergeError(status, body = REAL_REJECTION) {
  const error = new Error(`PUT /pulls/6450/merge failed (${status})`)
  error.status = status
  error.responseBody = typeof body === 'string' ? body : JSON.stringify(body)
  return error
}

describe('P0 #6451: PR-local review 405 without controller-wide failure', () => {
  it('replays the actual incident: a prefixed two-line rule rejection is BLOCKED in fallback sweep', async () => {
    const request = vi.fn().mockRejectedValue(mergeError(405))
    const result = await evaluateSweepCandidate(() => mergePr('owner/repo', 6450, headSha, request))
    expect(result.action).toBe('blocked')
    expect(result.reason).toContain('unresolved review conversation')
    expect(result.reason).toContain('#6450')
    expect(request).toHaveBeenCalledExactlyOnceWith(
      '/repos/owner/repo/pulls/6450/merge',
      { method: 'PUT', body: { sha: headSha, merge_method: 'merge' } },
    )
  })

  it('also handles GitHub sending only the exact review sentence', async () => {
    const error = mergeError(405, { message: `\n  ${REVIEW}\n`, status: '405' })
    const blocked = classifyMergeRejection(error, 6450)
    expect(blocked).toBeInstanceOf(PrReviewConversationBlockedError)
    expect(blocked.cause).toBe(error)
  })

  it('never catches unrelated 405s or multiple simultaneous rule violations', async () => {
    const failures = [
      mergeError(405, { message: 'This pull request cannot be merged' }),
      mergeError(405, { message: 'Repository rule violations found\n\nA required review is missing.' }),
      mergeError(405, { message: `Repository rule violations found\n\n${REVIEW}\nRequired status check missing.` }),
      mergeError(405, { message: `${REVIEW}\nThe base branch has changed.` }),
      mergeError(405, { message: REVIEW, status: '403' }),
      mergeError(405, 'not-json'),
    ]
    for (const error of failures) {
      expect(classifyMergeRejection(error, 6450)).toBe(error)
      await expect(evaluateSweepCandidate(() =>
        mergePr('owner/repo', 6450, headSha, vi.fn().mockRejectedValue(error)),
      )).rejects.toBe(error)
    }
  })

  it('leaves auth failures and transport failures fatal even with matching body text', async () => {
    for (const error of [
      mergeError(401),
      mergeError(403),
      Object.assign(new Error('network reset'), { code: 'ECONNRESET' }),
    ]) {
      await expect(evaluateSweepCandidate(() =>
        mergePr('owner/repo', 6450, headSha, vi.fn().mockRejectedValue(error)),
      )).rejects.toBe(error)
    }
  })

  it('still merges on a real successful GitHub response using the exact validated head', async () => {
    const request = vi.fn().mockResolvedValue({ merged: true, sha: 'merged-commit' })
    const result = await mergePr('owner/repo', 6450, headSha, request)
    expect(result).toEqual({ merged: true, sha: 'merged-commit' })
    expect(request).toHaveBeenCalledExactlyOnceWith(
      '/repos/owner/repo/pulls/6450/merge',
      { method: 'PUT', body: { sha: headSha, merge_method: 'merge' } },
    )
  })

  it('does not mistake a negative GitHub merge response for success or BLOCKED', async () => {
    const request = vi.fn().mockResolvedValue({ merged: false, message: 'Not merged' })
    await expect(evaluateSweepCandidate(() =>
      mergePr('owner/repo', 6450, headSha, request),
    )).rejects.toThrow('GitHub refused merge for PR #6450')
  })

  it('preserves the existing exact-head preflight before any merge request', () => {
    const pr = {
      number: 6450,
      state: 'open',
      draft: false,
      head: { sha: 'changed-head', repo: { full_name: 'owner/repo' } },
      base: { sha: 'base', repo: { full_name: 'owner/repo' } },
      labels: [],
    }
    const verdict = evaluateReadiness({
      pr, workflowRuns: [], checkRuns: [],
      expectedHeadSha: headSha,
      currentBaseSha: 'base',
      controllerRunId: 'controller',
      riskTier: 'high',
      changedFiles: ['scripts/ci/autonomous-merge-controller.mjs'],
    })
    expect(verdict.action).toBe('stop')
    expect(verdict.reason).toContain('head moved')
  })

  it('handles review-blocked direct follow without treating a 405 as success', () => {
    const controller = fs.readFileSync('scripts/ci/autonomous-merge-controller.mjs', 'utf8')
    expect(controller).toContain('if (!(error instanceof PrReviewConversationBlockedError)) throw error')
    expect(controller).toContain('if (mergeResult && typeof mergeResult === \'object\' && mergeResult.action === \'blocked\')')
    expect(controller).not.toContain('if (error.status === 405) return true')
  })
})

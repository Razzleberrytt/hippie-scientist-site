import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { evaluateSweepCandidate, PrRefreshBlockedError } from './autonomous-merge-controller.mjs'

const controller = fs.readFileSync(path.join(process.cwd(), 'scripts/ci/autonomous-merge-controller.mjs'), 'utf8')

describe('fallback sweep PR-local isolation', () => {
  it('continues to a ready candidate after a conflicting or workflow-changing PR', async () => {
    const verdicts = []
    for (const evaluate of [
      async () => { throw new PrRefreshBlockedError('NEEDS_CLEAN_RESTAGE: merge conflict') },
      async () => { throw new PrRefreshBlockedError('NEEDS_CLEAN_RESTAGE: workflow-changing PR') },
      async () => ({ action: 'merge', headSha: 'validated-head', baseSha: 'validated-base' }),
    ]) verdicts.push(await evaluateSweepCandidate(evaluate))
    expect(verdicts.map(({ action }) => action)).toEqual(['blocked', 'blocked', 'merge'])
    expect(verdicts[2]).toEqual({ action: 'merge', headSha: 'validated-head', baseSha: 'validated-base' })
  })

  it('isolates PR-local blockers raised during terminal merge revalidation', () => {
    expect(controller).toMatch(/const mergeResult = await evaluateSweepCandidate\(\(\) =>[\s\S]*mergeIfStillCurrent/u)
    expect(controller).toContain("mergeResult.action === 'blocked'")
    expect(controller).toContain('continue')
  })

  it.each(['authentication failed', 'rate limited', 'service unavailable', 'unknown 422'])('keeps %s visible as a heartbeat failure', async (message) => {
    const error = new Error(message)
    await expect(evaluateSweepCandidate(async () => { throw error })).rejects.toBe(error)
  })

  it('preserves a failed validation verdict without converting it to merge eligibility', async () => {
    const verdict = { action: 'failed', reason: 'CI failed' }
    expect(await evaluateSweepCandidate(async () => verdict)).toBe(verdict)
  })
})

import { describe, expect, it } from 'vitest'
import { summarize } from './actions-efficiency-report.mjs'

describe('Actions efficiency measurement', () => {
  const run = { id: 1, name: 'CI', head_sha: 'sha', conclusion: 'success', event: 'pull_request', run_attempt: 2 }
  const job = { id: 10, run_id: 1, started_at: '2026-09-25T10:00:00Z', completed_at: '2026-09-25T10:02:00Z', steps: [{ name: 'Build application', conclusion: 'success' }] }
  it('counts unique jobs across attempts and keeps a missing useful denominator unknown', () => {
    const report = summarize({ runs: [run], jobs: [job, job, { ...job, id: 11 }], prs: [] })
    expect(report.approximateJobMinutes).toBe(4)
    expect(report.retryAttempts).toBe(1)
    expect(report.minutesPerUsefulMerge).toBeNull()
    expect(report.runsPerUsefulMerge).toBeNull()
    expect(report.controllerCancellationPercent).toBeNull()
  })
  it('does not count skipped build steps or claim repeated SHA means equivalent validation', () => {
    const report = summarize({ runs: [run, { ...run, id: 2 }], jobs: [job, { ...job, id: 11, run_id: 2, steps: [{ name: 'Production build', conclusion: 'skipped' }] }], prs: [] })
    expect(report.zeroExecutedStepRuns).toBe(1)
    expect(report.buildSteps).toHaveLength(1)
    expect(report.duplicateCandidates).toHaveLength(0)
  })
  it('requires explicitly reviewed useful PR membership rather than treating maintenance as throughput', () => {
    const prs = [1, 2].map(number => ({ number, createdAt: '2026-09-25T09:00:00Z', mergedAt: '2026-09-25T10:00:00Z' }))
    const report = summarize({ runs: [run], jobs: [job], prs, usefulPrNumbers: [2, 999] })
    expect(report.usefulPrNumbers).toEqual([2])
    expect(report.minutesPerUsefulMerge).toBe(2)
    expect(report.minutesPerAllMerges).toBe(1)
    expect(report.mergeTimings[0].readyToMergeMinutes).toBeNull()
    expect(report.mergeTimings[0].mergeToDeployMinutes).toBeNull()
  })
})

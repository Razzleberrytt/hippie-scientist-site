import { describe, expect, it } from 'vitest'
import { reportHeldSourceVerificationQueue } from '../scripts/data/report-held-source-verification-queue.mjs'

describe('held source verification queue', () => {
  it('keeps unregistered held claim sources visible without treating them as verified', () => {
    const report = reportHeldSourceVerificationQueue(process.cwd())

    expect(report.modelVersion).toBe('held-source-verification-queue-v1')
    expect(report.counts.heldProfiles).toBeGreaterThan(0)
    expect(report.counts.heldProfilesWithClaimSourceSignals).toBeGreaterThan(0)
    expect(report.counts.unregisteredCandidates).toBe(report.candidates.length)
    expect(new Set(report.candidates.map((row) => row.slug)).size).toBe(report.candidates.length)

    for (const row of report.candidates) {
      expect(row.slug).toBeTruthy()
      expect(['herb', 'compound']).toContain(row.entityType)
      expect(row.claimCountWithSourceSignals).toBeGreaterThan(0)
    }

    // Keep this in the test log so CI provides a deterministic, reviewable census
    // without baking a fragile exact count into the assertion.
    console.log('[held-source-verification] candidates', report.candidates.map((row) => row.slug).join(','))
    console.log('[held-source-verification] counts', JSON.stringify(report.counts))
  })
})

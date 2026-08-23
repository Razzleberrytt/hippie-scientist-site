import { describe, expect, it } from 'vitest'
import { reportHeldSourceVerificationQueue } from '../scripts/data/report-held-source-verification-queue.mjs'

describe('held source verification queue', () => {
  it('keeps unregistered held source signals visible without treating them as verified', () => {
    const report = reportHeldSourceVerificationQueue(process.cwd())

    expect(report.modelVersion).toBe('held-source-verification-queue-v2')
    expect(report.counts.heldProfiles).toBeGreaterThan(0)
    expect(report.counts.heldProfilesWithAnySourceSignals).toBeGreaterThan(0)
    expect(report.counts.unregisteredCandidates).toBe(report.candidates.length)
    expect(new Set(report.candidates.map((row) => row.slug)).size).toBe(report.candidates.length)

    for (const row of report.candidates) {
      expect(row.slug).toBeTruthy()
      expect(['herb', 'compound']).toContain(row.entityType)
      expect(row.provenanceLanes.length).toBeGreaterThan(0)
      expect(row.claimCountWithSourceSignals + row.detailSourceCount).toBeGreaterThan(0)
    }

    // Capsicum frutescens is the regression example that proved claim-only
    // inventory was insufficient: its held detail record carries PubMed sources
    // plus a Consensus discovery link.
    const capsicum = report.candidates.find((row) => row.slug === 'capsicum-frutescens')
    if (capsicum) {
      expect(capsicum.provenanceLanes).toContain('detail')
      expect(capsicum.detailSignals.sourceUrlClasses).toContain('discovery_or_ai_tool')
    }

    // Keep this in the test log so CI provides a deterministic, reviewable census
    // without baking a fragile exact count into the assertion.
    console.log('[held-source-verification] candidates', report.candidates.map((row) => row.slug).join(','))
    console.log('[held-source-verification] counts', JSON.stringify(report.counts))
  })
})

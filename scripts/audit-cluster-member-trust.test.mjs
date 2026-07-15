import { describe, expect, it } from 'vitest'
import { auditClusterMemberTrust, ISSUE_CATEGORIES } from './audit-cluster-member-trust.mjs'

describe('cluster member runtime trust audit', () => {
  it('finds the complete explicit cluster-member population deterministically', async () => {
    const report = await auditClusterMemberTrust()

    expect(report.counts.profiles).toBe(4)
    expect(report.profiles.map(profile => profile.slug)).toEqual([
      'green-tea-egcg-isolated',
      'green-tea-extract',
      'green-tea-extract-egcg',
      'turmeric',
    ])
    expect(report.counts.inheritedProfiles).toBe(0)
    expect(report.counts.overriddenProfiles).toBe(4)
  })

  it('classifies every finding into the mission taxonomy', async () => {
    const report = await auditClusterMemberTrust()

    expect(report.issues.length).toBeGreaterThan(0)
    expect(report.issues.every(item => ISSUE_CATEGORIES.includes(item.category))).toBe(true)
    expect(Object.keys(report.countsByCategory)).toEqual(ISSUE_CATEGORIES)
  })

  it('keeps the discovery baseline visible without making report mode fail', async () => {
    const report = await auditClusterMemberTrust()

    expect(report.counts.evidenceLabelledSummaries).toBe(0)
    expect(report.counts.structuredSafetyGaps).toBe(11)
    expect(report.counts.runtimeDefectProfiles).toBe(4)
    expect(report.counts.renderingIssueProfiles).toBe(4)
  })
})

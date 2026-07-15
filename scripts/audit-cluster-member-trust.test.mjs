import { describe, expect, it } from 'vitest'
import {
  auditClusterMemberTrust,
  evaluateClusterMemberProfile,
  ISSUE_CATEGORIES,
  strictExitCode,
} from './audit-cluster-member-trust.mjs'
import { CLUSTER_MEMBER_INHERITANCE_MODE } from '../config/cluster-member-runtime-trust.mjs'

function validFixture(slug = 'fixture') {
  const safety = 'Safety evidence: limited human evidence. Use remains preparation-specific.'
  return {
    base: {
      slug,
      runtime_export_decision: 'cluster_member_runtime',
      safety,
      contraindications: ['Use clinician review with liver disease.'],
      interactions: [],
      side_effects: ['Mild nausea can occur.'],
      evidence_tier: 'Limited Human Evidence',
      indexability_status: 'PUBLISH',
      robots: 'index,follow',
      sitemap_included: true,
    },
    workbookRow: {
      runtime_safety: safety,
      safety_notes: 'Source safety context.',
      contraindications_or_flags: 'Use clinician review with liver disease.',
    },
    layers: [{ slug, safetyNotes: '', contraindications: ['placeholder'], indexability_status: 'NEEDS_REVIEW' }],
    searchRecord: {
      safety: 'Use with caution',
      safetyFlags: { hasContraindications: true, hasInteractions: false },
    },
    trustRecord: {
      slug,
      canonicalRuntimeSlug: slug,
      inheritanceMode: CLUSTER_MEMBER_INHERITANCE_MODE,
    },
  }
}

describe('cluster member runtime trust audit', () => {
  it('resolves all four historical false positives as valid inheritance', async () => {
    const report = await auditClusterMemberTrust()

    expect(report.counts.profiles).toBe(4)
    expect(report.profiles.map(profile => profile.slug)).toEqual([
      'green-tea-egcg-isolated',
      'green-tea-extract',
      'green-tea-extract-egcg',
      'turmeric',
    ])
    expect(report.counts.inheritedProfiles).toBe(4)
    expect(report.counts.auditFalsePositives).toBe(0)
    expect(report.findings.filter(item => item.category === 'Valid inheritance').map(item => item.slug)).toEqual([
      'green-tea-egcg-isolated',
      'green-tea-extract',
      'green-tea-extract-egcg',
      'turmeric',
    ])
  })

  it('reports zero remaining structured, runtime, and rendering defects', async () => {
    const report = await auditClusterMemberTrust()

    expect(report.counts.evidenceLabelledSummaries).toBe(4)
    expect(report.counts.structuredSafetyGaps).toBe(0)
    expect(report.counts.runtimeDefects).toBe(0)
    expect(report.counts.renderingIssues).toBe(0)
    expect(report.counts.actionableFindings).toBe(0)
    expect(strictExitCode(report)).toBe(0)
  })

  it('keeps every classification deterministic and in the mission taxonomy', async () => {
    const first = await auditClusterMemberTrust()
    const second = await auditClusterMemberTrust()

    expect(second).toEqual(first)
    expect(first.findings.every(item => ISSUE_CATEGORIES.includes(item.category))).toBe(true)
    expect(Object.keys(first.countsByCategory)).toEqual(ISSUE_CATEGORIES)
  })

  it('still fails a synthetic true runtime gap in strict mode', () => {
    const fixture = validFixture()
    fixture.workbookRow.runtime_safety = ''
    const result = evaluateClusterMemberProfile(fixture)
    const actionable = result.findings.filter(item => item.category !== 'Valid inheritance')

    expect(actionable.map(item => item.id)).toContain('missing-evidence-labelled-safety')
    expect(actionable.map(item => item.id)).toContain('workbook-fill-rate-not-runtime-completeness')
    expect(strictExitCode({ counts: { actionableFindings: actionable.length } })).toBe(1)
  })

  it('fails malformed canonical relationships clearly', () => {
    const fixture = validFixture('canonical')
    fixture.layers = [{ slug: 'different-member', safetyNotes: 'Safety evidence: local.' }]
    const result = evaluateClusterMemberProfile(fixture)

    expect(result.findings.map(item => item.id)).toContain('invalid-inheritance-relationship')
  })
})

import { describe, expect, it } from 'vitest'
import {
  applyValidatedClusterMemberGovernance,
  isValidatedClusterMember,
} from './cluster-member-governance-policy.mjs'

describe('validated cluster-member governance precedence', () => {
  it('restores a validated cluster member after the generic source overlay downgrades it', () => {
    const record = {
      slug: 'green-tea-egcg-isolated',
      profile_status: 'commercial_ready',
      runtime_export_decision: 'cluster_member_runtime',
      indexability_status: 'NEEDS_REVIEW',
      robots: 'noindex,follow',
      sitemap_included: false,
      indexability_reasons: ['missing_record_level_sources'],
      governance: {
        reviewStatus: 'needs_review',
        indexingAllowed: false,
        recommendationAllowed: true,
        requiresHumanReview: true,
        reason: 'missing_record_level_sources',
      },
    }

    expect(isValidatedClusterMember(record)).toBe(true)
    expect(applyValidatedClusterMemberGovernance(record)).toBe(true)
    expect(record.indexability_status).toBe('PUBLISH')
    expect(record.robots).toBe('index,follow')
    expect(record.sitemap_included).toBe(true)
    expect(record.indexability_reasons).not.toContain('missing_record_level_sources')
    expect(record.indexability_reasons).toContain('cluster_member_runtime_trust')
    expect(record.governance).toMatchObject({
      reviewStatus: 'approved',
      indexingAllowed: true,
      recommendationAllowed: true,
      requiresHumanReview: false,
      reason: 'cluster_member_runtime_trust',
    })
  })

  it('does not promote a known cluster slug whose explicit runtime decision is a hold', () => {
    const record = {
      slug: 'green-tea-egcg-isolated',
      profile_status: 'commercial_ready',
      runtime_export_decision: 'hidden_until_grounded',
      indexability_status: 'NEEDS_REVIEW',
      robots: 'noindex,follow',
      sitemap_included: false,
    }

    expect(isValidatedClusterMember(record)).toBe(false)
    expect(applyValidatedClusterMemberGovernance(record)).toBe(false)
    expect(record.robots).toBe('noindex,follow')
  })

  it('keeps an explicit research-only profile held even if its slug is in the trust registry', () => {
    const record = {
      slug: 'green-tea-extract-egcg',
      profile_status: 'research_only',
      runtime_export_decision: 'cluster_member_runtime',
      indexability_status: 'NEEDS_REVIEW',
      robots: 'noindex,follow',
      sitemap_included: false,
    }

    expect(isValidatedClusterMember(record)).toBe(false)
    expect(applyValidatedClusterMemberGovernance(record)).toBe(false)
  })
})

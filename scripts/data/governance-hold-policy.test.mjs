import { describe, expect, it } from 'vitest'
import {
  applyDeliberateGovernanceHold,
  isDeliberateGovernanceHold,
} from './governance-hold-policy.mjs'

describe('deliberate governance hold precedence', () => {
  it('keeps hidden_until_grounded held even when a curated overlay promoted it', () => {
    const record = {
      slug: 'black-cohosh',
      runtime_export_decision: 'hidden_until_grounded',
      indexability_status: 'PUBLISH',
      robots: 'index,follow',
      sitemap_included: true,
      indexability_reasons: ['noindex-decision:hidden_until_grounded', 'curated_allowlist'],
      governance: {
        indexingAllowed: true,
        reviewStatus: 'approved',
        recommendationAllowed: true,
        requiresHumanReview: false,
        reason: 'curated_allowlist',
      },
    }

    expect(isDeliberateGovernanceHold(record)).toBe(true)
    expect(applyDeliberateGovernanceHold(record)).toBe(true)
    expect(record.indexability_status).toBe('NEEDS_REVIEW')
    expect(record.robots).toBe('noindex,follow')
    expect(record.sitemap_included).toBe(false)
    expect(record.governance.indexingAllowed).toBe(false)
    expect(record.governance.requiresHumanReview).toBe(true)
    expect(record.governance.recommendationAllowed).toBe(false)
  })

  it('keeps research_only profile status ahead of curated allowlisting', () => {
    const record = {
      slug: 'acetyl-l-carnitine',
      profile_status: 'research_only',
      indexability_status: 'PUBLISH',
      robots: 'index,follow',
      sitemap_included: true,
      indexability_reasons: ['profile-status:research_only', 'curated_allowlist'],
    }

    expect(applyDeliberateGovernanceHold(record)).toBe(true)
    expect(record.indexability_status).toBe('NEEDS_REVIEW')
  })

  it('leaves normal curated publish records unchanged', () => {
    const record = {
      slug: 'magnesium',
      runtime_export_decision: 'full_public_runtime',
      profile_status: 'complete',
      indexability_status: 'PUBLISH',
      robots: 'index,follow',
      sitemap_included: true,
      indexability_reasons: ['curated_allowlist'],
    }

    expect(isDeliberateGovernanceHold(record)).toBe(false)
    expect(applyDeliberateGovernanceHold(record)).toBe(false)
    expect(record.indexability_status).toBe('PUBLISH')
  })
})

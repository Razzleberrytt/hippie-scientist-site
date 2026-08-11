import { describe, expect, it } from 'vitest'
import { shouldIndexRoute } from '../seo'

describe('SEO governance precedence', () => {
  it('keeps a curated herb noindexed while an explicit grounding hold is active', () => {
    const decision = shouldIndexRoute('/herbs/black-cohosh', {
      slug: 'black-cohosh',
      sitemap_included: false,
      robots: 'noindex,follow',
      indexability_status: 'NEEDS_REVIEW',
      runtime_export_decision: 'hidden_until_grounded',
      profile_status: 'complete',
      indexability_reasons: ['deliberate_governance_hold'],
    })

    expect(decision.index).toBe(false)
    expect(decision.follow).toBe(true)
    expect(decision.reason).toBe('runtime_export_decision=hidden_until_grounded')
  })

  it('keeps a curated compound noindexed while research_only is active', () => {
    const decision = shouldIndexRoute('/compounds/acetyl-l-carnitine', {
      slug: 'acetyl-l-carnitine',
      sitemap_included: false,
      robots: 'noindex,follow',
      indexability_status: 'NEEDS_REVIEW',
      runtime_export_decision: 'full_public_runtime',
      profile_status: 'research_only',
      indexability_reasons: ['deliberate_governance_hold'],
    })

    expect(decision.index).toBe(false)
    expect(decision.reason).toBe('profile_status=research_only')
  })

  it('preserves the existing curated override for an ordinary review state', () => {
    const decision = shouldIndexRoute('/herbs/ashwagandha', {
      slug: 'ashwagandha',
      sitemap_included: false,
      robots: 'index,follow',
      indexability_status: 'NEEDS_REVIEW',
      runtime_export_decision: 'full_public_runtime',
      profile_status: 'complete',
    })

    expect(decision.index).toBe(true)
    expect(decision.reason).toBe('curated-herb-allowlist')
  })
})

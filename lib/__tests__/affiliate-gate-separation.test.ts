import { describe, expect, it } from 'vitest'
import { canRenderAffiliateLinks, canShowAffiliateModule } from '../affiliate'
import { canRenderConfiguredRevenueProducts } from '../revenue-product-governance'
import { getRevenueProductSet } from '../../config/revenue-products'

const eligibleRecord = {
  slug: 'ashwagandha',
  profile_status: 'complete',
  evidence_tier: 'Strong Human Evidence',
  indexability_status: 'PUBLISH',
  governance: { monetizationAllowed: true },
}

describe('affiliate gate separation and safety regression', () => {
  it('does not confuse missing affiliate_ready with the curated card eligibility gate', () => {
    // This test only models an otherwise-eligible technical record. A
    // configured catalog entry is NOT human editorial approval to publish.
    expect(getRevenueProductSet('ashwagandha')?.products.length).toBeGreaterThan(0)
    expect(canRenderAffiliateLinks(eligibleRecord)).toBe(true)
    expect(canRenderConfiguredRevenueProducts('ashwagandha', eligibleRecord)).toBe(true)
    expect(canShowAffiliateModule(eligibleRecord)).toBe(false)
  })

  it('an affiliate_ready flag does not override an explicit monetization denial', () => {
    const deniedRecord = {
      ...eligibleRecord,
      affiliate_ready: true,
      monetization_allowed: false,
    }
    expect(canRenderAffiliateLinks(deniedRecord)).toBe(false)
    expect(canRenderConfiguredRevenueProducts('ashwagandha', deniedRecord)).toBe(false)
    expect(canShowAffiliateModule(deniedRecord)).toBe(false)
  })

  it('an affiliate_ready flag does not override preliminary research', () => {
    const preliminaryRecord = {
      ...eligibleRecord,
      affiliate_ready: true,
      evidence_tier: 'Preliminary human evidence',
    }
    expect(canRenderAffiliateLinks(preliminaryRecord)).toBe(false)
    expect(canRenderConfiguredRevenueProducts('ashwagandha', preliminaryRecord)).toBe(false)
  })

  it('a restricted ingredient stays blocked even with affiliate-ready metadata', () => {
    const restrictedRecord = {
      ...eligibleRecord,
      slug: 'kava',
      affiliate_ready: true,
    }
    expect(getRevenueProductSet('kava')).toBeNull()
    expect(canRenderAffiliateLinks(restrictedRecord)).toBe(false)
    expect(canRenderConfiguredRevenueProducts('kava', restrictedRecord)).toBe(false)
  })
})

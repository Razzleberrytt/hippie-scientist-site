import { describe, expect, it } from 'vitest'
import { canRenderAffiliateLinks, getAffiliateShopLinks } from '../affiliate'

describe('affiliate research-maturity governance', () => {
  it('blocks preliminary records from affiliate purchase intent', () => {
    const record = {
      slug: 'example-compound',
      displayName: 'Example Compound',
      evidence_tier: 'Preliminary human evidence',
      profile_status: 'complete',
      affiliate_ready: true,
    }

    expect(canRenderAffiliateLinks(record)).toBe(false)
    expect(getAffiliateShopLinks(record, record.displayName, 'compound')).toEqual([])
  })

  it('blocks theoretical mechanism-only records from affiliate purchase intent', () => {
    const record = {
      slug: 'example-mechanism-compound',
      displayName: 'Example Mechanism Compound',
      evidence_tier: 'Preclinical animal studies only',
      mechanisms: ['receptor modulation'],
      profile_status: 'complete',
      affiliate_ready: true,
    }

    expect(canRenderAffiliateLinks(record)).toBe(false)
  })

  it('does not add a maturity restriction to sparse compact payloads without evidence fields', () => {
    const record = {
      slug: 'l-theanine',
      displayName: 'L-Theanine',
      affiliate_ready: true,
    }

    expect(canRenderAffiliateLinks(record)).toBe(true)
  })

  it('treats profile_status as a maturity signal rather than an absent one', () => {
    // profile_status is one of the fields hasExplicitResearchMaturitySignal
    // reads, so a payload carrying it is not the sparse case above: it resolves
    // to theoretical, which withdraws purchase intent. Keeping this explicit so
    // the boundary is not blurred back into the sparse case.
    const record = {
      slug: 'l-theanine',
      displayName: 'L-Theanine',
      affiliate_ready: true,
      profile_status: 'complete',
    }

    expect(canRenderAffiliateLinks(record)).toBe(false)
  })
})

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
      profile_status: 'complete',
    }

    expect(canRenderAffiliateLinks(record)).toBe(true)
  })
})

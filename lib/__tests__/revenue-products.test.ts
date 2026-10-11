import { describe, expect, it } from 'vitest'
import { getRevenueProductSet, revenueProductSets } from '@/config/revenue-products'
import { isRestrictedRecord } from '../restricted-ingredients'

describe('revenue product recommendations', () => {
  it('preserves valid, uniquely slotted sourcing examples without inventing missing tiers', () => {
    for (const slug of ['ashwagandha', 'magnesium', 'l-theanine', 'rhodiola', 'lions-mane']) {
      const set = getRevenueProductSet(slug)
      expect(set).not.toBeNull()

      const products = set?.products ?? []
      const slots = products.map(product => product.slot)
      // A product can be quarantined or removed following identity review.
      // Never fabricate a third SKU solely to satisfy a presentation contract.
      expect(products.length).toBeGreaterThanOrEqual(1)
      expect(products.length).toBeLessThanOrEqual(3)
      expect(new Set(slots).size).toBe(slots.length)
      expect(slots).toContain('overall')
      expect(slots.every(slot => ['budget', 'overall', 'premium'].includes(slot))).toBe(true)
      expect(products.every(product => product.brand && product.title && product.affiliateUrl)).toBe(true)
      expect(products.some(product => /placeholder|search$/i.test(product.title || ''))).toBe(false)
    }
  })

  it('supports common herb and compound slug aliases', () => {
    expect(getRevenueProductSet('rhodiola-rosea')?.slug).toBe('rhodiola')
    expect(getRevenueProductSet('rhodiola-extract-shr5')?.slug).toBe('rhodiola')
    expect(getRevenueProductSet('ashwagandha-root-extract')?.slug).toBe('ashwagandha')
    expect(getRevenueProductSet('ashwagandha-extract-ksm-66')?.slug).toBe('ashwagandha')
    expect(getRevenueProductSet('theanine')?.slug).toBe('l-theanine')
    expect(getRevenueProductSet('magnesium-glycinate')?.slug).toBe('magnesium')
  })

  it('keeps a substantive catalog while tagging all unrestricted configured affiliate URLs', () => {
    const allProducts = Object.values(revenueProductSets).flatMap(set => set.products)
    // Keep a meaningful coverage floor without hard-coding a count that grows
    // stale whenever an invalid product identity is removed on safety grounds.
    expect(allProducts.length).toBeGreaterThan(200)
    for (const product of allProducts.filter(product => !isRestrictedRecord(product))) {
      expect(product.affiliateUrl).toContain('tag=')
      expect(product.affiliateUrl).toMatch(/^https:\/\/www\.amazon\.com\//)
    }
  })

  it('does not return restricted kava product sets for monetization', () => {
    expect(getRevenueProductSet('kava')).toBeNull()
    expect(getRevenueProductSet('piper-methysticum')).toBeNull()
    expect(getRevenueProductSet('kavalactones')).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { getRevenueProductSet, revenueProductSets } from '@/config/revenue-products'

describe('revenue product recommendations', () => {
  it('provides three real recommendation slots for priority ingredients', () => {
    for (const slug of ['ashwagandha', 'magnesium', 'l-theanine', 'rhodiola', 'lions-mane']) {
      const set = getRevenueProductSet(slug)

      expect(set?.products.map(product => product.slot).sort()).toEqual(['budget', 'overall', 'premium'])
      expect(set?.products).toHaveLength(3)
      expect(set?.products.every(product => product.brand && product.title && product.affiliateUrl)).toBe(true)
      expect(set?.products.some(product => /placeholder|search$/i.test(product.title || ''))).toBe(false)
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

  it('keeps affiliate URLs centralized and tagged', () => {
    const allProducts = Object.values(revenueProductSets).flatMap(set => set.products)

    expect(allProducts.length).toBe(15)
    for (const product of allProducts) {
      expect(product.affiliateUrl).toContain('tag=')
      expect(product.affiliateUrl).toMatch(/^https:\/\/www\.amazon\.com\//)
    }
  })
})

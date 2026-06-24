import { describe, it, expect } from 'vitest'
import {
  calculateProductRoute,
  resolveAllProductsForSlug,
  resolveBestProduct,
} from '../affiliate-intelligence-routing'
import { AFFILIATE_PRODUCTS } from '../affiliate-registry'

describe('Affiliate Intelligence Routing Layer', () => {
  const ashwagandhaProducts = AFFILIATE_PRODUCTS.filter(p =>
    p.entitySlugs.includes('ashwagandha')
  )

  it('correctly calculates product route calculations', () => {
    // Let's pick Jarrow Formulas Ashwagandha (300mg, 5% withanolides = 15mg active)
    const jarrowProd = ashwagandhaProducts.find(p => p.id === 'jarrow-ashwagandha-ksm66')
    expect(jarrowProd).toBeDefined()

    if (jarrowProd) {
      // If user wants 600mg target dose, they need 2 capsules
      const route = calculateProductRoute(jarrowProd, 600)

      expect(route.targetDoseMg).toBe(600)
      expect(route.capsulesNeeded).toBe(2)
      expect(route.actualYieldMg).toBe(600)
      expect(route.activeYieldMg).toBe(30) // 15mg * 2 capsules
      expect(route.costPerDoseUsd).toBeCloseTo((16.95 / 120) * 2, 4)
      expect(route.affiliateUrl).toContain('B0013OQG0A')
      expect(route.affiliateUrl).toContain('tag=')
    }
  })

  it('correctly resolves all products for a slug and sorts by cost ascending', () => {
    const routes = resolveAllProductsForSlug('ashwagandha', 600, 'cost')
    expect(routes.length).toBeGreaterThan(1)

    // Verify sorted by cost per dose ascending
    for (let i = 0; i < routes.length - 1; i++) {
      expect(routes[i].costPerDoseUsd).toBeLessThanOrEqual(routes[i + 1].costPerDoseUsd)
    }
  })

  it('correctly resolves and sorts by potency descending', () => {
    const routes = resolveAllProductsForSlug('ashwagandha', 600, 'potency')
    expect(routes.length).toBeGreaterThan(1)

    // Verify sorted by active yield descending (highest active yield first)
    for (let i = 0; i < routes.length - 1; i++) {
      expect(routes[i].activeYieldMg).toBeGreaterThanOrEqual(routes[i + 1].activeYieldMg)
    }
  })

  it('correctly resolves and sorts by certification count descending', () => {
    const routes = resolveAllProductsForSlug('ashwagandha', 600, 'certification')
    expect(routes.length).toBeGreaterThan(1)

    // Verify sorted by number of certifications descending
    for (let i = 0; i < routes.length - 1; i++) {
      expect(routes[i].product.certifications.length).toBeGreaterThanOrEqual(
        routes[i + 1].product.certifications.length
      )
    }
  })

  it('returns null if slug has no registered products', () => {
    const route = resolveBestProduct('non-existent-supplement-slug', 500)
    expect(route).toBeNull()
  })
})

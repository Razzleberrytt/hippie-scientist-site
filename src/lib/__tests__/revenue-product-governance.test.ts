import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { revenueProductSets } from '../../../config/revenue-products'
import { canRenderAffiliateLinks } from '../affiliate'
import { canRenderConfiguredRevenueProducts } from '../revenue-product-governance'
import { getCompounds, getHerbs } from '../runtime-data'
import { isRestrictedIngredient } from '../restricted-ingredients'

const REVENUE_SLUG_ALIASES: Record<string, string> = {
  'lions-mane': 'hericium-erinaceus',
}

describe('revenue product governance', () => {
  it('keeps dormant restricted catalog entries fail-closed at the shared renderer boundary', () => {
    const restricted = Object.keys(revenueProductSets).filter((slug) => isRestrictedIngredient(slug))

    // The older catalog contract deliberately retains dormant source records
    // (including kava) while getRevenueProductSet() returns null for them. The
    // shared renderer must enforce the same fail-closed behavior rather than
    // requiring destructive removal of historical catalog data.
    expect(restricted.length).toBeGreaterThan(0)
    for (const slug of restricted) {
      expect(canRenderConfiguredRevenueProducts(slug)).toBe(false)
    }

    const renderer = fs.readFileSync(path.join(process.cwd(), 'components', 'RecommendationSection.tsx'), 'utf8')
    expect(renderer).toContain('await canRenderRecommendationProducts(products, trackingProductSlug)')
    expect(renderer).toContain('canRenderConfiguredRevenueProducts(configuredSlug, record || null)')
  })

  it('does not render configured product recommendations when central runtime monetization policy rejects the live record', async () => {
    const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
    const records = [...herbs, ...compounds]
    const bySlug = new Map(records.map((record) => [String(record.slug || ''), record]))

    const matched: string[] = []
    const centrallyRejected: string[] = []
    const violations: Array<{ slug: string; reason: string }> = []

    for (const [configuredSlug, productSet] of Object.entries(revenueProductSets)) {
      if (!productSet.products.some((product) => Boolean(product.affiliateUrl))) continue

      const runtimeSlug = REVENUE_SLUG_ALIASES[configuredSlug] || configuredSlug
      const record = bySlug.get(runtimeSlug)
      if (!record) continue

      matched.push(configuredSlug)
      if (!canRenderAffiliateLinks(record)) {
        centrallyRejected.push(configuredSlug)
        if (canRenderConfiguredRevenueProducts(configuredSlug, record)) {
          violations.push({
            slug: configuredSlug,
            reason: 'shared configured-product gate allowed a record rejected by central runtime monetization policy',
          })
        }
      }
    }

    // Prevent broken runtime-data fixtures or an accidentally empty rejection
    // set from turning this governance contract into a vacuous pass.
    expect(matched.length).toBeGreaterThan(5)
    expect(centrallyRejected.length).toBeGreaterThan(0)
    expect(violations).toEqual([])
  })
})

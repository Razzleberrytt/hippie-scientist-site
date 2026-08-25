import { describe, expect, it } from 'vitest'
import { getRevenueProductSet, revenueProductSets } from '../../../config/revenue-products'
import { canRenderAffiliateLinks } from '../affiliate'
import { getCompounds, getHerbs } from '../runtime-data'
import { isRestrictedIngredient } from '../restricted-ingredients'

const REVENUE_SLUG_ALIASES: Record<string, string> = {
  'lions-mane': 'hericium-erinaceus',
}

describe('revenue product governance', () => {
  it('never exposes or monetizes an explicitly restricted configured ingredient', () => {
    const restricted = Object.entries(revenueProductSets)
      .filter(([slug]) => isRestrictedIngredient(slug))

    for (const [slug, productSet] of restricted) {
      expect(getRevenueProductSet(slug), `${slug} must be blocked by the public lookup`).toBeNull()
      expect(
        productSet.products.some((product) => Boolean(product.affiliateUrl)),
        `${slug} must not retain an affiliate destination even if dormant config exists`,
      ).toBe(false)
    }
  })

  it('does not contradict runtime monetization policy for product sets that map to live records', async () => {
    const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
    const records = [...herbs, ...compounds]
    const bySlug = new Map(records.map((record) => [String(record.slug || ''), record]))

    const matched: string[] = []
    const violations: Array<{ slug: string; reason: string }> = []

    for (const [configuredSlug, productSet] of Object.entries(revenueProductSets)) {
      if (!productSet.products.some((product) => Boolean(product.affiliateUrl))) continue

      const runtimeSlug = REVENUE_SLUG_ALIASES[configuredSlug] || configuredSlug
      const record = bySlug.get(runtimeSlug)
      if (!record) continue

      matched.push(configuredSlug)
      if (!canRenderAffiliateLinks(record)) {
        violations.push({
          slug: configuredSlug,
          reason: 'configured product recommendations exist while central runtime monetization policy rejects the record',
        })
      }
    }

    // Prevent a broken runtime-data fixture from turning the governance test into
    // a vacuous pass. The exact count may grow as product sets are added.
    expect(matched.length).toBeGreaterThan(5)
    expect(violations).toEqual([])
  })
})
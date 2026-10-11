import { describe, expect, it } from 'vitest'
import { revenueProductSets, getRevenueProductSet } from '@/config/revenue-products'
import { getProductPicks } from '@/lib/product-ranking'
import { isRestrictedIngredient } from '@/lib/restricted-ingredients'
import { canRenderConfiguredRevenueProducts } from '@/lib/revenue-product-governance'

const allProducts = Object.values(revenueProductSets).flatMap((set) => set.products)
const find = (slug: string, brand: string) => revenueProductSets[slug]?.products.find((p) => p.brand === brand)

describe('Batch 6 safety and product fidelity contract', () => {
  it('fails closed for seven high-risk supplement recommendation categories', () => {
    for (const slug of ['mucuna', 'vitex', 'fo-ti', 'vitamin-b6', 'kanna', 'licorice', 'meadowsweet']) {
      expect(isRestrictedIngredient(slug)).toBe(true)
      expect(getRevenueProductSet(slug)).toBeNull()
      expect(canRenderConfiguredRevenueProducts(slug)).toBe(false)
      expect(getProductPicks(slug)).toEqual([])
    }
    for (const alias of ['polygonum-multiflorum', 'he-shou-wu', 'chasteberry', 'sceletium-tortuosum']) {
      expect(isRestrictedIngredient(alias)).toBe(true)
    }
    // Vitex botanical != the unrelated flavonoid vitexin in other plants.
    expect(isRestrictedIngredient('passionflower vitexin flavonoid')).toBe(false)
  })

  it('removes unsupported manufacturer/product combinations in curated catalogs', () => {
    const invalid = [
      'Thorne Echinacea',
      'NOW Chamomile 400 mg',
      'NOW Schisandra 570 mg',
      'NOW Lemon Balm 500 mg',
      'NOW Kanna 100 mg',
    ]
    const titles = allProducts.map((product) => product.title)
    const names = ['kanna', 'lemon-balm'].flatMap((slug) => getProductPicks(slug).map((pick) => pick.name))
    for (const title of invalid) {
      expect(titles).not.toContain(title)
      expect(names).not.toContain(title)
    }
  })

  it('warns specifically about serious levodopa, hepatic, hormonal, neuropathy and salicylate risks', () => {
    for (const product of revenueProductSets.mucuna.products) {
      expect(product.rationale).toMatch(/L-DOPA/i)
      expect(product.rationale).toMatch(/MAOI/i)
    }
    for (const product of revenueProductSets.vitex.products) {
      expect(product.rationale).toMatch(/dopamin|dopamine|Parkinson/i)
    }
    for (const product of revenueProductSets['fo-ti'].products) {
      expect(product.rationale).toMatch(/liver injury|hepatotoxicity/i)
    }
    for (const product of revenueProductSets.licorice.products) {
      expect(product.rationale).toMatch(/glycyrrhizin|cardiovascular|blood-pressure|cardiac/i)
    }
    for (const product of revenueProductSets.meadowsweet.products) {
      expect(product.rationale).toMatch(/salicylate/i)
    }
    expect(find('vitamin-b6', 'Jarrow Formulas')?.rationale).toMatch(/12 mg\/day.*neuropathy/i)
  })

  it('does not perpetuate false first-pass or fruiting-body purity claims', () => {
    const natrol = getProductPicks('melatonin').find((product) => product.brand === 'Natrol')
    expect(natrol?.notes).not.toMatch(/avoids first-pass/i)
    expect(natrol?.notes).toMatch(/first-pass metabolism/i)
    expect(find('reishi', 'NOW Foods')?.title).toMatch(/Rei-Shi Mushrooms/)
    expect(find('reishi', 'NOW Foods')?.rationale).toMatch(/shiitake.*Prop 65/i)
    expect(find('reishi', 'Host Defense')?.rationale).toMatch(/mycelium.*brown rice/i)
  })
})

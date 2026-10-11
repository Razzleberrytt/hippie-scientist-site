import { describe, expect, it } from 'vitest'
import { getRevenueProductSet, revenueProductSets } from '@/config/revenue-products'
import { getProductPicks } from '@/lib/product-ranking'
import { isRestrictedIngredient } from '@/lib/restricted-ingredients'
import { canRenderConfiguredRevenueProducts } from '@/lib/revenue-product-governance'

const revenueProducts = Object.values(revenueProductSets).flatMap((set) => set.products)

function find(slug: string, brand: string) {
  const set = getRevenueProductSet(slug)
  return set?.products.find((product) => product.brand === brand)
}

describe('Batch 5 supplement identity and safety contract', () => {
  it('excludes St. Johns Wort from all configured monetization paths', () => {
    for (const slug of ['st-johns-wort', 'St Johns Wort', 'hypericum-perforatum']) {
      expect(isRestrictedIngredient(slug)).toBe(true)
      expect(getRevenueProductSet(slug)).toBeNull()
      expect(canRenderConfiguredRevenueProducts(slug)).toBe(false)
      expect(getProductPicks(slug)).toEqual([])
    }
  })

  it('excludes nonexistent SKUs rather than linking shoppers to misleading searches', () => {
    const rejected = [
      'NOW Sports BCAA Powder',
      'NOW Sports Caffeine 200 mg',
      'Jarrow Formulas Saffron 30 mg',
      'Jarrow Formulas Bacopa Monnieri 320 mg',
      'Jarrow Formulas Glycine 1000 mg',
      'Nutricost PEA 600 mg',
    ]
    const titles = revenueProducts.map((product) => product.title)
    for (const title of rejected) {
      expect(titles).not.toContain(title)
    }
    for (const name of rejected) {
      expect(getProductPicks('bacopa').some((product) => product.name === name)).toBe(false)
      expect(getProductPicks('caffeine').some((product) => product.name === name)).toBe(false)
      expect(getProductPicks('palmitoylethanolamide').some((product) => product.name === name)).toBe(false)
    }
  })

  it('does not claim NOW L-Theanine is a single-ingredient product', () => {
    expect(find('l-theanine', 'NOW Foods')?.rationale).toMatch(/100 mg inositol/i)
    expect(getProductPicks('l-theanine').find((product) => product.brand === 'NOW Foods')?.notes).toMatch(/inositol/i)
  })

  it('describes current Thorne Berberine without unverified HPLC certification claims', () => {
    const product = find('berberine', 'Thorne')
    expect(product?.title).not.toContain('Berberine-500')
    expect(product?.rationale).toMatch(/450 mg.*550 mg/)
    expect(product?.rationale).toMatch(/interact/)
    expect(product?.rationale).not.toMatch(/HPLC/i)
    expect(product?.affiliateUrl).toContain('/s?')
  })

  it('does not promote an unverified replacement Jarrow KSM-66 ASIN directly', () => {
    const product = find('ashwagandha', 'Jarrow Formulas')
    expect(product?.asin).toBeUndefined()
    expect(product?.affiliateUrl).toContain('/s?')
    expect(getProductPicks('ashwagandha').find((pick) => pick.brand === 'Jarrow Formulas')?.url).toContain('/s?')
  })

  it('keeps other stale ASIN catalog mappings search-only until variant confirmation', () => {
    for (const [slug, brand] of [
      ['ashwagandha', 'NOW Foods'],
      ['l-theanine', 'NOW Foods'],
      ['rhodiola', 'NOW Foods'],
      ['rhodiola', 'Gaia Herbs'],
    ]) {
      const product = find(slug, brand)
      expect(product?.asin).toBeUndefined()
      expect(product?.affiliateUrl).toContain('/s?')
    }
  })

  it('preserves high-impact formulation, allergen and risk qualifications', () => {
    expect(find('zinc', 'NOW Foods')?.rationale).toMatch(/softgels.*pumpkin seed oil.*soy lecithin/i)
    expect(find('boswellia', 'NOW Foods')?.rationale).toMatch(/turmeric.*65% organic acids/i)
    expect(find('resveratrol', 'Life Extension')?.rationale).toMatch(/40 mg trans-resveratrol/i)
    expect(find('bcaa', 'Thorne')?.rationale).toMatch(/Eleven-amino-acid/i)
    expect(find('collagen', 'Ancient Nutrition')?.rationale).toMatch(/egg and fish/i)
    expect(find('valerian', 'NOW Foods')?.rationale).toMatch(/manufacturer label.*Proposition 65 lead warning/i)
    expect(find('omega-3', 'NOW Foods')?.rationale).toMatch(/ethyl-ester/i)
    expect(find('glutamine', 'Jarrow Formulas')?.rationale).toMatch(/tablet form/i)
    expect(find('nac', 'Jarrow Formulas')?.rationale).toMatch(/tablet form/i)
    expect(find('nac', 'NOW Foods')?.rationale).toMatch(/1,200 mg/i)
    expect(find('garlic', 'Life Extension')?.rationale).toMatch(/vegetarian capsules/i)
    expect(find('vitamin-d', 'Thorne')?.rationale).toMatch(/warfarin/i)
    expect(find('lions-mane', 'Host Defense')?.rationale).toMatch(/mycelium.*brown rice/i)
    expect(find('reishi', 'Host Defense')?.rationale).toMatch(/mycelium.*brown rice/i)
  })
})

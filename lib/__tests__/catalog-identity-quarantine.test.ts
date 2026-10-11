import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getRevenueProductSet } from '../../config/revenue-products'
import { productPicks } from '../../data/product-picks'

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), file), 'utf8')

describe('commerce catalog identity quarantine', () => {
  it('withdraws the unverified NOW Turmeric 400 mg recommendation from both registries', () => {
    for (const file of ['config/revenue-products.ts', 'data/product-picks.ts']) {
      expect(read(file)).not.toContain('NOW Turmeric 400 mg')
      expect(read(file)).not.toContain('NOW Foods Turmeric 400 mg capsules')
    }
    const turmeric = getRevenueProductSet('turmeric')
    expect(turmeric?.products.map((entry) => entry.title)).toEqual([
      'NOW Turmeric Curcumin 665 mg, 60 veg capsules',
      'Thorne Curcumin Phytosome (Meriva-SR), 120 capsules',
      'Life Extension Super Bio-Curcumin, 400 mg (60 capsules)',
    ])
  })

  it('removes the multicomponent Thorne Stress Balance from single-ingredient ashwagandha picks', () => {
    for (const file of ['config/revenue-products.ts', 'data/product-picks.ts']) {
      expect(read(file)).not.toContain('Thorne Stress Balance')
    }
    const ashwagandha = getRevenueProductSet('ashwagandha')
    expect(ashwagandha?.products.map((entry) => entry.title)).toEqual([
      'NOW Ashwagandha 450 mg',
      'Jarrow KSM-66 Ashwagandha',
    ])
  })

  it('does not reintroduce the deleted turmeric 400 mg SKU or ashwagandha blend', () => {
    const ashwagandha = getRevenueProductSet('ashwagandha')?.products ?? []
    const turmeric = getRevenueProductSet('turmeric')?.products ?? []
    expect(ashwagandha).toHaveLength(2)
    expect(turmeric).toHaveLength(3)
    expect(turmeric.find((p) => p.asin === 'B0013OXD3I')?.title).toContain('665 mg')
    expect([...ashwagandha, ...turmeric].every((item) => Boolean(item.affiliateUrl))).toBe(true)
  })
})

describe('commerce product ASIN batch 2', () => {
  it('pins four verified ASINs to exact variants in the revenue catalog', () => {
    const verified = [
      ['turmeric', 'B01D8V0962', '120 capsules'],
      ['turmeric', 'B000X9P5GM', '60 capsules'],
      ['creatine', 'B002DYIZEO', '120 servings'],
      ['creatine', 'B0DVWKPJ32', '30 servings'],
    ] as const
    for (const [slug, asin, variant] of verified) {
      const match = getRevenueProductSet(slug)?.products.find((product) => product.asin === asin)
      expect(match).toBeDefined()
      expect(match?.title).toContain(variant)
      expect(match?.affiliateUrl).toContain(`/dp/${asin}?tag=`)
    }
  })

  it('keeps provisional and unresolved ASINs on search links', () => {
    const creatine = getRevenueProductSet('creatine')?.products.find((item) => item.brand === 'NOW Foods')
    expect(creatine?.title).toContain('21.2 oz')
    expect(creatine?.asin).toBeUndefined()
    expect(creatine?.affiliateUrl).toContain('/s?k=')
    const melatonin = getRevenueProductSet('melatonin')?.products.find((item) => item.brand === 'NOW Foods')
    expect(melatonin?.title).toContain('180 capsules')
    expect(melatonin?.asin).toBeUndefined()
    expect(melatonin?.affiliateUrl).toContain('/s?k=')
  })

  it('qualifies Meriva absorption claim as an n=9 pharmacokinetic comparison', () => {
    const guide = JSON.parse(read('public/data/guides/turmeric-curcumin.json'))
    const text = JSON.stringify(guide)
    expect(text).toContain('n=9')
    expect(text).toContain('21413691')
    expect(text).toContain('not a clinical benefit multiplier')
  })
})

describe('commerce product ASIN batch 3', () => {
  const verified = [
    ['turmeric', 'B0013OXD3I', '665 mg', 'NOW Foods'],
    ['vitamin-d', 'B001UZPY1O', '240 softgels', 'NOW Foods'],
    ['vitamin-d', 'B005Z1J0EQ', '250 capsules', 'Pure Encapsulations'],
    ['vitamin-d', 'B0038NF8MG', '600 servings', 'Thorne'],
  ] as const

  it('pins verified products to exact sizes in revenue catalog and second registry', () => {
    for (const [slug, asin, variant, brand] of verified) {
      const revenueProduct = getRevenueProductSet(slug)?.products.find((item) => item.asin === asin)
      expect(revenueProduct?.brand).toBe(brand)
      expect(revenueProduct?.title).toContain(variant)
      expect(revenueProduct?.affiliateUrl).toContain(`/dp/${asin}?tag=`)
      const matching = productPicks.filter((item) => item.compound_slug === slug && item.url.includes(`/dp/${asin}?tag=`))
      expect(matching).toHaveLength(1)
      expect(matching[0].name).toContain(variant)
    }
  })

  it('does not conflate D/K2 combination with vitamin D-only products', () => {
    const product = getRevenueProductSet('vitamin-d')?.products.find((item) => item.asin === 'B0038NF8MG')
    expect(product?.title).toContain('D/K2')
    expect(product?.rationale).toContain('combination')
    expect(product?.rationale).toContain('warfarin')
  })

  it('keeps unverified melatonin ASIN quarantined while showing exact UPC and count', () => {
    const product = getRevenueProductSet('melatonin')?.products.find((item) => item.brand === 'NOW Foods')
    expect(product?.title).toContain('180 capsules')
    expect(product?.rationale).toContain('733739032577')
    expect(product?.asin).toBeUndefined()
    expect(product?.affiliateUrl).toContain('/s?k=')
    expect(productPicks.find((item) => item.compound_slug === 'melatonin' && item.brand === 'NOW Foods')?.url).toContain('/s?k=')
  })
})

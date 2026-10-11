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


describe('commerce batch 4 safety and identity regression', () => {
  it('holds kava, St. Johns wort and 5-HTP from monetization including canonical aliases', () => {
    for (const slug of ['kava', 'kava-kava', 'piper-methysticum', 'st-johns-wort', '5-htp']) {
      expect(getRevenueProductSet(slug)).toBeNull()
    }
    for (const slug of ['kava', 'st-johns-wort', '5-htp']) {
      expect(productPicks.some((item) => item.compound_slug === slug)).toBe(false)
    }
  })

  it('does not promote provisional and disputed variants to direct affiliate URLs', () => {
    for (const slug of ['rhodiola', 'l-theanine', 'coenzyme-q10']) {
      const entries = getRevenueProductSet(slug)?.products ?? []
      expect(entries.length).toBeGreaterThan(0)
      expect(entries.every((entry) => !entry.asin && entry.affiliateUrl?.includes('/s?k='))).toBe(true)
    }
    for (const brand of ['Real Mushrooms', 'Host Defense']) {
      const product = getRevenueProductSet('lions-mane')?.products.find((item) => item.brand === brand)
      expect(product?.asin).toBeUndefined()
      expect(product?.affiliateUrl).toContain('/s?k=')
    }
  })

  it('protects confirmed NOW lion mane, omega-3, and glycine variants', () => {
    for (const [slug, asin] of [
      ['lions-mane', 'B09V3BS25N'],
      ['omega-3', 'B0015L2LBE'],
      ['glycine', 'B08R229KG7'],
    ] as const) {
      const item = getRevenueProductSet(slug)?.products.find((entry) => entry.asin === asin)
      expect(item?.affiliateUrl).toContain(`/dp/${asin}?tag=`)
      expect(productPicks.some((entry) => entry.compound_slug === slug && entry.url.includes(`/dp/${asin}?tag=`))).toBe(true)
    }
    expect(getRevenueProductSet('glycine')?.products.some((item) => item.brand === 'Jarrow Formulas')).toBe(false)
  })

  it('preserves product formulation, dose and interaction qualifiers', () => {
    const theanine = getRevenueProductSet('l-theanine')?.products.find((item) => item.brand === 'NOW Foods')
    expect(theanine?.title).toContain('Inositol 100 mg')
    expect(theanine?.asin).toBeUndefined()
    const fishOil = getRevenueProductSet('omega-3')?.products.find((item) => item.brand === 'NOW Foods')
    expect(fishOil?.rationale).toContain('Ethyl-ester')
    const nac = getRevenueProductSet('nac')?.products.find((item) => item.brand === 'NOW Foods')
    expect(nac?.rationale).toContain('selenium')
    expect(nac?.rationale).not.toContain('standard clinical dose')
    const berberine = getRevenueProductSet('berberine')?.products.find((item) => item.brand === 'Thorne')
    expect(berberine?.title).toContain('Dual-Action')
    expect(berberine?.rationale).not.toContain('consistent HPLC testing')
    const probiotics = getRevenueProductSet('probiotics')?.products.find((item) => item.brand === 'NOW Foods')
    expect(probiotics?.rationale).toContain('Lr-32')
    expect(probiotics?.rationale).toContain('LGG')
  })

  it('removes stale Thorne Berberine-500 structured identity from current affiliate registry', () => {
    const registry = read('lib/affiliate-registry.ts')
    expect(registry).not.toContain("id: 'thorne-berberine-500'")
    expect(registry).not.toContain("amazonAsin: 'B0094FTO68'")
  })
})


describe('commerce batch 5 verified identity and claim quarantine', () => {
  it('removes unsupported product listings from both recommendation registries', () => {
    const removed = [
      'NOW Sports BCAA Powder',
      'NOW Sports Caffeine 200 mg',
      'Jarrow Formulas Saffron 30 mg',
      'Jarrow Formulas Bacopa Monnieri 320 mg',
      'Nutricost PEA 600 mg',
    ]
    for (const file of ['config/revenue-products.ts', 'data/product-picks.ts']) {
      const text = read(file)
      for (const name of removed) expect(text).not.toContain(name)
    }
    expect(getRevenueProductSet('bcaa')?.products.some(p => p.brand === 'NOW Foods')).toBe(false)
    expect(getRevenueProductSet('caffeine')?.products.some(p => p.brand === 'NOW Foods')).toBe(false)
  })

  it('uses exact B5 ASINs for the four fully specified reported variants', () => {
    const variants = [
      ['vitamin-c', 'B0013P1GD6', '250 tablets'],
      ['vitamin-c', 'B09FYFM7N3', '90 capsules'],
      ['zinc', 'B002JNCXME', '120 softgels'],
      ['glutamine', 'B000FGWDL8', '90 servings'],
    ] as const
    for (const [slug, asin, size] of variants) {
      const product = getRevenueProductSet(slug)?.products.find(p => p.asin === asin)
      expect(product?.title).toContain(size)
      expect(product?.affiliateUrl).toContain(`/dp/${asin}?tag=`)
    }
  })

  it('does not confuse distinct NOW Boswellia formulations', () => {
    const boswellia = getRevenueProductSet('boswellia')?.products.find(p => p.brand === 'NOW Foods')
    expect(boswellia?.title).toContain('softgels')
    expect(boswellia?.rationale).toContain('item #4936')
    expect(boswellia?.rationale).toContain('organic acids')
    expect(boswellia?.rationale).toContain('250 mg turmeric-containing')
    expect(boswellia?.asin).toBeUndefined()
    expect(boswellia?.affiliateUrl).toContain('/s?k=')
    const secondRegistry = productPicks.find(p => p.compound_slug === 'boswellia' && p.brand === 'NOW Foods')
    expect(secondRegistry?.name).toContain('softgels')
  })

  it('preserves specific product ingredient, allergen and governance information', () => {
    const zinc = getRevenueProductSet('zinc')?.products.find(p => p.brand === 'NOW Foods')
    expect(zinc?.rationale).toContain('pumpkin seed oil')
    expect(zinc?.rationale).toContain('soy lecithin')
    const collagen = getRevenueProductSet('collagen')?.products.find(p => p.brand === 'Ancient Nutrition')
    expect(collagen?.rationale).toContain('egg and fish allergens')
    const nac = getRevenueProductSet('nac')?.products.find(p => p.brand === 'NOW Foods')
    expect(nac?.rationale).toContain('August 2022')
    expect(nac?.rationale).toContain('enforcement discretion')
    for (const product of getRevenueProductSet('iron')?.products ?? []) {
      expect((product.rationale ?? '').toLowerCase()).toMatch(/children|pediatric/)
    }
    const elite = getRevenueProductSet('resveratrol')?.products.find(p => p.brand === 'Life Extension')
    expect(elite?.title).toContain('30 mg trans-resveratrol')
    expect(elite?.rationale).toContain('item 02210')
    expect(elite?.rationale).not.toMatch(/\b40 mg\b/i)
    const ginkgo = getRevenueProductSet('ginkgo-biloba')?.products ?? []
    expect(ginkgo.some(p => /EGb 761 certified/i.test(p.rationale ?? ''))).toBe(false)
  })
})

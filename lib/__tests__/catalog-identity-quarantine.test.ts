import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getRevenueProductSet } from '../../config/revenue-products'

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

  it('does not create new ASINs or product links for either category', () => {
    for (const slug of ['ashwagandha', 'turmeric']) {
      const items = getRevenueProductSet(slug)?.products ?? []
      expect(items).toHaveLength(2)
      expect(items.every((item) => Boolean(item.affiliateUrl))).toBe(true)
    }
    // Links in the surviving pre-existing entries are not new verified links;
    // all actual promotion remains subject to central technical and editorial gates.
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
    for (const slug of ['melatonin', 'vitamin-d']) {
      const items = getRevenueProductSet(slug)?.products ?? []
      expect(items.length).toBeGreaterThan(0)
      expect(items.every((item) => item.affiliateUrl.includes('/s?k=') && !item.asin)).toBe(true)
    }
  })

  it('qualifies Meriva absorption claim as an n=9 pharmacokinetic comparison', () => {
    const guide = JSON.parse(read('public/data/guides/turmeric-curcumin.json'))
    const text = JSON.stringify(guide)
    expect(text).toContain('n=9')
    expect(text).toContain('21413691')
    expect(text).toContain('not a clinical benefit multiplier')
  })
})

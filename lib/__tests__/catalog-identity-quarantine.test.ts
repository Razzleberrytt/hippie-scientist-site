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
      'Thorne Meriva-SR Curcumin',
      'Life Extension Super Bio-Curcumin',
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

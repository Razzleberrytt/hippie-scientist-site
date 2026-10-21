import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { isRestrictedIngredient } from '../restricted-ingredients'
import { canRenderAffiliateLinks } from '../affiliate'
import { canRenderConfiguredRevenueProducts } from '../revenue-product-governance'
import { getRevenueProductSet, revenueProductSets } from '@/config/revenue-products'
import { productPicks } from '@/data/product-picks'
import { getHerbBySlug, getCompoundBySlug } from '../runtime-data'

const safetyProfiles = [
  ['herbs-detail', 'black-cohosh', 'ncbi.nlm.nih.gov/books/NBK547990', /transplantation|transplant/i],
  ['herbs-detail', 'green-tea-extract', 'pubmed.ncbi.nlm.nih.gov/32140423', /empty stomach/i],
  ['compounds-detail', 'green-tea-extract-egcg', 'ncbi.nlm.nih.gov/books/NBK547925', /liver.injury/i],
  ['herbs-detail', 'holy-basil', 'merckmanuals.com', /pregnan|fertility/i],
  ['herbs-detail', 'holy-basil-seed', 'merckmanuals.com', /reproductive|pregnan/i],
  ['herbs-detail', 'holy-basil-purple', 'merckmanuals.com', /pregnan/i],
  ['herbs-detail', 'damiana', 'mskcc.org', /glucose|hypoglyc/i],
  ['herbs-detail', 'saffron', 'pubmed.ncbi.nlm.nih.gov/42186868', /pregnan/i],
  ['herbs-detail', 'saw-palmetto', 'nccih.nih.gov', /pregnan/i],
  ['herbs-detail', 'eleuthero', 'ncbi.nlm.nih.gov/books/NBK501806', /breastfeeding/i],
] as const

describe('Batch 8 evidence-qualified safety controls', () => {
  it('renders the additional safety warning through canonical runtime resolution', async () => {
    const cohosh = await getHerbBySlug('black-cohosh')
    expect(cohosh).not.toBeNull()
    expect(String(cohosh?.safety)).toMatch(/LIVER-INJURY WARNING.*transplant/i)
    expect(cohosh?.safetyNotes).toBe(cohosh?.safety)
    expect((cohosh?.contraindications as string[])).toContain('liver disease')

    const egcg = await getCompoundBySlug('green-tea-extract-egcg')
    expect(egcg).not.toBeNull()
    expect(String(egcg?.safety)).toMatch(/CONCENTRATED EGCG.*LIVER WARNING/i)
    expect(String(egcg?.safety).startsWith('CONCENTRATED EGCG/GREEN TEA EXTRACT LIVER WARNING')).toBe(true)
    expect(egcg?.safetyNotes).toBe(egcg?.safety)
  })

  it('keeps educational search independent from commerce quarantine', () => {
    const search = fs.readFileSync(path.join(process.cwd(), 'components/search/ResearchSearchExperience.tsx'), 'utf8')
    const comparison = fs.readFileSync(path.join(process.cwd(), 'app/compare/on-demand/OnDemandComparisonClient.tsx'), 'utf8')
    for (const source of [search, comparison]) {
      expect(source).toContain('canDiscoverResearchProfile')
      expect(source).not.toContain('isRestrictedRecord')
    }
  })

  it('retains educational profiles, adds named evidence, and closes monetization/recommendations', () => {
    for (const [folder, slug, source, pattern] of safetyProfiles) {
      const file = path.join(process.cwd(), 'public', 'data', folder, slug + '.json')
      const record = JSON.parse(fs.readFileSync(file, 'utf8'))
      expect(record.slug).toBe(slug)
      expect(record.safetyNotes).toMatch(pattern)
      expect(record.sources.some((entry: {url?: string}) => entry.url?.includes(source))).toBe(true)
      expect(record.governance.monetizationAllowed).toBe(false)
      expect(record.governance.recommendationAllowed).toBe(false)
      expect(record.governance.requiresHumanReview).toBe(true)
    }
  })

  it('fails closed on aliases and standalone affiliate entry points', () => {
    for (const slug of ['black-cohosh', 'actaea-racemosa', 'remifemin', 'green-tea-extract', 'green-tea-extract-egcg', 'egcg', 'holy-basil', 'holy-basil-purple', 'holy-basil-seed', 'tulsi', 'damiana', 'saffron', 'saw-palmetto', 'eleuthero', 'nettle-root']) {
      expect(isRestrictedIngredient(slug)).toBe(true)
      expect(getRevenueProductSet(slug)).toBeNull()
      expect(canRenderAffiliateLinks({slug, monetization_allowed:true})).toBe(false)
      expect(canRenderConfiguredRevenueProducts(slug)).toBe(false)
    }
    // Remifemin is a black-cohosh product even though its marketing name omits the herb.
    expect(isRestrictedIngredient('Remifemin Menopause Supplement')).toBe(true)
    expect(isRestrictedIngredient('magnesium')).toBe(false)
  })

  it('removes specifically unverified phantom catalog items without inventing replacements', () => {
    const all = Object.values(revenueProductSets).flatMap(x => x.products).map(x => x.title)
    for (const title of ['NOW Chamomile 400 mg', 'NOW Lemon Balm 500 mg', 'Pure Encapsulations Adenosyl/Methyl B12', 'Jarrow Glycine 1000 mg', 'Jarrow Bacopa 320 mg', 'Jarrow P-5-P']) {
      expect(all).not.toContain(title)
      expect(productPicks.some(x => x.name === title)).toBe(false)
    }
  })
})

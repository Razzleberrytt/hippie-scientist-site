import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const OWNER = path.join(ROOT, 'app/guides/sleep/magnesium-types-for-sleep/page.tsx')
const ALIAS = path.join(ROOT, 'app/guides/sleep/magnesium-forms-for-sleep-buying-guide/page.tsx')
const HUB = path.join(ROOT, 'app/guides/sleep/page.tsx')
const EXISTING = path.join(ROOT, 'app/guides/sleep/best-magnesium-for-sleep/page.tsx')
const REDIRECTS = path.join(ROOT, 'public/_redirects')
const read = (file: string) => fs.readFileSync(file, 'utf8')

describe('magnesium forms for sleep — single canonical decision owner', () => {
  it('protects existing citation owner and sends the duplicate buyer alias through 301', () => {
    expect(fs.existsSync(OWNER)).toBe(true)
    expect(fs.existsSync(ALIAS)).toBe(false)
    expect(read(EXISTING)).toContain("const SLUG = 'best-magnesium-for-sleep'")
    const redirects = read(REDIRECTS)
    expect(redirects).toContain('/guides/sleep/magnesium-forms-for-sleep-buying-guide /guides/sleep/magnesium-types-for-sleep/ 301')
    expect(redirects).toContain('/guides/sleep/magnesium-forms-for-sleep-buying-guide/ /guides/sleep/magnesium-types-for-sleep/ 301')
    expect(read(HUB)).toContain('/guides/sleep/magnesium-types-for-sleep/')
    expect(read(HUB)).not.toContain("href: '/guides/sleep/magnesium-forms-for-sleep-buying-guide/'")
  })

  it('preserves six-form comparison with labeled responsive table and price/GI columns', () => {
    const text = read(OWNER)
    for (const form of ['Glycinate / bisglycinate', 'Citrate', 'L-threonate', 'Malate', 'Taurate', 'Oxide']) {
      expect(text).toContain("name: '" + form + "'")
    }
    for (const field of ['amount:', 'evidence:', 'gi:', 'price:']) expect(text).toContain(field)
    expect(text).toContain('ResponsiveTable')
    expect(text).toContain('<caption className="sr-only">')
    expect(text).toContain('scope="row"')
    expect(text).toContain('scope="col"')
    expect(text).toContain('id="buying-comparison"')
  })

  it('holds the clinical null findings and directness limitations', () => {
    const text = read(OWNER)
    for (const pmid of ['42661485', '40918053', '39252819', '41601871', '23853635', '33865376', '21199787', '40567408']) {
      expect(text).toContain(pmid)
    }
    expect(text).toContain('no magnesium-specific sleep benefit')
    expect(text).toContain('No verified malate-only sleep trial')
    expect(text).toContain('No verified taurate-only sleep trial')
    expect(text).toMatch(/low.to.very.low certainty/i)
    expect(text).not.toContain('cures insomnia')
  })

  it('retains disclosed trial funding and trial corrections for commercial decisions', () => {
    const text = read(OWNER)
    expect(text).toContain('AIDP')
    expect(text).toContain('Threotech')
    expect(text).toContain('nutraceutical')
    expect(text).toContain('delayed trial registration')
    expect(text).toContain('two-tailed')
    expect(text).toContain('10.3389/fnut.2026.2010644')
  })

  it('keeps all direct named-product picks withheld without explicit HIGH-confidence verification', () => {
    const text = read(OWNER)
    expect(text).toContain('<AffiliateDisclosure />')
    expect(text).toContain('<RecommendationSection')
    expect(text).toContain('products={[]}')
    expect(text).toContain('No product-specific Amazon ASIN')
    expect(text).not.toContain('AFFILIATE_TAGS.amazon')
    expect(text).not.toContain('data-product-slot="search-only"')
    expect(text).not.toContain('amazon.com/s?k=')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).not.toMatch(/amazon\.com\/dp\//i)
  })

  it('documents meaningful safety and eight question-format H2 FAQs', () => {
    const text = read(OWNER)
    for (const phrase of ['350 mg/day', 'kidney', 'antibiotics', 'bisphosphonates', 'elemental magnesium']) {
      expect(text.toLowerCase()).toContain(phrase.toLowerCase())
    }
    const faqBlock = text.slice(text.indexOf('const FAQS = ['), text.indexOf('const SOURCES = ['))
    expect((faqBlock.match(/question: '/g) || []).length).toBe(8)
    expect(text).toContain('<h2 className="text-lg font-semibold text-ink">{faq.question}</h2>')
  })
})

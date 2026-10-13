import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/sleep/magnesium-forms-for-sleep-buying-guide/page.tsx')
const HUB = path.join(process.cwd(), 'app/guides/sleep/page.tsx')
const EXISTING = path.join(process.cwd(), 'app/guides/sleep/best-magnesium-for-sleep/page.tsx')

function read(file: string) {
  return fs.readFileSync(file, 'utf8')
}

describe('magnesium sleep six-form buyer comparison', () => {
  it('adds a new discoverable route without replacing the existing article', () => {
    expect(read(EXISTING)).toContain("const SLUG = 'best-magnesium-for-sleep'")
    expect(read(HUB)).toContain('/guides/sleep/magnesium-forms-for-sleep-buying-guide/')
    expect(read(PAGE)).toContain("alternates: { canonical: PATH }")
  })

  it('shows all six forms and the label-comparison fields', () => {
    const text = read(PAGE)
    for (const form of ['Glycinate / bisglycinate', 'Citrate', 'L-threonate', 'Malate', 'Taurate', 'Oxide']) {
      expect(text).toContain("name: '" + form + "'")
    }
    for (const field of ['amount:', 'evidence:', 'gi:', 'price:', 'absorption:', 'trial:', 'fit:']) {
      expect(text).toContain(field)
    }
    expect(text).toContain('ResponsiveTable')
    expect(text).toMatch(/typical label serving/i)
  })

  it('retains exact human sleep evidence and explicit null findings', () => {
    const text = read(PAGE)
    for (const pmid of ['42661485', '40918053', '39252819', '41601871', '23853635', '33865376']) {
      expect(text).toContain(pmid)
    }
    expect(text).toContain('21199787')
    expect(text).toMatch(/citrate.*(?:sleep scores improved in both groups|did not outperform placebo|no magnesium-specific)/i)
    expect(text).toContain('40567408')
    expect(text).toContain('10.3389/fnut.2026.2010644')
    expect(text).toMatch(/three L-threonate trials/i)
    expect(text).toMatch(/small effect d = 0\.2/)
    expect(text).toMatch(/no between-group wearable sleep-outcome difference/)
    expect(text).toMatch(/No verified direct malate-only randomized sleep trial/i)
    expect(text).toMatch(/No verified direct taurate-only randomized sleep trial/i)
    expect(text).not.toContain('No verified direct citrate-only randomized sleep trial')
    expect(text).toMatch(/low to very-low certainty/i)
    expect(text).not.toMatch(/cures? insomnia/i)
  })

  it('holds non-HIGH-ASIN direct picks, discloses sponsored search links, and uses central tag', () => {
    const text = read(PAGE)
    expect(text).toContain('<AffiliateDisclosure />')
    expect(text).toContain('AFFILIATE_TAGS.amazon')
    expect(text).toContain("canRenderConfiguredRevenueProducts('magnesium')")
    expect(text).toContain('No direct ASIN-backed product pick is approved')
    expect(text).toContain('data-product-slot="search-only"')
    expect(text).toContain('nofollow sponsored noopener noreferrer')
    expect(text).not.toMatch(/amazon\.com\/dp\//i)
    expect(text).not.toMatch(/B0[A-Z0-9]{8}/)
    expect(text).not.toContain('getRevenueProductSet')
  })

  it('preserves the 350 mg supplemental UL and drug/kidney safety limits', () => {
    const text = read(PAGE)
    for (const fragment of ['350 mg/day', 'Kidney impairment', 'tetracyclines', 'quinolones', 'bisphosphonates', '4–6 hours', 'Diarrhea']) {
      expect(text).toContain(fragment)
    }
  })

  it('exposes eight substantive question H2 FAQ answers with reference markers', () => {
    const text = read(PAGE)
    const start = text.indexOf('const FAQS = [')
    const end = text.indexOf('const REFS = [')
    const faqText = text.slice(start, end)
    expect((faqText.match(/question: '/g) || []).length).toBe(8)
    expect(text).toContain('<h2 className="text-xl font-semibold text-ink">{question}</h2>')
    expect(text).toContain('<Cites refs={refs} />')
    expect(text).toContain('data-answer-engine-summary')
  })
})

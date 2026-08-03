import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

const BUYING_GUIDE = 'app/guides/adhd/best-magnesium-supplement-for-adhd/page.tsx'
const COMPARISON = 'app/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd/page.tsx'

describe('ADHD magnesium evidence calibration', () => {
  it('keeps both stable high-intent routes evidence-first and source-backed', () => {
    const buyingGuide = read(BUYING_GUIDE)
    const comparison = read(COMPARISON)

    expect(buyingGuide).toContain("const PATH = '/guides/adhd/best-magnesium-supplement-for-adhd'")
    expect(comparison).toContain("const PATH = '/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd'")

    for (const source of [buyingGuide, comparison]) {
      expect(source).toContain('40918053')
      expect(source).toContain('23808779')
      expect(source).toContain('30496768')
      expect(source).toContain('ods.od.nih.gov/factsheets/Magnesium-HealthProfessional')
      expect(source).toContain("getRevenueProductSet('magnesium')")
      expect(source).toContain('<AffiliateDisclosure')
      expect(source).not.toContain('amazon.com/s?k=')
      expect(source).not.toContain('AFFILIATE_TAGS')
    }
  })

  it('does not restore categorical form superiority or unsupported dose claims', () => {
    const combined = `${read(BUYING_GUIDE)}\n${read(COMPARISON)}`

    expect(combined).toContain('no magnesium form has been proven best for core ADHD symptoms')
    expect(combined).toContain('There is no direct ADHD head-to-head trial')
    expect(combined).not.toContain('Magnesium Glycinate — The Best First Choice')
    expect(combined).not.toContain('poor absorption (~4% bioavailability)')
    expect(combined).not.toContain('200–400 mg of elemental magnesium daily')
    expect(combined).not.toContain('glycine component adds mild calming support')
  })

  it('separates the two pages by searcher decision', () => {
    const buyingGuide = read(BUYING_GUIDE)
    const comparison = read(COMPARISON)

    expect(buyingGuide).toContain('How to read the label')
    expect(buyingGuide).toContain('Compare elemental magnesium per serving')
    expect(comparison).toContain('Symmetrical comparison')
    expect(comparison).toContain('Glycinate vs citrate without the marketing shortcuts')
  })
})

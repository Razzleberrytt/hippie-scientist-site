import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/sleep/best-herbs-for-sleep/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('best herbs for sleep evidence calibration', () => {
  it('preserves publication history and anchors the herb guide to direct evidence', () => {
    const text = source()

    expect(text).toContain("const DATE = '2026-06-09'")
    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toContain('34559859')
    expect(text).toContain('38359657')
    expect(text).toContain('31714321')
    expect(text).toContain('31006899')
    expect(text).toMatch(/5 placebo-controlled RCTs \/ 400 adults/i)
    expect(text).toMatch(/110 adults with DSM-5 insomnia/i)
    expect(text).toMatch(/8 systematic reviews/i)
  })

  it('does not restore rankings, fastest-choice promises, or bedtime dose protocols', () => {
    const text = source()

    expect(text).not.toMatch(/Evidence-Ranked Guide/i)
    expect(text).not.toMatch(/Best first choice overall/i)
    expect(text).not.toMatch(/Which Sleep Herb Should You Start With/i)
    expect(text).not.toMatch(/Which natural sleep supplement works fastest/i)
    expect(text).not.toMatch(/200[–-]400 mg elemental/i)
    expect(text).not.toMatch(/100[–-]200 mg/i)
    expect(text).not.toMatch(/300[–-]600 mg\/day/i)
    expect(text).not.toMatch(/30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/default starting point for most people/i)
    expect(text).toMatch(/There is no evidence-based “first herb” for every sleep problem/i)
  })

  it('keeps weak and mixed herb evidence weak and mixed', () => {
    const text = source()

    expect(text).toMatch(/Ashwagandha.*Limited sleep signal/i)
    expect(text).toMatch(/Passionflower.*Preliminary/i)
    expect(text).toMatch(/Valerian.*Not established for insomnia/i)
    expect(text).toMatch(/Chamomile.*Inconclusive/i)
    expect(text).toMatch(/Lavender \/ aromatherapy.*Indirect for an oral-herb claim/i)
    expect(text).toMatch(/no evidence of efficacy for treating insomnia/i)
    expect(text).toMatch(/no conclusive clinical-trial evidence that chamomile helps insomnia/i)
  })

  it('does not misclassify magnesium or L-theanine as herbs', () => {
    const text = source()

    expect(text).toMatch(/Magnesium is a mineral and L-theanine is an amino acid/i)
    expect(text).toContain('/guides/sleep/best-supplements-for-sleep/')
    expect(text).not.toMatch(/Magnesium glycinate.*Limited–Moderate/i)
  })

  it('rejects evidence-free herb stacks and broad-page product rankings', () => {
    const text = source()

    expect(text).toMatch(/Separate herb studies do not validate a sleep stack/i)
    expect(text).toMatch(/Evidence for individual ingredients does not prove/i)
    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).not.toContain('AFFILIATE_TAGS')
    expect(text).not.toMatch(/amazon\.com/i)
    expect(text).toMatch(/broad guide intentionally does not rank affiliate products/i)
  })

  it('preserves ingredient-specific safety and chronic-insomnia boundaries', () => {
    const text = source()

    expect(text).toMatch(/rare liver injury/i)
    expect(text).toMatch(/pregnancy\/breastfeeding avoidance/i)
    expect(text).toMatch(/drowsiness, dizziness, or confusion/i)
    expect(text).toMatch(/anesthesia interactions/i)
    expect(text).toMatch(/ragweed or related plants/i)
    expect(text).toMatch(/CBT-I.*first-line, evidence-based treatment for chronic insomnia/i)
    expect(text).toMatch(/loud snoring\/gasping, dangerous daytime sleepiness/i)
  })

  it('keeps FAQ schema content visible and preserves conversion/discovery surfaces', () => {
    const text = source()

    expect(text).toMatch(/Frequently asked questions/i)
    expect(text).toContain('{FAQS.map((faq) => (')
    expect(text).toMatch(/faqPageJsonLd\(\{ pagePath: `\/guides\/sleep\/\$\{SLUG\}\/`, questions: FAQS \}\)/)
    expect(text).toContain('<EmailCapture')
    expect(text).toContain('<NewsletterCtaBlock')
    expect(text).toContain('/guides/sleep/ashwagandha-for-sleep/')
    expect(text).toContain('/guides/compare/sleep-herbs-vs-melatonin/')
  })
})

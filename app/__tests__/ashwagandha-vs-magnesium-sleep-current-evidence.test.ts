import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(
  process.cwd(),
  'app/guides/sleep/ashwagandha-vs-magnesium-for-sleep/page.tsx',
)

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('ashwagandha vs magnesium sleep evidence calibration', () => {
  it('anchors the page to current direct sleep evidence', () => {
    const text = source()
    expect(text).toContain('https://pubmed.ncbi.nlm.nih.gov/34559859/')
    expect(text).toContain('https://pubmed.ncbi.nlm.nih.gov/33865376/')
    expect(text).toContain('https://pubmed.ncbi.nlm.nih.gov/40918053/')
    expect(text).toMatch(/five randomized trials \/ 400 adults/i)
    expect(text).toMatch(/three randomized trials \/ 151 older adults/i)
    expect(text).toMatch(/155 adults/i)
    expect(text).toMatch(/Cohen d=0\.2/i)
  })

  it('does not restore a same-night magnesium-first protocol', () => {
    const text = source()
    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/If you only try one tonight: magnesium glycinate/i)
    expect(text).not.toMatch(/100(?:&ndash;|–|-)300\s*mg/i)
    expect(text).not.toMatch(/30(?:&ndash;|–|-)60 minutes before bed/i)
    expect(text).not.toMatch(/start with magnesium glycinate/i)
    expect(text).not.toMatch(/Winner \/ Best Fit/i)
    expect(text).toMatch(/same-night effect\?/i)
    expect(text).toMatch(/Not established/i)
  })

  it('keeps the newer magnesium trial in context rather than turning it into a form winner', () => {
    const text = source()
    expect(text).toMatch(/four-week daily intervention/i)
    expect(text).toMatch(/small effect size/i)
    expect(text).toMatch(/does not prove superiority over glycinate\/citrate\/other forms/i)
    expect(text).toMatch(/same-night rescue effect/i)
  })

  it('does not treat separate ingredient trials as evidence for the combination', () => {
    const text = source()
    expect(text).toMatch(/No direct evidence establishes the combination as better/i)
    expect(text).toMatch(/Separate ashwagandha and magnesium trials do not prove that combining them improves sleep more/i)
    expect(text).not.toMatch(/combination is generally reasonable/i)
    expect(text).not.toMatch(/add the second if needed/i)
  })

  it('keeps ingredient-specific safety boundaries visible', () => {
    const text = source()
    expect(text).toMatch(/rare liver injury/i)
    expect(text).toMatch(/pregnancy\/breastfeeding avoidance/i)
    expect(text).toMatch(/thyroid and autoimmune cautions/i)
    expect(text).toMatch(/impaired kidney function/i)
    expect(text).toMatch(/oral bisphosphonates/i)
    expect(text).toMatch(/tetracycline\/quinolone antibiotics/i)
  })

  it('keeps chronic insomnia care and visible FAQ content on the page', () => {
    const text = source()
    expect(text).toMatch(/CBT-I.*first-line, evidence-based treatment for chronic insomnia/i)
    expect(text).toMatch(/Frequently asked questions/i)
    expect(text).toContain('{FAQS.map((faq) => (')
  })

  it('preserves publication history while recording the evidence update', () => {
    const text = source()
    expect(text).toContain("const DATE = '2026-06-09'")
    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
  })
})

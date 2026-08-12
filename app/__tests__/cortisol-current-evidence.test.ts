import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/how-to-lower-cortisol-naturally/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('cortisol guide evidence calibration', () => {
  it('anchors endocrine testing and treatment boundaries to authoritative guidance', () => {
    const text = source()

    expect(text).toContain('Diagnosis of Cushing’s Syndrome guideline')
    expect(text).toContain('Treatment of Cushing’s Syndrome guideline')
    expect(text).toContain('www.niddk.nih.gov/health-information/endocrine-diseases/cushings-syndrome')
    expect(text).toMatch(/recommends against widespread testing/i)
    expect(text).toMatch(/random serum cortisol or plasma ACTH as screening tests/i)
    expect(text).toMatch(/recommends against treatment intended to lower cortisol or block its action when Cushing’s syndrome has not been established/i)
    expect(text).toContain("const DATE = '2026-08-11'")
  })

  it('does not restore wellness-style high-cortisol diagnosis or rapid-lowering promises', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/fastest and most powerful lever on cortisol/i)
    expect(text).not.toMatch(/blunts cortisol within an hour/i)
    expect(text).not.toMatch(/HPA dysregulation/i)
    expect(text).not.toMatch(/strongest supplement evidence/i)
    expect(text).not.toMatch(/herbs with the strongest evidence, in priority order/i)
    expect(text).not.toMatch(/reduce cortisol within minutes/i)
    expect(text).not.toMatch(/Typical dose is 300[–-]600/i)
    expect(text).not.toMatch(/200[–-]400\s*mg of a standardized extract/i)
  })

  it('states that common symptoms do not diagnose pathological cortisol excess', () => {
    const text = source()

    expect(text).toMatch(/Do not self-diagnose “high cortisol” from generic stress symptoms/i)
    expect(text).toMatch(/Fatigue, poor sleep, weight change, low mood, anxiety, and blood-pressure changes are common and nonspecific/i)
    expect(text).toMatch(/subjective feeling of stress does not establish persistent hypercortisolism/i)
    expect(text).toMatch(/consumer cortisol result should not be interpreted in isolation as a diagnosis/i)
  })

  it('calibrates sleep and stress-management cortisol claims to current pooled evidence', () => {
    const text = source()

    expect(text).toContain('38777757')
    expect(text).toContain('37879237')
    expect(text).toMatch(/24 acute sleep-deprivation studies found no significant overall cortisol difference/i)
    expect(text).toMatch(/58 randomized studies involving 3,508 participants/i)
    expect(text).toMatch(/modest pooled change in cortisol versus controls/i)
    expect(text).toMatch(/not to optimize a home cortisol score/i)
  })

  it('keeps ashwagandha biomarker evidence separate from endocrine treatment', () => {
    const text = source()

    expect(text).toContain('39348746')
    expect(text).toMatch(/nine randomized trials \/ 558 participants/i)
    expect(text).toMatch(/repeated-dose stress-research signal/i)
    expect(text).toMatch(/does not establish treatment for Cushing’s syndrome/i)
    expect(text).toMatch(/do not turn a biomarker change in a stress trial into a claim that a supplement “treats high cortisol.”/i)
  })

  it('preserves medical and crisis escalation rules', () => {
    const text = source()

    expect(text).toMatch(/glucocorticoid exposure/i)
    expect(text).toMatch(/Multiple progressive features/i)
    expect(text).toMatch(/adrenal incidental finding/i)
    expect(text).toMatch(/suicidal thoughts/i)
    expect(text).toMatch(/thoughts of self-harm/i)
    expect(text).toMatch(/inability to stay safe/i)
    expect(text).toMatch(/immediate crisis or emergency care/i)
  })

  it('does not monetize the endocrine-adjacent page as a cortisol-lowering product list', () => {
    const text = source()

    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).toMatch(/intentionally does not place affiliate product picks next to “lower cortisol” claims/i)
    expect(text).toContain('<EmailCapture location="guides-how-to-lower-cortisol-naturally" />')
  })
})

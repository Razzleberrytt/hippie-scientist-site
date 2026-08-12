import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/anxiety-stack-guide/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('anxiety stack evidence calibration', () => {
  it('anchors ingredient claims to current systematic reviews and direct trial context', () => {
    const text = source()

    expect(text).toContain('42410082')
    expect(text).toContain('39348746')
    expect(text).toContain('41815853')
    expect(text).toContain('38817505')
    expect(text).toContain('31 RCTs and 1,168 participants')
    expect(text).toContain('Nine placebo-controlled RCTs / 558 participants')
    expect(text).toContain('141 healthy adults ages 18–65 with moderate stress/anxiety for 8 weeks')
    expect(text).toContain('300 mg proprietary root extract twice daily')
    expect(text).toContain('15 interventional studies in the 2024 review; seven measured anxiety-related outcomes')
    expect(text).toContain("const DATE = '2026-08-11'")
  })

  it('does not restore named stack recipes or rapid-anxiety promises', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/Beginner Stack:/i)
    expect(text).not.toMatch(/Stress Stack:/i)
    expect(text).not.toMatch(/Racing Thoughts Stack:/i)
    expect(text).not.toMatch(/Anxiety \+ Sleep Stack:/i)
    expect(text).not.toMatch(/Full Stack:/i)
    expect(text).not.toMatch(/works within 30[–-]60 minutes/i)
    expect(text).not.toMatch(/most reliable beginner stack/i)
    expect(text).not.toMatch(/synergy — using lower doses of multiple compounds/i)
  })

  it('states the central combination-evidence boundary', () => {
    const text = source()

    expect(text).toMatch(/Ingredient evidence does not validate a named anxiety stack/i)
    expect(text).toMatch(/A positive trial for one ingredient does not tell us whether adding a second or third ingredient improves the outcome/i)
    expect(text).toMatch(/Combining ingredients creates a new evidence and interaction question/i)
    expect(text).toMatch(/changing one variable at a time is easier to interpret/i)
  })

  it('keeps the three ingredient evidence limits distinct', () => {
    const text = source()

    expect(text).toMatch(/Acute stress effect was modest and bias-sensitive; anxiety findings were inconsistent overall/i)
    expect(text).toMatch(/Repeated-dose, formulation-specific evidence in stressed adults; long-term safety remains less certain/i)
    expect(text).toMatch(/Populations, salts, doses, durations, baseline status, and co-ingredients varied substantially/i)
  })

  it('uses the canonical guide route in metadata and structured data', () => {
    const text = source()

    expect(text).toContain('path: `/guides/anxiety/${SLUG}`')
    expect(text).toContain('`/guides/anxiety/${SLUG}/`')
    expect(text).not.toContain('`/articles/${slug}`')
  })

  it('includes clear medication, complexity, and crisis stop rules', () => {
    const text = source()

    expect(text).toMatch(/Review medications and health conditions first/i)
    expect(text).toMatch(/Multiple sedating substances/i)
    expect(text).toMatch(/suicidal thoughts/i)
    expect(text).toMatch(/thoughts of self-harm/i)
    expect(text).toMatch(/inability to stay safe/i)
    expect(text).toMatch(/immediate emergency or crisis care/i)
  })

  it('preserves evidence discovery and symmetric neutral monetization plumbing', () => {
    const text = source()

    expect(text).toContain('/guides/anxiety/l-theanine-for-anxiety/')
    expect(text).toContain('/guides/anxiety/ashwagandha-for-anxiety/')
    expect(text).toContain('/guides/other/magnesium-types-guide/')
    expect(text).toContain("getRevenueProductSet('ashwagandha')")
    expect(text).toContain("getRevenueProductSet('l-theanine')")
    expect(text).toContain("getRevenueProductSet('magnesium')")
    expect(text).toContain('<RecommendationSection products={comparisonProducts} />')
    expect(text).toMatch(/cover the three ingredients compared on this page—ashwagandha, L-theanine, and magnesium/i)
    expect(text).toContain('<NewsletterCtaBlock />')
    expect(text).toContain('<EmailCapture />')
  })
})

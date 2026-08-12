import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(
  process.cwd(),
  'app/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/page.tsx',
)

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('nighttime stress and anxiety evidence calibration', () => {
  it('anchors the page to current direct evidence and insomnia guidance', () => {
    const text = source()

    expect(text).toContain('42410082')
    expect(text).toContain('39348746')
    expect(text).toContain('41815853')
    expect(text).toContain('www.nccih.nih.gov/health/passionflower')
    expect(text).toContain('new-guideline-supports-behavioral-psychological-treatments-for-insomnia')
    expect(text).toContain('31 randomized trials and 1,168 participants')
    expect(text).toContain('nine randomized placebo-controlled trials and 558 participants')
    expect(text).toContain("const DATE = '2026-08-11'")
  })

  it('does not restore the old rapid-onset or treatment-like supplement claims', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/fastest-acting option/i)
    expect(text).not.toMatch(/most reliable fast-acting/i)
    expect(text).not.toMatch(/effects within 30[–-]60 minutes/i)
    expect(text).not.toMatch(/stacks cleanly/i)
    expect(text).not.toMatch(/work the same night/i)
    expect(text).not.toMatch(/addresses the cause rather than just the symptom/i)
    expect(text).not.toMatch(/most reliable calming bedtime options/i)
    expect(text).not.toMatch(/quiet[s]? stress-driven arousal within an hour/i)
  })

  it('keeps L-theanine study timing separate from anxiety relief', () => {
    const text = source()

    expect(text).toMatch(/study timing should not be converted into a guaranteed anxiety-relief onset/i)
    expect(text).toMatch(/attention outcome, not demonstrated acute anxiety relief/i)
    expect(text).toMatch(/does not support calling L-theanine a dependable same-night anxiolytic/i)
  })

  it('states passionflower uncertainty and concrete safety limits', () => {
    const text = source()

    expect(text).toMatch(/conclusions about anxiety are not definite/i)
    expect(text).toMatch(/sleep-onset and sleep-maintenance findings are mixed/i)
    expect(text).toMatch(/drowsiness, dizziness, and confusion/i)
    expect(text).toMatch(/should not be used during pregnancy/i)
    expect(text).toMatch(/interact with anesthesia/i)
  })

  it('states the direct trial context behind the ashwagandha signal', () => {
    const text = source()

    expect(text).toMatch(/141 healthy men and women ages 18[–-]65 with moderate stress and anxiety/i)
    expect(text).toMatch(/8 weeks to 300 mg of a proprietary ashwagandha root extract twice daily/i)
    expect(text).toMatch(/another root extract, or placebo/i)
    expect(text).toMatch(/formulation-specific evidence in stressed adults/i)
  })

  it('places chronic insomnia in the CBT-I evidence context', () => {
    const text = source()

    expect(text).toMatch(/CBT-I has a strong guideline recommendation/i)
    expect(text).toMatch(/ranked herb list is not an evidence-equivalent replacement/i)
    expect(text).toMatch(/move beyond sleep-hygiene tips and consider CBT-I/i)
  })

  it('restores an explicit immediate-crisis stop rule', () => {
    const text = source()

    expect(text).toMatch(/Immediate stop rule/i)
    expect(text).toMatch(/suicidal thoughts/i)
    expect(text).toMatch(/thoughts of self-harm/i)
    expect(text).toMatch(/inability to stay safe/i)
    expect(text).toMatch(/seek immediate emergency or crisis care/i)
  })

  it('preserves monetization and internal evidence discovery without turning products into treatment picks', () => {
    const text = source()

    expect(text).toContain("getRevenueProductSet('ashwagandha')")
    expect(text).toContain('<RecommendationSection products={ashwagandhaProducts.products} />')
    expect(text).toContain('/guides/anxiety/natural-anxiety-relief/')
    expect(text).toContain('/guides/anxiety/l-theanine-for-anxiety/')
    expect(text).toContain('/guides/anxiety/ashwagandha-for-anxiety/')
  })
})

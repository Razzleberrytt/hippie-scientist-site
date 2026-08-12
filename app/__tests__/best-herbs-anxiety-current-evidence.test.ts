import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/best-herbs-for-anxiety/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('best herbs for anxiety evidence calibration', () => {
  it('anchors the comparison to direct current evidence', () => {
    const text = source()

    expect(text).toContain('36717399')
    expect(text).toContain('24456909')
    expect(text).toContain('39348746')
    expect(text).toContain('11679026')
    expect(text).toContain('31813230')
    expect(text).toContain('1,213 adult outpatients')
    expect(text).toContain('nine randomized placebo-controlled trials and 558 participants')
    expect(text).toContain('36 outpatients for 4 weeks')
    expect(text).toContain('171 non-medicated adults')
    expect(text).toContain("const DATE = '2026-08-11'")
  })

  it('keeps Silexan evidence formulation-specific', () => {
    const text = source()

    expect(text).toMatch(/proprietary oral lavender-oil preparation/i)
    expect(text).toMatch(/does not automatically apply to lavender tea, aromatherapy, raw essential oil/i)
    expect(text).toMatch(/supports the studied oral preparation—not every lavender product/i)
  })

  it('does not restore same-day herb rankings or overclaim tiny active-comparator data', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/Best herb choice/i)
    expect(text).not.toMatch(/Same-day calming:/i)
    expect(text).not.toMatch(/Acute \/ situational anxiety/i)
    expect(text).not.toMatch(/comparable to oxazepam/i)
    expect(text).not.toMatch(/Kava \(aqueous extract, low dose\)/i)
    expect(text).not.toMatch(/Addresses root HPA dysregulation/i)
    expect(text).not.toMatch(/best for acute anxiety/i)
  })

  it('states passionflower and kava evidence limits concretely', () => {
    const text = source()

    expect(text).toMatch(/small pilot cannot establish equivalence/i)
    expect(text).toMatch(/NCCIH still considers the broader anxiety evidence too limited for definite conclusions/i)
    expect(text).toMatch(/Kava did not significantly outperform placebo/i)
    expect(text).toMatch(/rare severe and sometimes fatal liver injury/i)
    expect(text).toMatch(/avoid combining kava with benzodiazepines or alcohol/i)
  })

  it('preserves an explicit crisis and medication stop rule', () => {
    const text = source()

    expect(text).toMatch(/suicidal thoughts/i)
    expect(text).toMatch(/thoughts of self-harm/i)
    expect(text).toMatch(/inability to stay safe/i)
    expect(text).toMatch(/immediate emergency or crisis care/i)
    expect(text).toMatch(/Do not stop, reduce, or replace prescribed anxiety medication/i)
  })

  it('keeps monetization transparent instead of ranking one herb through affiliate placement', () => {
    const text = source()

    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).toMatch(/broad comparison intentionally does not rank affiliate products/i)
    expect(text).toMatch(/monetization does not silently decide which herb appears to be the winner/i)
    expect(text).toContain('<NewsletterCtaBlock />')
    expect(text).toContain('<EmailCapture />')
  })

  it('preserves evidence discovery across the anxiety cluster', () => {
    const text = source()

    expect(text).toContain('/guides/anxiety/natural-anxiety-relief/')
    expect(text).toContain('/guides/anxiety/anxiety-stack-guide/')
    expect(text).toContain('/guides/anxiety/l-theanine-for-anxiety/')
    expect(text).toContain('/guides/anxiety/ashwagandha-for-anxiety/')
    expect(text).toContain('/guides/kava/')
  })
})

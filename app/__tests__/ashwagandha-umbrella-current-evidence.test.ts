import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/herbs/ashwagandha/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('ashwagandha umbrella evidence calibration', () => {
  it('preserves publication history and anchors the guide to current evidence', () => {
    const text = source()

    expect(text).toContain("const DATE = '2026-06-26'")
    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toMatch(/date: DATE, updated: UPDATED_DATE/)
    expect(text).toContain('39348746')
    expect(text).toContain('41644067')
    expect(text).toContain('34559859')
    expect(text).toContain('42199854')
    expect(text).toContain('www.nccih.nih.gov/health/ashwagandha')
    expect(text).toMatch(/nine randomized trials \/ 558 participants/i)
    expect(text).toMatch(/five randomized trials \/ 400 adults/i)
    expect(text).toMatch(/20 studies \/ 1,249 participants/i)
  })

  it('keeps evidence hierarchy outcome-specific', () => {
    const text = source()

    expect(text).toMatch(/title="Ashwagandha — stress" evidenceLevel="Moderate"/i)
    expect(text).toMatch(/title="Ashwagandha — anxiety" evidenceLevel="Limited"/i)
    expect(text).toMatch(/title="Ashwagandha — sleep" evidenceLevel="Limited"/i)
    expect(text).toMatch(/title="Ashwagandha — cognition and physical outcomes" evidenceLevel="Limited"/i)
    expect(text).toMatch(/NCCIH.*anxiety remains unclear/i)
    expect(text).toMatch(/No outcome had enough studies for reliable publication-bias assessment/i)
  })

  it('does not restore rescue-dose, HPA-diagnosis, or fixed-course language', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/cortisol rhythms feel dysregulated/i)
    expect(text).not.toMatch(/6[–-]8 week course/i)
    expect(text).not.toMatch(/L-theanine \(100[–-]200 mg\).*faster/i)
    expect(text).not.toMatch(/melatonin \(0\.3[–-]1 mg\).*faster/i)
    expect(text).not.toMatch(/acute cortisol spike/i)
    expect(text).not.toMatch(/works by modulating the HPA axis over time/i)
    expect(text).toMatch(/do not diagnose 'HPA dysregulation'/i)
    expect(text).toMatch(/Cortisol is a study outcome, not a DIY diagnosis/i)
    expect(text).toMatch(/trial regimens are study context, not personal dosing instructions/i)
  })

  it('does not crown branded extracts or infer evidence-free stacks', () => {
    const text = source()

    expect(text).toMatch(/There is no universal evidence-based winner/i)
    expect(text).toMatch(/A KSM-66 trial validates KSM-66 in that trial; a Sensoril trial validates Sensoril in that trial/i)
    expect(text).not.toMatch(/KSM-66 has more anxiety and stress trials/i)
    expect(text).not.toMatch(/Sensoril has more insomnia and cortisol data/i)
    expect(text).not.toMatch(/no major documented interactions/i)
    expect(text).not.toMatch(/Many people stack them/i)
    expect(text).toMatch(/Separate trials of ashwagandha, magnesium, L-theanine, melatonin, or other supplements do not prove that combining them creates synergy or is safer/i)
  })

  it('preserves NCCIH safety ceilings and stop rules', () => {
    const text = source()

    expect(text).toMatch(/short-term use up to about three months may be safe/i)
    expect(text).toMatch(/rare cases of liver injury/i)
    expect(text).toMatch(/avoid ashwagandha during pregnancy and not use it while breastfeeding/i)
    expect(text).toMatch(/autoimmune or thyroid disorders/i)
    expect(text).toMatch(/diabetes and blood-pressure medicines, immunosuppressants, sedatives, anticonvulsants, and thyroid hormone medicines/i)
    expect(text).toMatch(/hormone-sensitive prostate cancer/i)
    expect(text).toMatch(/thoughts of self-harm/i)
  })

  it('keeps ingredient-specific monetization transparent rather than prescriptive', () => {
    const text = source()

    expect(text).toContain("getRevenueProductSet('ashwagandha')")
    expect(text).toContain('<RecommendationSection')
    expect(text).not.toContain('AFFILIATE_TAGS')
    expect(text).not.toMatch(/amazon\.com/i)
    expect(text).toMatch(/optional product-sourcing links.*not evidence that a commercial product will reproduce a trial result/i)
    expect(text).toMatch(/Independent quality testing can help with identity and contamination, but it does not prove efficacy/i)
    expect(text).toContain('<NewsletterCtaBlock />')
    expect(text).toContain('<EmailCapture />')
  })
})

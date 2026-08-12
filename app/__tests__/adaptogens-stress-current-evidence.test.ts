import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/best-adaptogens-for-stress/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('adaptogens for stress evidence calibration', () => {
  it('anchors the comparison to auditable randomized human evidence', () => {
    const text = source()

    expect(text).toContain('41906501')
    expect(text).toContain('39348746')
    expect(text).toContain('19016404')
    expect(text).toContain('36185698')
    expect(text).toContain('23740477')
    expect(text).toContain('nine trials / 558 participants')
    expect(text).toContain('60 adults ages 20–55 with stress-related fatigue for 28 days')
    expect(text).toContain('100 adults ages 18–65')
    expect(text).toContain('144 participants')
    expect(text).toContain("const DATE = '2026-08-11'")
  })

  it('does not restore mechanism-first rankings, fixed dosing, or prescriptive rotation language', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/If you only try one thing/i)
    expect(text).not.toMatch(/HPA axis regulator/i)
    expect(text).not.toMatch(/HPA dysregulation/i)
    expect(text).not.toMatch(/300[–-]600 mg\/day \(KSM-66 or Sensoril/i)
    expect(text).not.toMatch(/200[–-]400 mg.*before demanding tasks/i)
    expect(text).not.toMatch(/300[–-]1200 mg root extract/i)
    expect(text).not.toMatch(/Use an adaptogen rotation/i)
    expect(text).not.toMatch(/adaptogen rotation protocol/i)
    expect(text).not.toMatch(/stacking adaptogens: principles/i)
    expect(text).toMatch(/copying an “adaptogen rotation” or stack recipe built from unrelated trials/i)
  })

  it('keeps holy basil preliminary and discloses funding and industry ties', () => {
    const text = source()

    expect(text).toMatch(/one branded industry-funded signal should stay preliminary/i)
    expect(text).toMatch(/Holixer 125 mg twice daily or placebo for 8 weeks/i)
    expect(text).toMatch(/funded by Natural Remedies/i)
    expect(text).toMatch(/supplied the capsules/i)
    expect(text).toMatch(/nutraceutical-industry funding and honoraria/i)
    expect(text).toMatch(/should not be generalized to holy-basil tea, every extract/i)
  })

  it('surfaces negative eleuthero evidence and omits unauditable schisandra ranking', () => {
    const text = source()

    expect(text).toMatch(/Adding eleuthero was not superior to stress-management training alone/i)
    expect(text).toMatch(/authors described any added effect as negligible/i)
    expect(text).toMatch(/Schisandra:.*omitted from the ranked comparison until stronger direct evidence justifies inclusion/i)
    expect(text).not.toMatch(/Schisandra Berry \(Schisandra chinensis\)/i)
    expect(text).not.toMatch(/500[–-]2000 mg dried fruit extract/i)
  })

  it('states the combination-evidence boundary instead of prescribing adaptogen stacks', () => {
    const text = source()

    expect(text).toMatch(/Separate trials of ashwagandha, Rhodiola, or holy basil do not prove that combining them creates synergy/i)
    expect(text).toMatch(/multi-herb formula is a new intervention/i)
    expect(text).toMatch(/changing one variable at a time is easier to interpret/i)
    expect(text).toMatch(/Study regimens describe research context; they are not personal dosing instructions/i)
  })

  it('preserves source-backed ingredient-specific safety boundaries', () => {
    const text = source()

    expect(text).toContain('www.nccih.nih.gov/health/rhodiola')
    expect(text).toContain('25413939')
    expect(text).toContain('8880292')
    expect(text).toContain('30000865')
    expect(text).toContain('12580002')
    expect(text).toMatch(/Rhodiola:.*dizziness, headache, insomnia/i)
    expect(text).toMatch(/reported interaction with losartan/i)
    expect(text).toMatch(/restlessness and trembling after Rhodiola was added to paroxetine/i)
    expect(text).toMatch(/Holy basil:.*lower fasting and post-meal glucose/i)
    expect(text).toMatch(/Eleuthero:.*possible blood-pressure, bleeding, and blood-sugar effects/i)
    expect(text).toMatch(/interfere with certain digoxin laboratory assays/i)
    expect(text).toMatch(/rather than assuming an abnormal level reflects a true pharmacologic interaction/i)
  })

  it('keeps broad-page monetization neutral and routes users to ingredient-specific evidence', () => {
    const text = source()

    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).toMatch(/broad adaptogen comparison intentionally does not rank affiliate products/i)
    expect(text).toContain('/guides/herbs/ashwagandha/')
    expect(text).toContain('/herbs/rhodiola/')
    expect(text).toContain('/herbs/holy-basil/')
    expect(text).toContain('<EmailCapture location="guides-best-adaptogens-for-stress" />')
  })
})

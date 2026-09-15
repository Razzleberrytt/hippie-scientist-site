import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/sleep/ashwagandha-for-sleep/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('ashwagandha sleep evidence calibration', () => {
  it('preserves publication history and anchors the page to current sleep-specific evidence', () => {
    const text = source()

    expect(text).toContain("const DATE = '2026-06-09'")
    expect(text).toContain("const UPDATED_DATE = '2026-09-14'")
    expect(text).toMatch(/date: DATE, updated: UPDATED_DATE/)
    for (const pmid of ['34559859', '31728244', '32818573', '32540634', '42029558', '40875185', '41824889', '40748423', '42593642']) {
      expect(text).toContain(pmid)
    }
    expect(text).toMatch(/five randomized trials \/ 400 adults/i)
    expect(text).toMatch(/60 adults with insomnia and anxiety/i)
    expect(text).toMatch(/150 healthy adults with non-restorative sleep/i)
  })

  it('keeps the evidence rating conservative and formulation directness explicit', () => {
    const text = source()

    expect(text).toMatch(/title="Ashwagandha for sleep" evidenceLevel="Limited"/i)
    expect(text).toMatch(/small significant overall sleep effect with moderate heterogeneity/i)
    expect(text).toMatch(/still does not establish a universal .*ashwagandha dose for sleep/i)
    expect(text).toMatch(/this was not a head-to-head extract trial/i)
    expect(text).toMatch(/evidence belongs to the studied formulation/i)
  })

  it('does not restore acute rescue, fixed timing, or universal dosage protocols', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/If you only try one thing: melatonin or L-theanine/i)
    expect(text).not.toMatch(/L-theanine.*100[–-]200.*30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/melatonin.*0\.3[–-]1.*30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/requires 6[–-]8 weeks/i)
    expect(text).not.toMatch(/Evening or nighttime dosing.*1[–-]2 hours before bed/i)
    expect(text).not.toMatch(/Dosage Reference.*Sleep Protocols/i)
    expect(text).not.toMatch(/Start at the lower end and assess tolerance before increasing/i)
    expect(text).toMatch(/study duration is not the same as a guaranteed personal onset/i)
    expect(text).toMatch(/There is no universal evidence-based bedtime timing rule/i)
  })

  it('keeps meta-analysis subgroup findings as context, not a prescription', () => {
    const text = source()

    expect(text).toMatch(/subgroup of insomnia participants, studies using at least 600 mg\/day, and studies lasting at least eight weeks/i)
    expect(text).toMatch(/between-study subgroup observations/i)
    expect(text).toMatch(/not randomized head-to-head proof that 600 mg is better/i)
    expect(text).toMatch(/120 mg\/day Shoden trial, 125 mg\/day Zenroot trial, and 150\/300 mg\/day AshwaSR trial/i)
  })

  it('separates subjective, objective, PK, and non-sleep evidence', () => {
    const text = source()

    expect(text).toMatch(/Pittsburgh Sleep Quality Index \(subjective\)/i)
    expect(text).toMatch(/Actigraphy primary SOL/i)
    expect(text).toMatch(/Bioavailability is not sleep efficacy/i)
    expect(text).toMatch(/measured blood exposure after a single dose rather than clinical sleep outcomes/i)
    expect(text).toMatch(/A 30 mg stress trial is not a 30 mg sleep trial/i)
    expect(text).toMatch(/Sleep was not an outcome/i)
  })

  it('does not crown a branded extract or formulation claim as best for sleep', () => {
    const text = source()

    expect(text).not.toMatch(/KSM-66 and Sensoril are the two.*strongest clinical research/i)
    expect(text).not.toMatch(/look for products standardized to withanolide content.*5%/i)
    expect(text).not.toMatch(/Most-studied form for sleep quality/i)
    expect(text).not.toMatch(/Best for: Stress-Driven Sleep Issues/i)
    expect(text).not.toMatch(/Best for: Lower Dose \/ Sensitive Users/i)
    expect(text).toMatch(/does not establish KSM-66, Sensoril, Shoden, Zenroot, AshwaSR, raw powder, or another preparation as the universal best sleep form/i)
  })

  it('preserves chronic-insomnia and NCCIH safety boundaries', () => {
    const text = source()

    expect(text).toMatch(/CBT-I.*first-line, evidence-based treatment for chronic insomnia/i)
    expect(text).toContain('www.nccih.nih.gov/health/ashwagandha')
    expect(text).toContain('www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches')
    expect(text).toContain('aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia')
    expect(text).toMatch(/short term, up to about three months/i)
    expect(text).toMatch(/rare cases of liver injury/i)
    expect(text).toMatch(/avoid it during pregnancy and not use it while breastfeeding/i)
    expect(text).toMatch(/autoimmune or thyroid disorders/i)
    expect(text).toMatch(/loud snoring\/gasping, dangerous daytime sleepiness, persistent insomnia/i)
  })

  it('represents the direct combination trial without inflating stack claims', () => {
    const text = source()

    expect(text).toMatch(/one direct ashwagandha \+ melatonin RCT now exists/i)
    expect(text).toMatch(/one direct specific-protocol trial/i)
    expect(text).toMatch(/does not establish.*universal stack synergy/i)
    expect(text).toMatch(/combining ashwagandha with L-theanine, magnesium, or other sleep supplements has comparable evidence/i)
    expect(text).not.toContain('AFFILIATE_TAGS')
    expect(text).not.toMatch(/amazon\.com/i)
    expect(text).toContain("getRevenueProductSet('ashwagandha')")
    expect(text).toContain('<RecommendationSection')
    expect(text).toMatch(/optional product-sourcing links.*not evidence that a commercial product will reproduce a sleep trial/i)
    expect(text).toMatch(/trademark, high withanolide percentage, sustained-release claim, bioavailability claim, or large milligram number is not evidence that the product is .*best for sleep/i)
    expect(text).toContain('<EmailCapture')
    expect(text).toContain('<NewsletterCtaBlock')
  })
})

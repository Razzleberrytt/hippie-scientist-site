import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/sleep/ashwagandha-vs-magnesium-for-sleep/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('ashwagandha vs magnesium sleep evidence calibration', () => {
  it('preserves publication history and anchors both sides to direct evidence', () => {
    const text = source()

    expect(text).toContain("const DATE = '2026-06-09'")
    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toMatch(/date: DATE, updated: UPDATED_DATE/)
    expect(text).toContain('34559859')
    expect(text).toContain('33865376')
    expect(text).toContain('40918053')
    expect(text).toMatch(/five randomized trials \/ 400 adults/i)
    expect(text).toMatch(/three randomized trials \/ 151 older adults/i)
    expect(text).toMatch(/155 adults/i)
    expect(text).toMatch(/250 mg elemental magnesium/i)
    expect(text).toMatch(/four weeks/i)
    expect(text).toMatch(/Cohen d=0\.2/i)
    expect(text).toMatch(/separate sleep-quality measure was not significantly different/i)
    expect(text).toMatch(/objective sleep was not measured/i)
  })

  it('keeps both sleep evidence ratings conservative and discloses trial context', () => {
    const text = source()

    expect(text).toMatch(/title="Ashwagandha for sleep" evidenceLevel="Limited"/i)
    expect(text).toMatch(/title="Magnesium for sleep" evidenceLevel="Limited"/i)
    expect(text).toMatch(/small significant overall sleep effect and moderate heterogeneity/i)
    expect(text).toMatch(/low-to-very-low certainty/i)
    expect(text).toMatch(/funded by the Institute of Food and One Health at Leibniz University Hannover/i)
    expect(text).toMatch(/one coauthor disclosed nutraceutical-industry research funding and presentation honoraria/i)
  })

  it('does not restore same-night winner, symptom-matching, or fixed bedtime protocols', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/If you only try one tonight: magnesium glycinate/i)
    expect(text).not.toMatch(/magnesium glycinate is the faster, lower-friction starting point/i)
    expect(text).not.toMatch(/100[–-]300\s*(?:mg|&nbsp;mg).*30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/add.*ashwagandha.*if stress-driven wakefulness persists/i)
    expect(text).not.toMatch(/Choose magnesium if:/i)
    expect(text).not.toMatch(/Choose ashwagandha if:/i)
    expect(text).not.toMatch(/Consider both if:/i)
    expect(text).not.toMatch(/start one first.*1[–-]2 weeks.*add the second/i)
    expect(text).not.toMatch(/Evening or nighttime dosing is standard for both/i)
    expect(text).not.toMatch(/start with ashwagandha \(KSM-66 or Sensoril\)/i)
    expect(text).not.toMatch(/start with magnesium glycinate/i)
    expect(text).not.toMatch(/combination is generally reasonable/i)
    expect(text).toMatch(/four-week daily intervention/i)
    expect(text).toMatch(/not a trial of one bedtime dose/i)
    expect(text).toMatch(/same-night rescue effect/i)
    expect(text).toMatch(/universal “magnesium first” sequence/i)
  })

  it('does not turn one bisglycinate trial or branded extracts into universal winners', () => {
    const text = source()

    expect(text).toMatch(/Bisglycinate now has one direct RCT/i)
    expect(text).toMatch(/does not prove superiority over glycinate\/citrate\/other forms/i)
    expect(text).toMatch(/No universal winner across KSM-66, Sensoril, Shoden, raw powder, or other preparations/i)
    expect(text).not.toMatch(/KSM-66 or Sensoril.*better/i)
  })

  it('does not turn separate ingredient trials into a validated combination', () => {
    const text = source()

    expect(text).toMatch(/No direct evidence establishes the combination as better/i)
    expect(text).toMatch(/Separate ashwagandha and magnesium trials do not prove that combining them improves sleep more, works faster, or is safer/i)
    expect(text).toMatch(/does not recommend starting one and automatically adding the other after a fixed number of days or weeks/i)
  })

  it('preserves chronic-insomnia and ingredient-specific safety boundaries', () => {
    const text = source()

    expect(text).toMatch(/CBT-I.*first-line, evidence-based treatment for chronic insomnia/i)
    expect(text).toContain('aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia')
    expect(text).toContain('www.nccih.nih.gov/health/ashwagandha')
    expect(text).toContain('ods.od.nih.gov/factsheets/Magnesium-HealthProfessional')
    expect(text).toMatch(/Ashwagandha:.*rare liver injury/i)
    expect(text).toMatch(/pregnancy\/breastfeeding avoidance/i)
    expect(text).toMatch(/thyroid and autoimmune cautions/i)
    expect(text).toMatch(/Magnesium:.*toxicity risk rises with impaired kidney function/i)
    expect(text).toMatch(/oral bisphosphonates and tetracycline\/quinolone antibiotics/i)
    expect(text).toMatch(/medication timing should be reviewed with a pharmacist or prescriber rather than guessed/i)
    expect(text).toMatch(/loud snoring\/gasping, dangerous daytime sleepiness/i)
  })

  it('keeps broad comparison monetization neutral and FAQ content visible', () => {
    const text = source()

    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).not.toContain('AFFILIATE_TAGS')
    expect(text).not.toMatch(/amazon\.com/i)
    expect(text).toMatch(/broad comparison intentionally does not rank affiliate products/i)
    expect(text).toMatch(/one magnesium-bisglycinate or ashwagandha-extract trial does not establish a retail winner/i)
    expect(text).toContain('{FAQS.map((faq) => (')
    expect(text).toMatch(/Should I try magnesium glycinate first tonight\?/i)
    expect(text).toMatch(/faqPageJsonLd\(\{ pagePath: `\/guides\/sleep\/\$\{SLUG\}\/`, questions: FAQS \}\)/)
    expect(text).toContain('<EmailCapture')
    expect(text).toContain('<NewsletterCtaBlock')
  })
})

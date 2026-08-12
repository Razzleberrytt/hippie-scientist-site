import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/compare/sleep-herbs-vs-melatonin/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('sleep herbs vs melatonin evidence calibration', () => {
  it('anchors the comparison to current authoritative evidence', () => {
    const text = source()

    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toContain('www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches')
    expect(text).toContain('40056718')
    expect(text).toContain('27998379')
    expect(text).toContain('aasm.org/coding-quarterly-cognitive-behavioral-therapy-for-insomnia')
    expect(text).toContain('ods.od.nih.gov/factsheets/Magnesium-HealthProfessional')
    expect(text).toContain('www.nccih.nih.gov/health/melatonin-what-you-need-to-know')
    expect(text).toContain('www.nccih.nih.gov/health/valerian')
    expect(text).toMatch(/19 articles \/ 897 participants/i)
    expect(text).toMatch(/three studies \/ 151 participants/i)
  })

  it('does not restore evidence grades, fastest-choice sequencing, or universal dosing protocols', () => {
    const text = source()

    expect(text).not.toMatch(/Evidence Grade: A/i)
    expect(text).not.toMatch(/Evidence Grade: B/i)
    expect(text).not.toMatch(/Evidence Grade: C/i)
    expect(text).not.toMatch(/fastest useful choice/i)
    expect(text).not.toMatch(/Reach for.*melatonin/i)
    expect(text).not.toMatch(/higher-value starting point/i)
    expect(text).not.toMatch(/Save valerian/i)
    expect(text).not.toMatch(/melatonin.{0,80}0\.3[–-]1 mg.{0,80}30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/magnesium glycinate.{0,80}(?:200[–-]400|100[–-]300) mg.{0,80}before bed/i)
    expect(text).not.toMatch(/L-theanine.{0,80}100[–-]400 mg.{0,80}30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/valerian.{0,80}300[–-]600 mg.{0,80}before bed/i)
    expect(text).not.toMatch(/Start low:.*100[–-]200 mg/i)
    expect(text).not.toMatch(/Standard dose range:.*300[–-]600 mg/i)
  })

  it('keeps melatonin claims context-specific rather than crowning it for insomnia', () => {
    const text = source()

    expect(text).toMatch(/jet lag and some shift-work sleep problems/i)
    expect(text).toMatch(/sleep-onset latency and daytime sleepiness but not sleep quality or time awake during the night/i)
    expect(text).toMatch(/recommend against it because evidence is insufficient/i)
    expect(text).not.toMatch(/low doses \(0\.3[–-]1 mg\).*most effective/i)
    expect(text).not.toMatch(/10 mg is far above the physiological dose/i)
  })

  it('keeps magnesium and valerian evidence conservative', () => {
    const text = source()

    expect(text).toMatch(/very little magnesium research for insomnia/i)
    expect(text).toMatch(/three studies \/ 151 older adults/i)
    expect(text).toMatch(/low quality/i)
    expect(text).not.toMatch(/magnesium glycinate is the preferred form for sleep/i)
    expect(text).not.toMatch(/most adults are below optimal intake/i)
    expect(text).toMatch(/valerian’s value for insomnia has not been demonstrated/i)
    expect(text).not.toMatch(/worth trying if better-evidenced options have not helped/i)
  })

  it('uses the 2025 L-theanine meta-analysis without inventing a bedtime protocol', () => {
    const text = source()

    expect(text).toMatch(/2025 systematic review\/meta-analysis included 19 articles \/ 897 participants/i)
    expect(text).toMatch(/shortage of studies using pure L-theanine/i)
    expect(text).toMatch(/determine adequate dose and duration/i)
    expect(text).not.toMatch(/100[–-]400 mg, 30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/No evidence of tolerance or dependency/i)
    expect(text).not.toMatch(/Onset is 30[–-]60 minutes/i)
  })

  it('restores ingredient-specific medication and health-condition safety boundaries', () => {
    const text = source()

    expect(text).toMatch(/Melatonin:.*epilepsy or taking blood thinners need medical supervision/i)
    expect(text).toMatch(/pregnancy\/breastfeeding safety data are limited/i)
    expect(text).toMatch(/Magnesium:.*toxicity risk rises with impaired kidney function/i)
    expect(text).toMatch(/oral bisphosphonates and tetracycline\/quinolone antibiotics/i)
    expect(text).toMatch(/magnesium-containing antacids can reduce thyroid-hormone absorption/i)
    expect(text).toMatch(/Valerian:.*against combining valerian with alcohol or sedatives/i)
    expect(text).toMatch(/long-term safety is unknown/i)
  })

  it('rejects evidence-free sleep stacks and chronic-insomnia substitution', () => {
    const text = source()

    expect(text).toMatch(/Four ingredient literatures do not create a validated sleep stack/i)
    expect(text).toMatch(/does not recommend “melatonin \+ L-theanine,” “magnesium \+ L-theanine,” or a sequence/i)
    expect(text).not.toMatch(/Best Evidence Stack/i)
    expect(text).not.toMatch(/Circadian Reset Stack/i)
    expect(text).not.toMatch(/Foundational Sleep Protocol/i)
    expect(text).not.toMatch(/most evidence-supported natural sleep combination/i)
    expect(text).toMatch(/CBT-I.*first-line,? evidence-based treatment for chronic insomnia/i)
    expect(text).toMatch(/loud snoring or gasping, dangerous daytime sleepiness, persistent insomnia/i)
  })

  it('renders FAQ content visibly alongside FAQ structured data', () => {
    const text = source()

    expect(text).toContain('<FAQSchema')
    expect(text).toMatch(/Frequently asked questions/i)
    expect(text).toContain('{FAQS.map((faq) => (')
    expect(text).toMatch(/Is melatonin better than magnesium for sleep\?/i)
    expect(text).toMatch(/What should persistent insomnia be treated with first\?/i)
  })

  it('keeps broad comparison monetization neutral while preserving discovery and conversion', () => {
    const text = source()

    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).not.toContain('ConversionStickyCTA')
    expect(text).toMatch(/intentionally does not rank affiliate products/i)
    expect(text).toContain('<EnhancedEmailCapture')
    expect(text).toContain('/guides/sleep/ashwagandha-for-sleep/')
    expect(text).toContain('/guides/sleep/sleep-stack-guide/')
  })
})

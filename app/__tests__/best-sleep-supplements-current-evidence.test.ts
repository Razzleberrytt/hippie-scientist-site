import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/sleep/best-supplements-for-sleep/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('best sleep supplements evidence calibration', () => {
  it('anchors the broad guide to current direct evidence', () => {
    const text = source()

    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toMatch(/datePublished="2026-06-16"/)
    expect(text).toContain('34559859')
    expect(text).toContain('40056718')
    expect(text).toContain('33865376')
    expect(text).toContain('40918053')
    expect(text).toContain('38359657')
    expect(text).toContain('31714321')
    expect(text).toMatch(/five placebo-controlled RCTs \/ 400 adults/i)
    expect(text).toMatch(/19 articles \/ 897 participants/i)
    expect(text).toMatch(/3 RCTs \/ 151 older adults/i)
    expect(text).toMatch(/155 adults ages 18[–-]65.*d=0\.2/i)
    expect(text).toMatch(/110-person DSM-5 insomnia RCT/i)
  })

  it('surfaces ashwagandha population, extract, comparator, and duration directness', () => {
    const text = source()

    expect(text).toMatch(/healthy adults over 60/i)
    expect(text).toMatch(/DSM-IV insomnia/i)
    expect(text).toMatch(/KSM-66 root extract/i)
    expect(text).toMatch(/Shoden root-and-leaf extract/i)
    expect(text).toMatch(/6[–-]12 weeks/i)
    expect(text).toMatch(/placebo-controlled/i)
    expect(text).toMatch(/one trial was partially manufacturer-sponsored/i)
  })

  it('keeps the 2025 magnesium trial limitations and commercial context visible', () => {
    const text = source()

    expect(text).toMatch(/250 mg elemental magnesium.*placebo.*four weeks/i)
    expect(text).toMatch(/Cohen d=0\.2/i)
    expect(text).toMatch(/separate sleep-quality measure was not significantly different/i)
    expect(text).toMatch(/objective sleep was not measured/i)
    expect(text).toMatch(/contract research organization that receives nutraceutical-company research funding/i)
    expect(text).toMatch(/nutraceutical presentation honoraria/i)
    expect(text).toMatch(/manufactured by Biogena/i)
  })

  it('does not restore symptom-to-supplement winner cards or typical-dose selectors', () => {
    const text = source()

    expect(text).not.toContain('SLEEP_SUPPLEMENTS')
    expect(text).not.toMatch(/What should you choose first\?/i)
    expect(text).not.toMatch(/Best fit/i)
    expect(text).not.toMatch(/Best for timing/i)
    expect(text).not.toMatch(/Best for arousal/i)
    expect(text).not.toMatch(/Best for stress/i)
    expect(text).not.toMatch(/Typical dose context/i)
    expect(text).not.toMatch(/Melatonin.{0,120}0\.5[–-]1 mg/i)
    expect(text).not.toMatch(/Magnesium Glycinate.{0,160}100[–-]300 mg.*evening/i)
    expect(text).not.toMatch(/L-Theanine.{0,160}100[–-]200 mg.*30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/Ashwagandha.{0,160}300[–-]600 mg daily/i)
    expect(text).not.toMatch(/Valerian Root.{0,160}300[–-]600 mg before bed/i)
    expect(text).toMatch(/There is no universal first supplement for poor sleep/i)
    expect(text).toMatch(/Symptoms do not identify a supplement/i)
  })

  it('keeps evidence limitations visible for each ingredient', () => {
    const text = source()

    expect(text).toMatch(/Melatonin.*Context-specific, not “best overall.”/i)
    expect(text).toMatch(/Ashwagandha.*Limited sleep signal/i)
    expect(text).toMatch(/L-theanine.*Promising but indirect\/heterogeneous/i)
    expect(text).toMatch(/Magnesium.*Limited, with one newer small signal/i)
    expect(text).toMatch(/Valerian.*Do not present as established insomnia therapy/i)
    expect(text).toMatch(/Passionflower.*Preliminary/i)
    expect(text).toMatch(/No evidence of efficacy for treating insomnia/i)
    expect(text).toMatch(/Several other sleep outcomes did not differ between groups/i)
  })

  it('preserves ingredient-specific safety and chronic-insomnia boundaries', () => {
    const text = source()

    expect(text).toMatch(/Melatonin:.*epilepsy or taking blood thinners/i)
    expect(text).toMatch(/Ashwagandha:.*rare liver injury/i)
    expect(text).toMatch(/Magnesium:.*toxicity risk rises with impaired kidney function/i)
    expect(text).toMatch(/Valerian \/ passionflower:.*sedation-related effects/i)
    expect(text).toMatch(/passionflower is not recommended during pregnancy/i)
    expect(text).toMatch(/L-theanine:.*should not be translated into “interaction-free.”/i)
    expect(text).toMatch(/CBT-I.*first-line, evidence-based treatment for chronic insomnia/i)
    expect(text).toMatch(/Loud snoring or gasping, dangerous daytime sleepiness/i)
  })

  it('rejects evidence-free stacks and one-sided broad-page monetization', () => {
    const text = source()

    expect(text).toMatch(/Separate trials of melatonin, magnesium, L-theanine, ashwagandha, valerian, or passionflower do not prove that combining them creates synergy/i)
    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).not.toContain('magnesiumProducts')
    expect(text).not.toMatch(/amazon\.com/i)
    expect(text).toMatch(/broad guide intentionally does not rank affiliate products/i)
    expect(text).toContain('<EmailCapture')
    expect(text).toContain('<NewsletterCtaBlock')
  })
})

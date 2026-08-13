import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(
  process.cwd(),
  'app/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/page.tsx',
)

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('magnesium sleep form evidence calibration', () => {
  it('anchors both formulation families to direct randomized evidence', () => {
    const text = source()

    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toContain('40918053')
    expect(text).toContain('39252819')
    expect(text).toContain('40567408')
    expect(text).toContain('41601871')
    expect(text).toContain('33865376')
    expect(text).toMatch(/155 adults/i)
    expect(text).toMatch(/250 mg elemental magnesium/i)
    expect(text).toMatch(/four weeks/i)
    expect(text).toMatch(/Cohen d=0\.2/i)
    expect(text).toMatch(/80 adults.*21 days/i)
    expect(text).toMatch(/100 adults.*six weeks/i)
  })

  it('keeps both evidence ratings conservative and the lack of a head-to-head trial explicit', () => {
    const text = source()

    expect(text).toMatch(/title="Magnesium bisglycinate \/ glycinate" evidenceLevel="Limited"/i)
    expect(text).toMatch(/title="Magnesium L-threonate" evidenceLevel="Limited"/i)
    expect(text).toMatch(/no head-to-head/i)
    expect(text).toMatch(/zero direct form-vs-form trials/i)
    expect(text).toMatch(/no randomized sleep trial assigning people to magnesium glycinate or bisglycinate versus magnesium L-threonate/i)
  })

  it('does not restore a glycinate winner or universal evening dose', () => {
    const text = source()

    expect(text).not.toMatch(/glycinate wins for most readers/i)
    expect(text).not.toMatch(/cleaner first sleep pick/i)
    expect(text).not.toMatch(/default first experiment/i)
    expect(text).not.toMatch(/cleaner first buy/i)
    expect(text).not.toMatch(/100[–-]300 mg elemental magnesium in the evening/i)
    expect(text).not.toMatch(/start low if you are sensitive/i)
    expect(text).not.toMatch(/premium supplement that solves the wrong problem/i)
    expect(text).toMatch(/trial regimens describe what researchers tested/i)
    expect(text).toMatch(/do not create a universal evening dose/i)
  })

  it('keeps trial doses as study context rather than recommendations', () => {
    const text = source()

    expect(text).toMatch(/250 mg elemental magnesium daily for four weeks/i)
    expect(text).toMatch(/1 g\/day branded Magtein/i)
    expect(text).toMatch(/2 g\/day Magtein/i)
    expect(text).toMatch(/does not prescribe a universal dose/i)
    expect(text).toMatch(/regimens describe what researchers tested/i)
    expect(text).not.toMatch(/recommended dose/i)
    expect(text).not.toMatch(/take 250 mg/i)
  })

  it('surfaces the 2024 Magtein corrigendum and sponsor conflicts', () => {
    const text = source()

    expect(text).toContain('40567408')
    expect(text).toMatch(/retrospectively registered/i)
    expect(text).toMatch(/AIDP commissioned and funded/i)
    expect(text).toMatch(/owns relevant patents|owns patents related to the product/i)
    expect(text).toMatch(/three authors had paid, consulting, or company roles/i)
    expect(text).toMatch(/corrigendum/i)
  })

  it('keeps the 2026 L-threonate sleep signal narrower than the cognitive result', () => {
    const text = source()

    expect(text).toMatch(/funding from Threotech/i)
    expect(text).toMatch(/some cognitive and subjective sleep-related outcomes/i)
    expect(text).toMatch(/objective wearable sleep outcomes did not show a general between-group advantage/i)
    expect(text).toMatch(/does not establish overall sleep superiority/i)
    expect(text).toMatch(/blood-brain-barrier delivery are mechanistic rationale, not proof/i)
  })

  it('preserves magnesium safety and chronic-insomnia boundaries', () => {
    const text = source()

    expect(text).toContain('ods.od.nih.gov/factsheets/Magnesium-HealthProfessional')
    expect(text).toMatch(/toxicity risk rises.*renal clearance is impaired/i)
    expect(text).toMatch(/oral bisphosphonate/i)
    expect(text).toMatch(/tetracycline and quinolone antibiotics/i)
    expect(text).toMatch(/CBT-I.*first-line evidence-based treatment for chronic insomnia/i)
    expect(text).toMatch(/loud snoring or gasping, dangerous daytime sleepiness/i)
  })

  it('keeps broad monetization neutral and FAQ content visible', () => {
    const text = source()

    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).not.toMatch(/wikipedia\.org/i)
    expect(text).toMatch(/intentionally does not rank affiliate products/i)
    expect(text).toContain('faqPageJsonLd')
    expect(text).toContain('{FAQS.map((faq) => (')
    expect(text).toMatch(/Frequently asked questions/i)
    expect(text).toContain('<EmailCapture')
    expect(text).toContain('<NewsletterCtaBlock')
  })
})

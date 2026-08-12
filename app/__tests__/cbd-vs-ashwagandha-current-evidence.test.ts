import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('CBD vs ashwagandha evidence calibration', () => {
  it('anchors both sides to direct, auditable evidence while preserving article dates', () => {
    const text = source()

    expect(text).toContain('38924898')
    expect(text).toContain('39598172')
    expect(text).toContain('39348746')
    expect(text).toMatch(/eight studies \/ 316 participants/i)
    expect(text).toMatch(/nine randomized trials \/ 558 participants/i)
    expect(text).toContain("const DATE = '2026-06-10'")
    expect(text).toContain("const UPDATED_DATE = '2026-08-12'")
    expect(text).toMatch(/date: DATE, updated: UPDATED_DATE/)
    expect(text).toContain('<LastUpdatedBadge date={UPDATED_DATE} />')
  })

  it('keeps anxiety-specific evidence badges conservative', () => {
    const text = source()

    expect(text).toMatch(/title="CBD for anxiety" evidenceLevel="Limited"/i)
    expect(text).toMatch(/title="Ashwagandha for stress and anxiety" evidenceLevel="Limited"/i)
    expect(text).toMatch(/NCCIH considers anxiety evidence unclear/i)
  })

  it('separates consumer CBD from FDA-approved prescription CBD', () => {
    const text = source()

    expect(text).toMatch(/one prescription CBD drug.*certain seizure disorders/i)
    expect(text).toMatch(/FDA has not approved consumer CBD products for anxiety/i)
    expect(text).toMatch(/cannot currently be lawfully marketed as a dietary supplement under federal law/i)
    expect(text).not.toMatch(/CBD is legal in many jurisdictions/i)
    expect(text).not.toMatch(/hemp-derived CBD.*is legal/i)
  })

  it('does not convert pharmacokinetics or trial regimens into consumer promises', () => {
    const text = source()

    expect(text).toMatch(/absorption speed is not efficacy/i)
    expect(text).not.toMatch(/Minutes to hours \(form-dependent\)/i)
    expect(text).not.toMatch(/within minutes to an hour/i)
    expect(text).not.toMatch(/1[–-]2 hours/i)
    expect(text).not.toMatch(/150[–-]600 mg\/day/i)
    expect(text).not.toMatch(/common trial doses/i)
    expect(text).not.toMatch(/(?:start|increase|decrease|titrate).{0,40}(?:\d+\s*mg|dose)/i)
    expect(text).toMatch(/does not provide a universal CBD milligram range or tell readers to titrate consumer CBD on their own/i)
  })

  it('preserves FDA and NCCIH safety boundaries', () => {
    const text = source()

    expect(text).toContain('www.fda.gov/consumers/consumer-updates/what-you-need-know-and-what-were-working-find-out-about-products-containing-cannabis-or-cannabis')
    expect(text).toContain('www.nccih.nih.gov/health/cannabis-marijuana-and-cannabinoids-what-you-need-to-know')
    expect(text).toContain('www.nccih.nih.gov/health/ashwagandha')
    expect(text).toMatch(/CBD:.*potential liver injury/i)
    expect(text).toMatch(/CBD \+ sedatives\/alcohol:.*increase sedation and drowsiness/i)
    expect(text).toMatch(/Driving\/alertness:.*sleepiness or changes in alertness/i)
    expect(text).toMatch(/Ashwagandha:.*thyroid and autoimmune conditions/i)
    expect(text).toMatch(/rare liver injury/i)
  })

  it('rejects an evidence-free CBD plus ashwagandha stack', () => {
    const text = source()

    expect(text).toMatch(/combination has not been established as more effective or safer/i)
    expect(text).toMatch(/does not recommend a CBD \+ ashwagandha stack/i)
    expect(text).toMatch(/separate ingredient studies do not validate the combination/i)
  })

  it('keeps broad comparison monetization neutral', () => {
    const text = source()

    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).not.toContain('AFFILIATE_TAGS')
    expect(text).not.toMatch(/amazon\.com/i)
    expect(text).not.toMatch(/KSM-66 Ashwagandha/i)
    expect(text).not.toMatch(/Sensoril Ashwagandha/i)
    expect(text).not.toMatch(/Search Broad Spectrum CBD/i)
    expect(text).toMatch(/intentionally does not rank or affiliate-link CBD or ashwagandha products/i)
    expect(text).toContain('<NewsletterCtaBlock />')
    expect(text).toContain('<EmailCapture />')
  })
})

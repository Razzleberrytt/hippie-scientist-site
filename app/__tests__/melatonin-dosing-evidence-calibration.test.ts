import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/other/melatonin-dosage-guide/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('melatonin dosing evidence calibration', () => {
  it('does not restore a universal low-dose protocol or overdose framing', () => {
    const source = read(PAGE)

    expect(source).not.toContain('Take 0.3-1 mg of melatonin')
    expect(source).not.toContain('Most melatonin is overdosed')
    expect(source).not.toContain('0.3-1 mg is as effective as higher doses')
    expect(source).not.toContain('receptor desensitization')
    expect(source).toContain('There is no single evidence-based melatonin dose for every sleep problem')
    // The page must keep framing the meta-analytic dose as study context rather
    // than a protocol a reader should follow. The sentence carrying that has been
    // rewritten, so match the claim rather than the wording.
    expect(source).toMatch(/not[^.]{0,90}universal[^.]{0,40}protocol/i)
  })

  it('keeps chronic insomnia, children, and product variability boundaries visible', () => {
    const source = read(PAGE)

    // CBT-I must stay visible as the strongly recommended option for chronic
    // insomnia, and the pediatric decision must stay routed to a professional.
    expect(source).toMatch(/strongly recommends?[^.]{0,80}CBT-I|CBT-I[^.]{0,60}strong[^.]{0,40}recommendation/i)
    expect(source).toMatch(/chronic insomnia/i)
    expect(source).toMatch(/parents[^.]{0,60}pediatric health professional/i)
    expect(source).toContain('74% to 347% of the labeled amount')
  })

  it('anchors current evidence and avoids product-selling inside the dose guide', () => {
    const source = read(PAGE)

    expect(source).toContain('38888087')
    expect(source).toContain('nccih.nih.gov/health/melatonin-what-you-need-to-know')
    expect(source).toContain('aasm.org/advocacy/position-statements/melatonin-use-in-children-and-adolescents-health-advisory')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('getRevenueProductSet')
    expect(source).toContain('<References refs={MELATONIN_REFS} />')
  })
})

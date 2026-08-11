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
    expect(source).toContain('study context, not a universal protocol')
  })

  it('keeps chronic insomnia, children, and product variability boundaries visible', () => {
    const source = read(PAGE)

    expect(source).toContain('CBT-I is the strongest recommended treatment for chronic insomnia')
    expect(source).toContain('parents should discuss melatonin with a pediatric health professional')
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

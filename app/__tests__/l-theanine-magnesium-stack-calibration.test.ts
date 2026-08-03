import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/adhd/l-theanine-magnesium-adhd-stack/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('L-theanine magnesium ADHD stack calibration', () => {
  it('preserves the stable route and states the direct evidence boundary', () => {
    const source = read(PAGE)

    expect(source).toContain("const SLUG = 'l-theanine-magnesium-adhd-stack'")
    expect(source).toContain('No direct ADHD trial shows that this two-ingredient stack is synergistic')
    expect(source).toContain('The combination is untested for ADHD outcomes')
    expect(source).toContain('There is no validated combination dose')
  })

  it('does not restore the old protocol, synergy, or generic affiliate claims', () => {
    const source = read(PAGE)

    expect(source).not.toContain('AFFILIATE_TAGS')
    expect(source).not.toContain('amazon.com/s?k=')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('Magnesium Glycinate — The Best First Step')
    expect(source).not.toContain('200–300 mg elemental')
    expect(source).not.toContain('appropriate for use alongside ADHD medication')
    expect(source).not.toContain('which is why combining them is additive rather than redundant')
  })

  it('anchors the page in ADHD-specific, current, and authoritative sources', () => {
    const source = read(PAGE)

    expect(source).toContain('22214254')
    expect(source).toContain('23808779')
    expect(source).toContain('30496768')
    expect(source).toContain('42410082')
    expect(source).toContain('40314930')
    expect(source).toContain('35565828')
    expect(source).toContain('https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/')
  })

  it('routes commercial and medication decisions to narrower guides', () => {
    const source = read(PAGE)

    expect(source).toContain('/guides/adhd/l-theanine-for-adhd/')
    expect(source).toContain('/guides/adhd/best-magnesium-supplement-for-adhd/')
    expect(source).toContain('/guides/adhd/adhd-medication-supplement-interactions/')
    expect(source).toContain('/safety-checker/')
    expect(source).toContain('<AdhdInlineCta type="stack" />')
    expect(source).toContain('<AdhdInlineCta type="safety" />')
  })
})

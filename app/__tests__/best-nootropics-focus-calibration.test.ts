import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/focus/best-nootropics-for-focus/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('best nootropics for focus evidence calibration', () => {
  it('separates acute attention, long-term memory, fatigue, and population-specific evidence', () => {
    const source = read(PAGE)

    expect(source).toContain('Short-term alertness during a demanding task')
    expect(source).toContain('Memory over months rather than same-day focus')
    expect(source).toContain('Age-associated memory complaint')
    expect(source).toContain('Concentration that collapses with stress or fatigue')
    expect(source).toContain('A positive memory result in older adults is not proof of acute attention')
  })

  it('does not restore protocol-like dosing or single-ingredient commercial bias', () => {
    const source = read(PAGE)

    expect(source).not.toContain('getRevenueProductSet')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('AffiliateDisclosure')
    expect(source).not.toContain('A conservative starting point is')
    expect(source).not.toContain('Common supplemental doses are')
    expect(source).toContain('A dose in a trial is not a universal recommendation')
  })

  it('includes positive, null, negative, and conflict-aware evidence', () => {
    const source = read(PAGE)

    expect(source).toContain('confidence intervals often showed uncertainty')
    expect(source).toContain('fatigue changes that favored placebo')
    expect(source).toContain('null and limited negative findings')
    expect(source).toContain('manufacturer-affiliated trial')
    expect(source).toContain('Product-specific funding and investigator conflicts')
  })

  it('anchors every ranked ingredient in relevant human evidence', () => {
    const source = read(PAGE)

    for (const pmid of [
      '40314930',
      '42410082',
      '22747190',
      '41678913',
      '33978188',
      '22643043',
      '25268730',
      '38004235',
      '40276537',
      '18616866',
      '40213691',
    ]) {
      expect(source).toContain(pmid)
    }
  })

  it('preserves FAQ schema, email capture, internal pathways, and safety review', () => {
    const source = read(PAGE)

    expect(source).toContain('faqs={FAQS}')
    expect(source).toContain('location="guides-best-nootropics-for-focus"')
    expect(source).toContain('/guides/focus/')
    expect(source).toContain('/guides/adhd/adhd-supplements/')
    expect(source).toContain('/safety-checker/')
    expect(source).toContain('Define the stop rule')
  })
})

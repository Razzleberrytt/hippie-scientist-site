import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/anxiety/best-supplements-for-overthinking/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('best supplements for overthinking evidence calibration', () => {
  it('does not claim a proven supplement winner for overthinking', () => {
    const source = read(PAGE)

    expect(source).toContain('No supplement has strong direct evidence for treating “overthinking” itself')
    expect(source).not.toContain('L-theanine is the best first choice for most people')
    expect(source).not.toContain('fastest useful choice for overthinking')
    expect(source).not.toContain('most reliable, fastest and safest way')
    expect(source).not.toContain('very safe for daily use')
  })

  it('keeps adjacent outcomes and evidence limits explicit', () => {
    const source = read(PAGE)

    expect(source).toContain('Acute cognition and mood — not rumination')
    expect(source).toContain('Subjective anxiety in vulnerable groups')
    expect(source).toContain('Chronic stress — not a same-night rescue')
    expect(source).toContain('does not establish a treatment for rumination')
    expect(source).toContain('quality of the existing evidence was poor')
  })

  it('does not monetize one ingredient inside a broad comparison', () => {
    const source = read(PAGE)

    expect(source).not.toContain('getRevenueProductSet')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('AffiliateDisclosure')
  })

  it('preserves primary-source references, FAQ schema, safety, and owned-audience capture', () => {
    const source = read(PAGE)

    for (const pmid of ['18006208', '23439798', '28445426']) {
      expect(source).toContain(pmid)
    }
    expect(source).toContain('faqs={FAQS}')
    expect(source).toContain('location="guides-best-supplements-for-overthinking"')
    expect(source).toContain('When a supplement is the wrong next step')
    expect(source).toContain('/safety-checker/')
  })
})

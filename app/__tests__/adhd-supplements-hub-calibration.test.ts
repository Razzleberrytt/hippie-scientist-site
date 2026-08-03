import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = 'app/guides/adhd/adhd-supplements/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('ADHD supplements hub evidence calibration', () => {
  it('keeps the canonical hub centered on targets and evidence boundaries', () => {
    const source = read(PAGE)

    expect(source).toContain('Start with the problem, not the product')
    expect(source).toContain('A lower nutrient level in an ADHD group does not prove causation')
    expect(source).toMatch(/A sleep benefit does not prove\s+an attention benefit/)
    expect(source).toMatch(/A study in healthy adults does not establish\s+an ADHD treatment/)
  })

  it('does not restore the old strong-tier or product-first framing', () => {
    const source = read(PAGE)

    expect(source).not.toContain('Tier A: Strong')
    expect(source).not.toContain('Tier B: Moderate')
    expect(source).not.toContain('getRevenueProductSet')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('amazon.com/s?k=')
  })

  it('anchors the major decisions in current or authoritative sources', () => {
    const source = read(PAGE)

    expect(source).toContain('https://www.nice.org.uk/guidance/ng87/chapter/recommendations')
    expect(source).toContain('37656283')
    expect(source).toContain('17242627')
    expect(source).toContain('34836314')
    expect(source).toContain('23808779')
    expect(source).toContain('37864351')
    expect(source).toContain('42410082')
    expect(source).toContain('42280439')
  })

  it('preserves the lead magnet and safety pathways', () => {
    const source = read(PAGE)

    expect(source).toContain('<AdhdInlineCta type="checklist" />')
    expect(source).toContain('<AdhdInlineCta type="safety" />')
    expect(source).toContain('<AdhdInlineCta type="stack" />')
    expect(source).toContain('/safety-checker/')
  })
})

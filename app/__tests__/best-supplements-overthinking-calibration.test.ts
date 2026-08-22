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

    expect(source).toMatch(/no proven supplement|no supplement has strong direct evidence/i)
    expect(source).not.toContain('L-theanine is the best first choice for most people')
    expect(source).not.toContain('fastest useful choice for overthinking')
    expect(source).not.toContain('most reliable, fastest and safest way')
    expect(source).not.toContain('very safe for daily use')
  })

  it('keeps adjacent outcomes and direct-evidence limits explicit', () => {
    const source = read(PAGE)

    expect(source).toMatch(/adjacent outcomes/i)
    expect(source).toMatch(/stress.*anxiety.*sleep quality|stress, anxiety, sleep quality/i)
    expect(source).toMatch(/CBT-I/i)
    expect(source).toMatch(/rumination|repetitive negative thinking/i)
    expect(source).toMatch(/not direct proof|does not establish|not proven/i)
  })

  it('does not monetize one ingredient inside a broad comparison', () => {
    const source = read(PAGE)

    expect(source).not.toContain('getRevenueProductSet')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toContain('AffiliateDisclosure')
  })

  it('preserves current primary sources, FAQ schema, safety context, and owned-audience capture', () => {
    const source = read(PAGE)

    for (const pmid of ['42410082', '30580081', '38817505', '39348746', '32992228', '33164742']) {
      expect(source).toContain(pmid)
    }
    expect(source).toContain('faqs={FAQS}')
    expect(source).toContain('dateModified="2026-08-22"')
    expect(source).toContain('location="guides-best-supplements-for-overthinking"')
    expect(source).toContain('/safety-checker/')
  })
})

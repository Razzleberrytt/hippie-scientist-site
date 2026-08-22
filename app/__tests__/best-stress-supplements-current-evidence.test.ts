import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SOURCE = path.join(process.cwd(), 'app/guides/anxiety/best-supplements-for-stress/page.tsx')
const CANONICAL = path.join(process.cwd(), 'app/guides/best/supplements-for-stress/page.tsx')

function read(file: string) {
  return fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ')
}

describe('best stress supplements evidence calibration', () => {
  it('anchors the live content to current direct evidence', () => {
    const text = read(SOURCE)
    for (const pmid of ['39348746', '41906501', '19016404', '38817505', '42410082']) {
      expect(text).toContain(pmid)
    }
    expect(text).toMatch(/ashwagandha/i)
    expect(text).toMatch(/rhodiola/i)
    expect(text).toMatch(/magnesium/i)
    expect(text).toMatch(/L-theanine/i)
    expect(text).toMatch(/dateModified="2026-08-\d{2}"|DATE.*2026-08-/i)
  })

  it('does not restore treatment-like stress rankings or stack recipes', () => {
    const text = read(SOURCE)
    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/Best choice/i)
    expect(text).not.toMatch(/Recommended stacks/i)
    expect(text).not.toMatch(/most comprehensive chronic stress stack/i)
    expect(text).not.toMatch(/HPA dysregulation/i)
    expect(text).not.toMatch(/2:1 theanine:caffeine ratio/i)
    expect(text).not.toMatch(/Ashwagandha 600 mg \+ Magnesium Glycinate 300 mg/i)
  })

  it('keeps individual ingredient evidence separate from combination claims', () => {
    const text = read(SOURCE)
    expect(text).toMatch(/combination|stack|synergy/i)
    expect(text).toMatch(/does not prove|do not prove|no evidence-based universal/i)
  })

  it('keeps directness limits visible', () => {
    const text = read(SOURCE)
    expect(text).toMatch(/stress-related fatigue|acute stress|same-day|directness/i)
    expect(text).toMatch(/limited|modest|uncertain|does not establish/i)
  })

  it('preserves explicit safety and care-escalation boundaries', () => {
    const text = read(SOURCE)
    expect(text).toMatch(/medication|pregnan|kidney|liver|thyroid/i)
    expect(text).toMatch(/persistent severe anxiety.*worsening mental-health symptoms.*cause-focused evaluation/i)
  })

  it('keeps monetization symmetric across compared ingredients', () => {
    const text = read(SOURCE)
    expect(text).toContain("['ashwagandha', 'rhodiola', 'magnesium', 'l-theanine']")
    expect(text).toContain('getRevenueProductSet(slug)')
    expect(text).toContain('<RecommendationSection products={comparisonProducts} />')
  })

  it('preserves canonical ownership and evidence-first metadata', () => {
    const source = read(SOURCE)
    const canonical = read(CANONICAL)
    expect(source).toContain("alternates: { canonical: '/guides/best/supplements-for-stress/' }")
    expect(source).toContain('robots: { index: false, follow: true }')
    expect(canonical).toContain("const CANONICAL_PATH = '/guides/best/supplements-for-stress/'")
    expect(canonical).toContain('robots: { index: true, follow: true }')
    expect(canonical).toContain("BestSupplementsForStressPage from '../../anxiety/best-supplements-for-stress/page'")
    expect(canonical).toMatch(/Best Supplements for Stress: Evidence/i)
    expect(canonical).not.toContain('phosphatidylserine')
    expect(canonical).not.toContain('Includes dosing')
  })
})

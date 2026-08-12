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

    expect(text).toContain('39348746')
    expect(text).toContain('41906501')
    expect(text).toContain('19016404')
    expect(text).toContain('38817505')
    expect(text).toContain('42410082')
    expect(text).toContain('Nine randomized controlled trials / 558 participants')
    expect(text).toContain('60 adults ages 20–55 with stress-related fatigue over 28 days')
    expect(text).toContain('15 eligible intervention studies, seven with anxiety-related outcomes')
    expect(text).toContain('31 randomized placebo-controlled trials and 1,168 participants')
    expect(text).toContain("const DATE = '2026-08-11'")
  })

  it('does not restore treatment-like stress rankings or stack recipes', () => {
    const text = read(SOURCE)

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/Best choice/i)
    expect(text).not.toMatch(/Recommended stacks/i)
    expect(text).not.toMatch(/most comprehensive chronic stress stack/i)
    expect(text).not.toMatch(/HPA dysregulation/i)
    expect(text).not.toMatch(/fast-acting, no sedation/i)
    expect(text).not.toMatch(/2:1 theanine:caffeine ratio/i)
    expect(text).not.toMatch(/Ashwagandha 600 mg \+ Magnesium Glycinate 300 mg/i)
    expect(text).not.toMatch(/Rhodiola 200 mg \(AM\) \+ L-Theanine 200 mg/i)
    expect(text).not.toMatch(/Citicoline 250 mg/i)
  })

  it('keeps individual ingredient evidence separate from combination claims', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/There is no evidence-based universal stress stack/i)
    expect(text).toMatch(/Individual evidence does not validate a “stress stack”/i)
    expect(text).toMatch(/separate trial of magnesium do not prove that combining them works better/i)
    expect(text).toMatch(/changing one variable at a time makes benefits and adverse effects easier to interpret/i)
  })

  it('states the important directness limits for each option', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/not a same-day rescue claim/i)
    expect(text).toMatch(/Stress-related fatigue evidence does not establish a universal “acute resilience” effect/i)
    expect(text).toMatch(/No strong basis for claiming magnesium glycinate is the proven stress form/i)
    expect(text).toMatch(/modest acute-stress signal was bias-sensitive/i)
  })

  it('preserves explicit safety and crisis stop rules', () => {
    const text = read(SOURCE)

    expect(text).toMatch(/Review medications, pregnancy, kidney\/liver disease, thyroid conditions/i)
    expect(text).toMatch(/suicidal thoughts/i)
    expect(text).toMatch(/thoughts of self-harm/i)
    expect(text).toMatch(/inability to stay safe/i)
    expect(text).toMatch(/immediate crisis care/i)
    expect(text).toMatch(/Study doses and durations describe the research/i)
  })

  it('keeps monetization symmetric across the compared ingredients', () => {
    const text = read(SOURCE)

    expect(text).toContain("['ashwagandha', 'rhodiola', 'magnesium', 'l-theanine']")
    expect(text).toContain('getRevenueProductSet(slug)')
    expect(text).toContain('<RecommendationSection products={comparisonProducts} />')
    expect(text).toMatch(/covers all four ingredients compared above/i)
    expect(text).toMatch(/affiliate links do not imply treatment efficacy/i)
  })

  it('preserves the indexed canonical wrapper and aligns its metadata with the evidence-first page', () => {
    const source = read(SOURCE)
    const canonical = read(CANONICAL)

    expect(source).toContain("alternates: { canonical: '/guides/best/supplements-for-stress/' }")
    expect(source).toContain('robots: { index: false, follow: true }')
    expect(canonical).toContain("const CANONICAL_PATH = '/guides/best/supplements-for-stress/'")
    expect(canonical).toContain('robots: { index: true, follow: true }')
    expect(canonical).toContain("BestSupplementsForStressPage from '../../anxiety/best-supplements-for-stress/page'")
    expect(canonical).toContain('Best Supplements for Stress: What the Evidence Supports in 2026')
    expect(canonical).toContain('Evidence-first comparison of ashwagandha, rhodiola, magnesium, and L-theanine')
    expect(canonical).not.toContain('phosphatidylserine')
    expect(canonical).not.toContain('Includes dosing')
    expect(canonical).not.toContain('poor sleep')
    expect(canonical).not.toContain('acute tension')
  })
})

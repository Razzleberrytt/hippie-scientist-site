import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'app/guides/sleep/sleep-stack-guide/page.tsx'),
  'utf8',
)

describe('sleep stack guide evidence discipline', () => {
  it('does not present a preferred multi-supplement stack or pseudo-personalized protocol', () => {
    expect(source).not.toContain('The Core 3-Ingredient Sleep Stack')
    expect(source).not.toContain('Best starting point for most people')
    expect(source).not.toContain('No known pharmacokinetic antagonism')
    expect(source).not.toContain('No major interactions established')
    expect(source).not.toContain('genuinely non-overlapping and complementary')
    expect(source).toContain('No magnesium + L-theanine + ashwagandha sleep trial was identified for this review')
  })

  it('does not publish a fixed dose, timing, or multi-week onset protocol', () => {
    expect(source).not.toContain('30–60 min before bed')
    expect(source).not.toContain('200–400 mg elemental magnesium')
    expect(source).not.toContain('requires 6–8 week trial')
    expect(source).not.toContain('Commit to 6–8 weeks')
    expect(source).not.toContain('Trial for 1–2 weeks')
    expect(source).toContain('study and product specific')
  })

  it('uses one curated commercial handoff instead of generic Amazon searches', () => {
    expect(source).not.toContain('AFFILIATE_TAGS')
    expect(source).not.toContain('amazon.com/s?k=')
    expect(source).toContain('<RecommendationSection')
  })

  it('keeps mechanisms separate from demonstrated combination outcomes', () => {
    expect(source).toContain('Mechanistic plausibility is not combination evidence')
    expect(source).toContain('one ingredient at a time')
  })

  it('preserves publication history and records the evidence review date', () => {
    expect(source).toContain("const DATE = '2026-08-02'")
    expect(source).toContain("const UPDATED_DATE = '2026-08-11'")
    expect(source).toContain('updated: UPDATED_DATE')
  })
})

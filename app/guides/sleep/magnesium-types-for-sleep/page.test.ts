import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'app/guides/sleep/magnesium-types-for-sleep/page.tsx'),
  'utf8',
)

describe('magnesium types for sleep evidence discipline', () => {
  it('does not rank magnesium forms as proven sleep winners', () => {
    expect(source).not.toContain('Best practical first trial')
    expect(source).not.toContain('Best overall pick')
    expect(source).not.toContain('★★★★★')
    expect(source).not.toContain('Worst default sleep pick')
    expect(source).toContain('No magnesium form has been shown in reliable head-to-head sleep trials to be best')
  })

  it('does not publish unsupported combination or fixed sleep protocol claims', () => {
    expect(source).not.toContain('are not known to interact adversely')
    expect(source).not.toContain('Most sleep-focused protocols use 200–400 mg')
    expect(source).not.toContain('30–60 min before bed')
    expect(source).not.toContain('usually resolves GI issues')
    expect(source).toContain('350 mg/day')
  })

  it('uses one curated commercial handoff instead of generic Amazon searches', () => {
    expect(source).not.toContain('AFFILIATE_TAGS')
    expect(source).not.toContain('amazon.com/s?k=')
    expect(source).toContain('<RecommendationSection')
  })

  it('preserves publication history while exposing a real review date', () => {
    expect(source).toContain("const DATE = '2026-06-09'")
    expect(source).toContain("const UPDATED_DATE = '2026-08-11'")
    expect(source).toContain('updated: UPDATED_DATE')
  })
})

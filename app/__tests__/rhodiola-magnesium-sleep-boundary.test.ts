import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readGuide = () => fs
  .readFileSync(path.join(process.cwd(), 'app/guides/sleep/rhodiola-sleep-stack/page.tsx'), 'utf8')
  .replace(/\s+/g, ' ')

const readSource = () => fs
  .readFileSync(path.join(process.cwd(), 'content/guides/rhodiola-sleep-stack.mdx'), 'utf8')
  .replace(/\s+/g, ' ')

describe('rhodiola + magnesium sleep evidence boundary', () => {
  it('does not present the untested pair as a dosing or timing protocol', () => {
    const page = readGuide()

    expect(page).toMatch(/combination is unproven for sleep/i)
    expect(page).not.toMatch(/Dosing & Timing Protocol/i)
    expect(page).not.toMatch(/Run the protocol for a minimum of 3–4 weeks/i)
    expect(page).not.toMatch(/Rhodiola = morning only/i)
  })

  it('does not claim direct synergy or broad combination safety', () => {
    const page = readGuide()

    expect(page).toMatch(/Pairing two separately studied ingredients does not create combination evidence/i)
    expect(page).toMatch(/untested combination of two separately studied ingredients/i)
    expect(page).not.toMatch(/mechanisms are real, complementary, and generally safe/i)
    expect(page).not.toMatch(/pairing is more rational than stacks/i)
  })

  it('removes affiliate product picks from an unvalidated combination page', () => {
    const page = readGuide()

    expect(page).not.toMatch(/AffiliateProductBox/)
    expect(page).not.toMatch(/RecommendationSection/)
    expect(page).not.toMatch(/Rhodiola Product Picks/)
    expect(page).not.toMatch(/Magnesium Product Picks/)
  })

  it('keeps the uncertainty visible for both individual ingredients', () => {
    const page = readGuide()

    expect(page).toMatch(/fatigue, stress, mood, and performance rather than primary sleep treatment/i)
    expect(page).toMatch(/evidence quality was rated low to very low/i)
    expect(page).toMatch(/statistically significant but <strong>small<\/strong> improvement/i)
  })

  it('keeps the duplicate content source from restoring the old protocol', () => {
    const source = readSource()

    expect(source).toMatch(/untested combination of two separately studied ingredients/i)
    expect(source).not.toMatch(/The Adaptogen Protocol That Works/i)
    expect(source).not.toMatch(/## The Protocol/i)
    expect(source).not.toMatch(/physiologically necessary/i)
    expect(source).not.toMatch(/they're safe when combined at standard doses/i)
  })
})

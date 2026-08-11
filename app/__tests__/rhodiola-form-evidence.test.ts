import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getRevenueProductSet } from '../../config/revenue-products'

const PAGE = path.join(
  process.cwd(),
  'app/guides/herbs/rhodiola-extract-vs-powder/page.tsx',
)

function source() {
  return fs.readFileSync(PAGE, 'utf8')
}

describe('rhodiola extract vs powder evidence framing', () => {
  it('anchors the page to current EMA evidence context', () => {
    const page = source()

    expect(page).toContain('European Medicines Agency')
    expect(page).toMatch(/long-standing\s+traditional use/)
    expect(page).toContain('clinical studies')
    expect(page).toContain('several shortcomings')
  })

  it('does not turn extract traceability into a superiority claim', () => {
    const page = source()

    expect(page).toContain('traceability advantage, not proof')
    expect(page).toContain('does not establish')
    expect(page).toContain('it does not prove that the extract is clinically superior')
    expect(page).not.toMatch(/prefer (?:a )?(?:standardized|characterized) extract/i)
    expect(page).not.toMatch(/best (?:form|choice)/i)
  })

  it('keeps trial doses preparation-specific rather than prescriptive', () => {
    const page = source()

    expect(page).toContain('not a universal rhodiola dose')
    expect(page).toContain('No evidence-based equivalent')
    expect(page).not.toMatch(/take \d+\s*(?:mg|milligrams?)/i)
  })

  it('shows directness context and the mixed direction of trial results', () => {
    const page = source()

    expect(page).toContain('60 adults ages 20–55')
    expect(page).toContain('576 mg/day')
    expect(page).toContain('28 days')
    expect(page).toContain('56 young, healthy physicians')
    expect(page).toContain('two-week treatment period')
    expect(page).toContain('48 nursing students ages 18–55')
    expect(page).toContain('42 days')
    expect(page).toContain('the placebo group did better')
  })

  it('renders only rhodiola products with direct listing identifiers', () => {
    const page = source()
    const productSet = getRevenueProductSet('rhodiola')
    const directProducts = productSet?.products.filter((product) => Boolean(product.asin)) ?? []

    expect((page.match(/<AffiliateProductBox/g) || []).length).toBe(1)
    expect(page).toContain('.products.filter((product) => Boolean(product.asin))')
    expect(directProducts.length).toBeGreaterThan(0)
    expect(directProducts.every((product) => Boolean(product.asin))).toBe(true)
    expect(
      directProducts.every(
        (product) => typeof product.affiliateUrl === 'string' && !product.affiliateUrl.includes('/s?k='),
      ),
    ).toBe(true)
  })
})

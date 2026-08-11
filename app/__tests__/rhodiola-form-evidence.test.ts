import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

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
    expect(page).toContain('long-standing traditional use')
    expect(page).toContain('clinical studies')
    expect(page).toContain('several shortcomings')
  })

  it('does not turn extract traceability into a superiority claim', () => {
    const page = source()

    expect(page).toContain('traceability advantage, not proof')
    expect(page).toContain('does not establish')
    expect(page).not.toMatch(/extracts? are (?:more effective|superior)/i)
    expect(page).not.toMatch(/prefer (?:a )?(?:standardized|characterized) extract/i)
    expect(page).not.toMatch(/best (?:form|choice)/i)
  })

  it('keeps trial doses preparation-specific rather than prescriptive', () => {
    const page = source()

    expect(page).toContain('not a universal rhodiola dose')
    expect(page).toContain('No evidence-based equivalent')
    expect(page).not.toMatch(/take \d+\s*(?:mg|milligrams?)/i)
  })

  it('keeps one curated product module and no generic Amazon search exits', () => {
    const page = source()

    expect((page.match(/<AffiliateProductBox/g) || []).length).toBe(1)
    expect(page).not.toContain('amazon.com/s?k=')
  })
})

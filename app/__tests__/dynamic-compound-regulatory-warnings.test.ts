import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readPage = () => fs
  .readFileSync(path.join(process.cwd(), 'app/compounds/[slug]/page.tsx'), 'utf8')
  .replace(/\s+/g, ' ')

describe('dynamic compound regulatory warnings', () => {
  it('does not retain pre-meeting peptide language after the July 2026 FDA advisory review', () => {
    const page = readPage()

    expect(page).toContain('discussed BPC-157 on July 23, 2026')
    expect(page).toContain('discussed the thymosin-beta-4 fragment on July 23, 2026')
    expect(page).not.toMatch(/scheduled July 23(?:–24)?, 2026 review/i)
    expect(page).not.toMatch(/regulatory gray zone pending/i)
  })

  it('does not forecast ipamorelin Category 1 status', () => {
    const page = readPage()

    expect(page).toMatch(/lists ipamorelin acetate in Category 2 under the 503B interim policy/i)
    expect(page).not.toMatch(/expected to move toward Category 1/i)
  })

  it('keeps 503A and 503B GLP-1 rules distinct', () => {
    const page = readPage()

    expect(page).toMatch(/503A patient-specific compounding is subject to conditions/i)
    expect(page).toMatch(/not currently on the 503B bulks list/i)
    expect(page).toMatch(/proposal, not a final blanket rule/i)
    expect(page).not.toMatch(/compounded access now generally requires individualized, physician-documented clinical necessity/i)
  })

  it('does not label missing or pending safety as standard caution', () => {
    const page = readPage()

    expect(page).toContain("if (/pending|limited|review/i.test(safetyLevel)) return 'Review needed'")
    expect(page).toContain("safetyLevel || 'Safety review pending'")
    expect(page).not.toContain("safetyLevel || 'Standard caution'")
  })
})

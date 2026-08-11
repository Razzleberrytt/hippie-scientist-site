import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const pagePath = path.join(
  process.cwd(),
  'app/guides/anxiety/ashwagandha-for-anxiety/page.tsx',
)
const source = fs.readFileSync(pagePath, 'utf8')

describe('Ashwagandha for Anxiety claim and conversion discipline', () => {
  it('does not promise acute L-theanine efficacy or reassure about combination safety', () => {
    expect(source).not.toMatch(/works? within\s+30/i)
    expect(source).not.toMatch(/no well-documented major interactions/i)
    expect(source).not.toMatch(/cleaner first choice/i)
    expect(source).not.toMatch(/fastest useful choice/i)
    expect(source).toMatch(/does not establish that ashwagandha and magnesium are safe or beneficial to combine/i)
  })

  it('keeps one curated, tracked buying path instead of generic Amazon search exits', () => {
    expect(source).not.toMatch(/AFFILIATE_TAGS/)
    expect(source).not.toMatch(/amazon\.com\/s\?k=/i)
    expect(source).toContain('Curated ashwagandha product examples')
    expect(source).toContain('trackingProductSlug="ashwagandha"')
    expect(source).toContain('trackingLocation="guide-ashwagandha-anxiety"')
  })

  it('records the editorial refresh separately from the original publish date', () => {
    expect(source).toContain("PUBLISHED_DATE = '2026-06-10'")
    expect(source).toContain("UPDATED_DATE = '2026-08-11'")
    expect(source).toContain('<LastUpdatedBadge date={UPDATED_DATE} />')
  })
})

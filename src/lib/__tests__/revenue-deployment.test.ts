import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function source(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('revenue deployment placements', () => {
  test('manual SEO entry pages can render email capture and recommendation sections', () => {
    const page = source('app/seo-entry-pages.tsx')

    expect(page).toContain('EmailCapture')
    expect(page).toContain('RecommendationSection')
    expect(page).toContain('getRevenueProductSet')
    expect(page).toContain('revenueProductSlugs')
    expect(page).toContain("'guides/best-supplements-for-sleep': ['magnesium', 'l-theanine']")
    expect(page).toContain("'guides/best-supplements-for-stress': ['ashwagandha', 'rhodiola', 'l-theanine']")
    expect(page).toContain("'guides/best-supplements-for-focus': ['l-theanine', 'lions-mane']")
    expect(page).toContain("'guides/best-nootropics-for-focus': ['l-theanine', 'lions-mane']")
  })

  test('rhodiola versus ashwagandha comparison page includes disclosure, recommendations, and capture', () => {
    const page = source('app/guides/guides/compare/rhodiola-vs-ashwagandha/page.tsx')

    expect(page).toContain('AffiliateDisclosure')
    expect(page).toContain('EmailCapture')
    expect(page).toContain('RecommendationSection')
    expect(page).toContain('getRevenueProductSet')
  })

  test('compound profiles place email capture after evidence summary before product recommendations', () => {
    const page = source('app/compounds/[slug]/page.tsx')
    const evidenceIndex = page.indexOf('Evidence Summary')
    const emailIndex = page.indexOf('<EmailCapture')
    const recommendationIndex = page.indexOf('<RecommendationSection')

    expect(emailIndex).toBeGreaterThan(evidenceIndex)
    expect(recommendationIndex).toBeGreaterThan(emailIndex)
  })
})

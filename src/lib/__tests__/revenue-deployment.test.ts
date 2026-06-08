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

  test('supplement alias pages use email capture and recommendations', () => {
    for (const path of ['app/sleep-supplements/page.tsx', 'app/stress-supplements/page.tsx', 'app/cognition-supplements/page.tsx']) {
      const page = source(path)

      expect(page).toContain('EmailCapture')
      expect(page).toContain('AffiliateDisclosure')
      expect(page).toContain('RecommendationSection')
      expect(page).toContain('getRevenueProductSet')
    }
  })

  test('ashwagandha versus rhodiola stress comparison includes disclosure, recommendations, and capture', () => {
    const page = source('app/compare/ashwagandha-vs-rhodiola-for-stress/page.tsx')

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

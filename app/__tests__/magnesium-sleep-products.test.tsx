import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import RecommendedProduct from '@/components/RecommendedProduct'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'

vi.mock('@/lib/runtime-data', () => ({
  getHerbs: async () => [],
  getCompounds: vi.fn(async () => [{
    slug: 'magnesium', profile_status: 'complete', evidence_tier: 'Moderate evidence',
    evidence_grade: 'B', mechanisms: ['NMDA modulation'], sources: [],
    indexability_status: 'PUBLISH', governance: { monetizationAllowed: true },
  }]),
  getHerbBySlug: async () => null,
  getCompoundBySlug: vi.fn(async () => ({
    slug: 'magnesium', profile_status: 'complete', evidence_tier: 'Moderate evidence',
    evidence_grade: 'B', mechanisms: ['NMDA modulation'], indexability_status: 'PUBLISH',
    governance: { monetizationAllowed: true },
    sources: [{ pmid: '23853635', studyType: 'Randomized controlled trial',
      title: 'The effect of magnesium supplementation on primary insomnia in elderly: A double-blind placebo-controlled clinical trial' }],
  })),
}))

function assertClearedProductLinks(html: string) {
  for (const asin of ['B07P5K7DQP', 'B000BD0RT0']) {
    expect(html).toContain(`https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAGS.amazon}`)
    expect(html).toContain(`data-product-asin="${asin}"`)
  }
  expect(html).toContain('As an Amazon Associate')
  expect(html.indexOf('As an Amazon Associate')).toBeLessThan(html.indexOf('https://www.amazon.com/'))
  expect(html).not.toMatch(/provisional product ASIN|verification pending/i)
  expect(html).toContain('https://www.amazon.com/s?k=Thorne%20Magnesium%20Bisglycinate%20powder')
}

describe('owner-cleared magnesium sleep sourcing', () => {
  it('renders both cleared ASINs through the existing best-magnesium module', async () => {
    const html = renderToStaticMarkup(await RecommendedProduct({ slug: 'magnesium', limit: 3 }))
    assertClearedProductLinks(html)
    expect(html).toContain('Search Amazon')
  })

  it('renders the same catalog through the forms guide module with a labeled search fallback', async () => {
    const products = getRevenueProductSet('magnesium')!.products
    const section = await RecommendationSection({ products, trackingProductSlug: 'magnesium' })
    const html = renderToStaticMarkup(section)
    assertClearedProductLinks(html)
    expect(html).toContain('Search Amazon')
    expect(products.find((product) => product.brand === 'Thorne')?.asin).toBeUndefined()
  })

  it('suppresses both modules when the full canonical record explicitly denies monetization', async () => {
    const denied = { slug: 'magnesium', monetization_allowed: false }
    vi.mocked(getCompoundBySlug).mockResolvedValueOnce(denied).mockResolvedValueOnce(denied)
    const section = await RecommendationSection({
      products: getRevenueProductSet('magnesium')!.products, trackingProductSlug: 'magnesium',
    })
    const html = renderToStaticMarkup(section)
    expect(html).not.toContain('https://www.amazon.com/')
    expect(html).toContain('Recommendation status')
    expect(renderToStaticMarkup(await RecommendedProduct({ slug: 'magnesium', limit: 3 }))).not.toContain('https://www.amazon.com/')
  })

  it('preserves the summary denial when a hidden full record is unavailable', async () => {
    const hidden = [{ slug: 'magnesium', runtime_export_decision: 'hide' }]
    vi.mocked(getCompounds).mockResolvedValueOnce(hidden).mockResolvedValueOnce(hidden)
    vi.mocked(getCompoundBySlug).mockResolvedValueOnce(null).mockResolvedValueOnce(null)
    const section = await RecommendationSection({
      products: getRevenueProductSet('magnesium')!.products, trackingProductSlug: 'magnesium',
    })
    expect(renderToStaticMarkup(section)).not.toContain('https://www.amazon.com/')
    expect(renderToStaticMarkup(await RecommendedProduct({ slug: 'magnesium', limit: 3 }))).not.toContain('https://www.amazon.com/')
  })
})

import { describe, expect, it } from 'vitest'
import {
  buildRevenueEvent,
  classifyRevenueRoute,
  getRevenueDeviceType,
  getRevenueScrollDepth,
  getRevenueTargetHost,
  inferRevenueProductSlug,
  normalizeRevenueEventKind,
} from '../revenue-tracking'

describe('revenue tracking', () => {
  it('normalizes supported revenue event kinds', () => {
    expect(normalizeRevenueEventKind('recommendation_impression')).toBe('recommendation_impression')
    expect(normalizeRevenueEventKind('recommendation_click')).toBe('recommendation_click')
    expect(normalizeRevenueEventKind('affiliate_click')).toBe('affiliate_click')
    expect(normalizeRevenueEventKind('cta_click')).toBe('cta_click')
    expect(normalizeRevenueEventKind('email_signup_attempt')).toBe('email_signup_attempt')
    expect(normalizeRevenueEventKind('other')).toBe('cta_click')
  })

  it('classifies the route families that drive commercial decisions', () => {
    expect(classifyRevenueRoute('/')).toBe('home')
    expect(classifyRevenueRoute('/herbs/ashwagandha/')).toBe('herb-profile')
    expect(classifyRevenueRoute('/compounds/magnesium-glycinate/')).toBe('compound-profile')
    expect(classifyRevenueRoute('/guides/compare/rhodiola-vs-ashwagandha/')).toBe('comparison')
    expect(classifyRevenueRoute('/guides/sleep/best-supplements-for-sleep/')).toBe('best-supplements')
    expect(classifyRevenueRoute('/guides/other/alkaloids-on-amazon/')).toBe('guide')
  })

  it('derives device, scroll, host, and profile context without personal data', () => {
    expect(getRevenueDeviceType(390)).toBe('mobile')
    expect(getRevenueDeviceType(900)).toBe('tablet')
    expect(getRevenueDeviceType(1440)).toBe('desktop')
    expect(getRevenueScrollDepth({ viewportHeight: 800, scrollY: 500, documentHeight: 2000 })).toBe('50-74')
    expect(getRevenueTargetHost('https://www.amazon.com/dp/B000000000?tag=example')).toBe('amazon.com')
    expect(inferRevenueProductSlug('/compounds/magnesium-glycinate/')).toBe('magnesium-glycinate')
  })

  it('builds static-export compatible attribution payloads', () => {
    const event = buildRevenueEvent(
      {
        kind: 'recommendation_click',
        location: 'recommendation-section',
        label: 'Best overall',
        target: 'https://www.amazon.com/product',
        productSlot: 'overall',
        productAsin: 'B000000000',
      },
      {
        pagePath: '/compounds/magnesium-glycinate/?source=guide',
        viewportWidth: 390,
        viewportHeight: 800,
        scrollY: 500,
        documentHeight: 2000,
      },
    )

    expect(event).toMatchObject({
      kind: 'recommendation_click',
      location: 'recommendation-section',
      label: 'Best overall',
      target: 'https://www.amazon.com/product',
      targetHost: 'amazon.com',
      pagePath: '/compounds/magnesium-glycinate/',
      routeFamily: 'compound-profile',
      productSlug: 'magnesium-glycinate',
      productSlot: 'overall',
      productAsin: 'B000000000',
      deviceType: 'mobile',
      scrollDepth: '50-74',
    })
    expect(event.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('uses the same dimensions for recommendation impressions and clicks', () => {
    const impression = buildRevenueEvent(
      {
        kind: 'recommendation_impression',
        location: 'compare-recommendation',
        label: 'Magnesium glycinate',
        productSlug: 'magnesium',
        productSlot: 'overall',
        productAsin: 'B000000000',
      },
      {
        pagePath: '/guides/compare/magnesium-vs-melatonin/',
        viewportWidth: 1440,
        viewportHeight: 900,
        scrollY: 1200,
        documentHeight: 3000,
      },
    )

    expect(impression).toMatchObject({
      kind: 'recommendation_impression',
      location: 'compare-recommendation',
      label: 'Magnesium glycinate',
      routeFamily: 'comparison',
      productSlug: 'magnesium',
      productSlot: 'overall',
      productAsin: 'B000000000',
      deviceType: 'desktop',
      scrollDepth: '50-74',
    })
  })
})

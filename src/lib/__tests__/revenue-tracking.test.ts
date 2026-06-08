import { describe, expect, it } from 'vitest'
import { buildRevenueEvent, normalizeRevenueEventKind } from '@/lib/revenue-tracking'

describe('revenue tracking', () => {
  it('normalizes supported revenue event kinds', () => {
    expect(normalizeRevenueEventKind('recommendation_click')).toBe('recommendation_click')
    expect(normalizeRevenueEventKind('cta_click')).toBe('cta_click')
    expect(normalizeRevenueEventKind('email_signup_attempt')).toBe('email_signup_attempt')
    expect(normalizeRevenueEventKind('other')).toBe('cta_click')
  })

  it('builds static-export compatible event payloads', () => {
    const event = buildRevenueEvent({
      kind: 'recommendation_click',
      location: 'compound-page',
      label: 'Best overall',
      target: 'https://example.com/product',
    })

    expect(event).toMatchObject({
      kind: 'recommendation_click',
      location: 'compound-page',
      label: 'Best overall',
      target: 'https://example.com/product',
    })
    expect(event.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

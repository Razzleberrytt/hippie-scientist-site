import { describe, expect, it } from 'vitest'

import { handleLegacyCompareRequest } from '../legacy-compare'

describe('legacy comparison routing', () => {
  it('redirects the legacy index to the comparison hub', () => {
    const response = handleLegacyCompareRequest(
      new Request('https://thehippiescientist.net/compare/'),
      'compare',
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://thehippiescientist.net/guides/compare/')
  })

  it('redirects a legacy slug only when a static comparison page exists', () => {
    const response = handleLegacyCompareRequest(
      new Request('https://thehippiescientist.net/compare/melatonin-vs-magnesium/'),
      'compare',
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://thehippiescientist.net/guides/compare/melatonin-vs-magnesium/',
    )
  })

  it('maps known legacy aliases to their current canonical comparison', () => {
    const response = handleLegacyCompareRequest(
      new Request('https://thehippiescientist.net/comparisons/ashwagandha-vs-rhodiola/'),
      'comparisons',
    )

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://thehippiescientist.net/guides/compare/rhodiola-vs-ashwagandha/',
    )
  })

  it('returns 410 instead of redirecting a phantom comparison into a 404', () => {
    const response = handleLegacyCompareRequest(
      new Request('https://thehippiescientist.net/compare/nonexistent-vs-phantom/'),
      'compare',
    )

    expect(response.status).toBe(410)
    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
  })
})

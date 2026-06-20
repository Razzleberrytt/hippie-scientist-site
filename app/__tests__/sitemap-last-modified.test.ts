import { describe, expect, it } from 'vitest'
import { getSitemapLastModified, normalizeSitemapDate } from '../sitemap'

describe('sitemap lastModified dates', () => {
  it('uses camelCase and snake_case modified date fields', () => {
    expect(getSitemapLastModified({ lastUpdated: '2026-01-02' })).toBe('2026-01-02')
    expect(getSitemapLastModified({ updatedAt: '2026-01-03T12:00:00.000Z' })).toBe('2026-01-03')
    expect(getSitemapLastModified({ last_updated: '2026-01-04' })).toBe('2026-01-04')
    expect(getSitemapLastModified({ last_reviewed: '2026-01-05' })).toBe('2026-01-05')
    expect(getSitemapLastModified({ updated_at: '2026-01-06' })).toBe('2026-01-06')
    expect(getSitemapLastModified({ reviewedAt: '2026-01-07' })).toBe('2026-01-07')
  })

  it('ignores empty and invalid date values', () => {
    expect(getSitemapLastModified({ lastUpdated: '', last_updated: 'not-a-date' })).toBeUndefined()
    expect(normalizeSitemapDate('2026-02-30')).toBeUndefined()
    expect(normalizeSitemapDate('')).toBeUndefined()
  })

  it('falls through to a later valid field instead of returning an invalid earlier field', () => {
    expect(getSitemapLastModified({
      lastUpdated: 'invalid',
      updatedAt: '',
      last_updated: '2026-02-14',
    })).toBe('2026-02-14')
  })

  it('does not synthesize a build-date fallback when no reliable date exists', () => {
    expect(getSitemapLastModified({ slug: 'ashwagandha' })).toBeUndefined()
  })

  it('supports explicit source-specific fallback fields', () => {
    expect(getSitemapLastModified({ date: '2024-05-20' }, ['date'])).toBe('2024-05-20')
    expect(getSitemapLastModified({ dateModified: '2026-06-10' }, ['dateModified'])).toBe('2026-06-10')
  })
})

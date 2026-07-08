import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PLATFORM_REGION,
  getOutboundLinkRel,
  getPlatformRegionConfig,
  normalizePlatformRegion,
  resolveRegionalUrl,
} from '../platforms'

describe('international platform helpers', () => {
  it('defaults unknown or missing regions to the US platform region', () => {
    expect(DEFAULT_PLATFORM_REGION).toBe('US')
    expect(normalizePlatformRegion()).toBe('US')
    expect(normalizePlatformRegion('')).toBe('US')
    expect(normalizePlatformRegion('unknown')).toBe('US')
  })

  it('normalizes common region aliases', () => {
    expect(normalizePlatformRegion('usa')).toBe('US')
    expect(normalizePlatformRegion('United States')).toBe('US')
    expect(normalizePlatformRegion('gb')).toBe('UK')
    expect(normalizePlatformRegion('United Kingdom')).toBe('UK')
    expect(normalizePlatformRegion('canada')).toBe('CA')
  })

  it('exposes the expected regional platform metadata', () => {
    expect(getPlatformRegionConfig('US').amazonHost).toBe('www.amazon.com')
    expect(getPlatformRegionConfig('UK').amazonHost).toBe('www.amazon.co.uk')
    expect(getPlatformRegionConfig('CA').amazonHost).toBe('www.amazon.ca')
  })

  it('resolves an explicitly configured regional URL when available', () => {
    expect(
      resolveRegionalUrl({
        defaultUrl: 'https://www.amazon.com/example',
        preferredRegion: 'UK',
        regionalUrls: {
          US: 'https://www.amazon.com/example',
          UK: 'https://www.amazon.co.uk/example',
        },
      }),
    ).toBe('https://www.amazon.co.uk/example')
  })

  it('falls back to the US URL before the generic default URL', () => {
    expect(
      resolveRegionalUrl({
        defaultUrl: 'https://retailer.example/default',
        preferredRegion: 'CA',
        regionalUrls: {
          US: 'https://www.amazon.com/example',
        },
      }),
    ).toBe('https://www.amazon.com/example')
  })

  it('falls back to the generic default URL when no regional URL exists', () => {
    expect(
      resolveRegionalUrl({
        defaultUrl: 'https://retailer.example/default',
        preferredRegion: 'CA',
      }),
    ).toBe('https://retailer.example/default')
  })

  it('keeps outbound link rel values explicit', () => {
    expect(getOutboundLinkRel()).toBe('sponsored nofollow noopener noreferrer')
    expect(getOutboundLinkRel(false)).toBe('noopener noreferrer')
  })
})

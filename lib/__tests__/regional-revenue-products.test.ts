import { describe, expect, it } from 'vitest'
import {
  getRegionalRevenueProductOverride,
  makeRegionalRevenueProductKey,
  normalizeRegionalRevenueProductTitle,
  validateRegionalRevenueProductOverrides,
} from '@/config/regional-revenue-products'

describe('regional revenue product overrides', () => {
  it('normalizes product titles into stable override keys', () => {
    expect(normalizeRegionalRevenueProductTitle('Sports Research Triple Strength Omega-3')).toBe(
      'sports-research-triple-strength-omega-3',
    )
    expect(normalizeRegionalRevenueProductTitle('Saw Palmetto & Beta-Sitosterol')).toBe(
      'saw-palmetto-and-beta-sitosterol',
    )
  })

  it('builds deterministic keys from set slug, slot, and title', () => {
    expect(
      makeRegionalRevenueProductKey({
        setSlug: 'omega-3',
        slot: 'premium',
        title: 'Sports Research Triple Strength Omega-3',
      }),
    ).toBe('omega-3:premium:sports-research-triple-strength-omega-3')
  })

  it('looks up explicitly configured regional URL overrides', () => {
    const overrides = {
      'omega-3:premium:sports-research-triple-strength-omega-3': {
        regionalUrls: {
          US: 'https://www.amazon.com/example-us',
          UK: 'https://www.amazon.co.uk/example-uk',
        },
        verifiedAt: '2026-07-08',
      },
    }

    expect(
      getRegionalRevenueProductOverride(
        {
          setSlug: 'omega-3',
          slot: 'premium',
          title: 'Sports Research Triple Strength Omega-3',
        },
        overrides,
      )?.regionalUrls.UK,
    ).toBe('https://www.amazon.co.uk/example-uk')
  })

  it('requires an explicit US fallback URL for each regional override', () => {
    expect(
      validateRegionalRevenueProductOverrides({
        'omega-3:premium:test': {
          regionalUrls: {
            UK: 'https://www.amazon.co.uk/example-uk',
          },
        },
      }),
    ).toEqual(['omega-3:premium:test: regional override must include an explicit US fallback URL'])
  })

  it('requires regional override URLs to be absolute HTTPS URLs', () => {
    expect(
      validateRegionalRevenueProductOverrides({
        'omega-3:premium:test': {
          regionalUrls: {
            US: 'https://www.amazon.com/example-us',
            CA: 'http://www.amazon.ca/example-ca',
          },
        },
      }),
    ).toEqual(['omega-3:premium:test: CA URL must be absolute HTTPS'])
  })
})

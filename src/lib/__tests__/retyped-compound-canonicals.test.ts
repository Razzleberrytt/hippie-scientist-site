import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { canonicalProfileHref } from '../../../lib/canonical-profile-href'
import { DEPRECATED_COMPOUND_CANONICALS } from '../../../lib/deprecated-compound-canonicals'
import {
  CROSS_TAXONOMY_REDIRECT_SLUGS,
  DEPRECATED_HERB_CANONICALS,
} from '../../../lib/deprecated-herb-canonicals'

// Post-#4186 regression contract: preserve duplicate consolidation while correcting taxonomy.
describe('retyped compound canonical identities', () => {
  it('routes old herb identities directly to final compound canonicals', () => {
    expect(DEPRECATED_HERB_CANONICALS.resveratrol).toBe('resveratrol')
    expect(DEPRECATED_HERB_CANONICALS.citicoline).toBe('cdp-choline')
    expect(DEPRECATED_HERB_CANONICALS.quercetin).toBe('quercetin')
    expect(DEPRECATED_HERB_CANONICALS.phosphatidylserine).toBe('phosphatidylserine')
    expect(DEPRECATED_HERB_CANONICALS.tyrosine).toBe('l-tyrosine')

    for (const slug of ['resveratrol', 'citicoline', 'quercetin', 'phosphatidylserine', 'tyrosine']) {
      expect(CROSS_TAXONOMY_REDIRECT_SLUGS.has(slug)).toBe(true)
    }

    expect(canonicalProfileHref('herbs', 'resveratrol')).toBe('/compounds/resveratrol/')
    expect(canonicalProfileHref('herbs', 'citicoline')).toBe('/compounds/cdp-choline/')
    expect(canonicalProfileHref('herbs', 'quercetin')).toBe('/compounds/quercetin/')
    expect(canonicalProfileHref('herbs', 'phosphatidylserine')).toBe('/compounds/phosphatidylserine/')
    expect(canonicalProfileHref('herbs', 'tyrosine')).toBe('/compounds/l-tyrosine/')
  })

  it('suppresses duplicate compound aliases while keeping resveratrol canonical', () => {
    expect(DEPRECATED_COMPOUND_CANONICALS.tyrosine).toBe('l-tyrosine')
    expect(DEPRECATED_COMPOUND_CANONICALS.citicoline).toBe('cdp-choline')
    expect(DEPRECATED_COMPOUND_CANONICALS['trans-resveratrol']).toBe('resveratrol')
    expect(DEPRECATED_COMPOUND_CANONICALS.resveratrol).toBeUndefined()

    expect(canonicalProfileHref('compounds', 'tyrosine')).toBe('/compounds/l-tyrosine/')
    expect(canonicalProfileHref('compounds', 'citicoline')).toBe('/compounds/cdp-choline/')
    expect(canonicalProfileHref('compounds', 'trans-resveratrol')).toBe('/compounds/resveratrol/')
    expect(canonicalProfileHref('compounds', 'resveratrol')).toBe('/compounds/resveratrol/')
  })

  it('keeps direct Cloudflare redirects for all migrated identities', () => {
    const redirects = readFileSync(path.join(process.cwd(), 'public/_redirects'), 'utf8')
    const required = [
      '/herbs/resveratrol /compounds/resveratrol/ 301',
      '/compounds/trans-resveratrol /compounds/resveratrol/ 301',
      '/herbs/citicoline /compounds/cdp-choline/ 301',
      '/compounds/citicoline /compounds/cdp-choline/ 301',
      '/herbs/quercetin /compounds/quercetin/ 301',
      '/herbs/phosphatidylserine /compounds/phosphatidylserine/ 301',
      '/herbs/tyrosine /compounds/l-tyrosine/ 301',
      '/compounds/tyrosine /compounds/l-tyrosine/ 301',
    ]
    for (const rule of required) expect(redirects).toContain(rule)
  })
})

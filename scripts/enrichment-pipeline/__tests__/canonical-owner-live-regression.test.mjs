import { describe, expect, it } from 'vitest'
import { createCanonicalOwnerResolver } from '../lib/canonical-owner.mjs'

const resolver = createCanonicalOwnerResolver({ root: process.cwd() })

describe('live canonical enrichment owner regressions', () => {
  it('maps CBD and NAC aliases to their canonical compound owners', () => {
    expect(resolver.resolveWorkpack({ workpackId: 'wp_compound_cbd' }).workpackId)
      .toBe('wp_compound_cannabidiol')
    expect(resolver.resolveWorkpack({ workpackId: 'wp_compound_nac' }).workpackId)
      .toBe('wp_compound_n_acetylcysteine')
  })

  it('follows the current cross-taxonomy Resveratrol canonical route', () => {
    const resolved = resolver.resolveWorkpack({ workpackId: 'wp_herb_resveratrol' })
    expect(resolved.workpackId).toBe('wp_compound_resveratrol')
    expect(resolved.ownerResolution.via.some(step => step.authority === 'public/_redirects')).toBe(true)
  })
})

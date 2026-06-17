import { describe, it, expect } from 'vitest'

import { isBuiltComparisonSlug } from '@/lib/comparison-utils'
import { buildComparisonRecommendations } from '@/lib/semantic/buildComparisonRecommendations'
import { getComparisonCandidates } from '@/lib/semantic-runtime'
import { buildCompareCTA } from '@/lib/conversion-aware-layouts'

/**
 * Guards against the regression that produced a large "Not found (404)" cluster
 * in Google Search Console: dynamic generators emitting `/compare/<slug>` links
 * for comparison pages that are never built. Under static export those links
 * 404 the moment a crawler follows them.
 *
 * Every generator that can build a `/compare/...` href must only emit slugs that
 * are actually built (`isBuiltComparisonSlug`). These tests feed each generator
 * the exact shapes that historically leaked phantoms and assert nothing unbuilt
 * escapes.
 */

function compareSlug(href: string): string {
  return href.replace(/^\/compare\//, '').replace(/\/$/, '')
}

describe('compare link integrity', () => {
  it('isBuiltComparisonSlug accepts a known built pair and rejects phantoms', () => {
    // `aescin-vs-ajoene` is part of the generated/adjacent comparison set that
    // `app/compare/[slug]/page.tsx` builds via generateStaticParams.
    expect(isBuiltComparisonSlug('aescin-vs-ajoene')).toBe(true)
    // Mechanism / signal "comparisons" and arbitrary pairs are not built pages.
    expect(isBuiltComparisonSlug('garcinia-indica-vs-nf-b-inhibition')).toBe(false)
    expect(isBuiltComparisonSlug('citicoline-vs-neuroprotective-activity')).toBe(false)
    expect(isBuiltComparisonSlug('alpha-gpc')).toBe(false)
  })

  it('buildComparisonRecommendations never emits an unbuilt /compare/ slug', () => {
    // Mechanisms/pathways/effects are NOT comparison pages — the historical leak.
    const record = {
      name: 'Garcinia Indica',
      slug: 'garcinia-indica',
      primary_effects: ['NF-B inhibition', 'HAT inhibition'],
      mechanisms: ['JAK-STAT modulation', 'neuroprotective activity'],
      pathways: ['inflammatory signaling modulation'],
    }

    const items = buildComparisonRecommendations(record)
    for (const item of items) {
      expect(isBuiltComparisonSlug(compareSlug(item.href))).toBe(true)
    }
  })

  it('getComparisonCandidates only links to built comparison pages', () => {
    const compound = {
      name: 'Cordyceps',
      slug: 'cordyceps',
      effects: ['energy', 'endurance'],
      mechanisms: ['atp production'],
    }

    const candidates = getComparisonCandidates(compound, 8)
    for (const candidate of candidates) {
      expect(candidate.href.startsWith('/compare/')).toBe(true)
      expect(isBuiltComparisonSlug(compareSlug(candidate.href))).toBe(true)
    }
  })

  it('buildCompareCTA falls back to the /compare hub for unbuilt topics', () => {
    const cta = buildCompareCTA({ name: 'Sleep Herbs', slug: 'sleep-herbs' })
    // Either the comparison hub, or a genuinely built comparison page.
    if (cta.href !== '/compare') {
      expect(isBuiltComparisonSlug(compareSlug(cta.href))).toBe(true)
    } else {
      expect(cta.href).toBe('/compare')
    }
  })
})

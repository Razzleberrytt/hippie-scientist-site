import { describe, it, expect } from 'vitest'

import { isBuiltComparisonSlug } from '@/lib/comparison-utils'
import { buildComparisonRecommendations } from '@/lib/semantic/buildComparisonRecommendations'
import { getComparisonCandidates } from '@/lib/semantic-runtime'
import { buildCompareCTA } from '@/lib/conversion-aware-layouts'
import { buildSemanticLinkSuggestions } from '@/lib/semantic-internal-linking'

/**
 * Guards against the regression that produced a large "Not found (404)" cluster
 * in Google Search Console: dynamic generators emitting `/guides/compare/<slug>` links
 * for comparison pages that are never built. Under static export those links
 * 404 the moment a crawler follows them.
 *
 * Every generator that can build a `/guides/compare/...` href must only emit slugs that
 * are actually built (`isBuiltComparisonSlug`). These tests feed each generator
 * the exact shapes that historically leaked phantoms and assert nothing unbuilt
 * escapes.
 */

function compareSlug(href: string): string {
  return href.replace(/^\/(?:guides\/)?compare\//, '').replace(/\/$/, '')
}

describe('compare link integrity', () => {
  it('isBuiltComparisonSlug accepts a known built pair and rejects phantoms', () => {
    // Only pages with a real `app/guides/compare/<slug>/page.tsx` are built.
    expect(isBuiltComparisonSlug('rhodiola-vs-ashwagandha')).toBe(true)
    expect(isBuiltComparisonSlug('kava-vs-alcohol')).toBe(true)
    // Config "adjacent pairs" / combinations have NO page and must be rejected —
    // treating them as built was the source of the /guides/compare/* 404 cluster.
    expect(isBuiltComparisonSlug('aescin-vs-ajoene')).toBe(false)
    // Mechanism / signal "comparisons" and arbitrary pairs are not built pages.
    expect(isBuiltComparisonSlug('garcinia-indica-vs-nf-b-inhibition')).toBe(false)
    expect(isBuiltComparisonSlug('citicoline-vs-neuroprotective-activity')).toBe(false)
    expect(isBuiltComparisonSlug('alpha-gpc')).toBe(false)
  })

  it('buildComparisonRecommendations never emits an unbuilt /guides/compare/ slug', () => {
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
      expect(candidate.href.startsWith('/guides/compare/')).toBe(true)
      expect(isBuiltComparisonSlug(compareSlug(candidate.href))).toBe(true)
    }
  })


  it('buildSemanticLinkSuggestions keeps built comparisons and drops unbuilt comparisons', () => {
    const source = {
      slug: 'ashwagandha',
      name: 'Ashwagandha',
      effects: ['stress'],
      mechanisms: ['cortisol'],
    }

    const suggestions = buildSemanticLinkSuggestions(source, [
      {
        slug: 'rhodiola-vs-ashwagandha',
        name: 'Rhodiola vs Ashwagandha',
        entityType: 'compare',
        effects: ['stress'],
        mechanisms: ['cortisol'],
      },
      {
        slug: 'ashwagandha-vs-random-unbuilt-topic',
        name: 'Ashwagandha vs Random Unbuilt Topic',
        entityType: 'compare',
        effects: ['stress'],
        mechanisms: ['cortisol'],
      },
    ])

    expect(suggestions.map((item) => item.href)).toEqual(['/guides/compare/rhodiola-vs-ashwagandha'])
  })

  it('buildCompareCTA falls back to the /guides/compare hub for unbuilt topics', () => {
    const cta = buildCompareCTA({ name: 'Sleep Herbs', slug: 'sleep-herbs' })
    // Either the comparison hub, or a genuinely built comparison page.
    if (cta.href !== '/guides/compare') {
      expect(isBuiltComparisonSlug(compareSlug(cta.href))).toBe(true)
    } else {
      expect(cta.href).toBe('/guides/compare')
    }
  })
})

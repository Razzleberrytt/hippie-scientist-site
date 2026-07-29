import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { CANONICALIZED_AWAY_PROFILE_SLUGS, generateDetailMetadata } from '../seo'

describe('CoQ10 canonical consolidation', () => {
  it('keeps coenzyme-q10 self-canonical and sitemap eligible', () => {
    const metadata = generateDetailMetadata(
      {
        name: 'Coenzyme Q10',
        slug: 'coenzyme-q10',
        evidenceLevel: 'moderate',
        safetyNotes: 'Review medication interactions before use.',
        primary_effects: ['Cellular energy'],
      },
      'compound',
    )

    expect(metadata.alternates?.canonical).toBe(
      'https://thehippiescientist.net/compounds/coenzyme-q10/',
    )
    expect(metadata.openGraph?.url).toBe(
      'https://thehippiescientist.net/compounds/coenzyme-q10/',
    )
    expect(CANONICALIZED_AWAY_PROFILE_SLUGS.has('coenzyme-q10')).toBe(false)
  })

  it('redirects the legacy coq10 slug toward the canonical runtime slug', () => {
    const redirects = readFileSync('public/_redirects', 'utf8')

    expect(redirects).toContain('/compounds/coq10 /compounds/coenzyme-q10/ 301')
    expect(redirects).not.toContain('/compounds/coenzyme-q10 /compounds/coq10/ 301')
  })
})

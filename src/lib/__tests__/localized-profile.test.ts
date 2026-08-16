import { describe, expect, it } from 'vitest'

import {
  assertCompleteProfileTranslation,
  profileTranslationCoverage,
  type CanonicalLocalizedProfile,
  type LocalizedProfileTranslation,
} from '../localized-profile'

const canonical: CanonicalLocalizedProfile = {
  name: 'Example',
  slug: 'example',
  claimMap: [
    { id: 'approved-1', claim: 'one', predicate: 'supports_outcome', reviewStatus: 'approved' },
    { id: 'approved-2', claim: 'two', predicate: 'has_safety_warning', reviewStatus: 'approved' },
    { id: 'pending-1', claim: 'three', predicate: 'supports_outcome', reviewStatus: 'pending' },
  ],
}

function translation(claims: Record<string, string>): LocalizedProfileTranslation {
  return {
    kind: 'herb',
    slug: 'example',
    path: '/es/hierbas/example/',
    title: 'Ejemplo',
    summary: 'Resumen traducido suficientemente sustantivo para una página localizada.',
    claims,
    originalPath: '/herbs/example/',
  }
}

describe('localized profile claim coverage', () => {
  it('requires every approved canonical claim and ignores pending claims', () => {
    const result = profileTranslationCoverage(canonical, translation({
      'approved-1': 'uno',
      'approved-2': 'dos',
    }))

    expect(result).toMatchObject({ approvedClaims: 2, translatedClaims: 2, missing: [], stale: [], complete: true })
  })

  it('fails closed when an approved claim is missing', () => {
    const localized = translation({ 'approved-1': 'uno' })
    expect(profileTranslationCoverage(canonical, localized).complete).toBe(false)
    expect(() => assertCompleteProfileTranslation(canonical, localized)).toThrow(/Incomplete localized profile/)
  })

  it('fails closed when a translation references a stale non-approved claim id', () => {
    const localized = translation({
      'approved-1': 'uno',
      'approved-2': 'dos',
      'pending-1': 'tres',
    })
    expect(profileTranslationCoverage(canonical, localized).stale).toEqual(['pending-1'])
    expect(() => assertCompleteProfileTranslation(canonical, localized)).toThrow(/stale=pending-1/)
  })
})

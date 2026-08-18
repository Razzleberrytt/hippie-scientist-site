import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Completeness now also requires the translation to be recorded at the current
 * claim revision, so a translated page cannot keep publishing after the claims
 * beneath it change. PROFILE_TRANSLATION_REVISIONS is a static literal keyed by
 * real published paths, so these fixtures drive it through this mock instead of
 * borrowing a live path whose hash they cannot match.
 */
const { revisionByPath } = vi.hoisted(() => ({ revisionByPath: new Map<string, string>() }))

vi.mock('../profile-translation-revisions', () => ({
  PROFILE_TRANSLATION_REVISIONS: {},
  getProfileTranslationRevision: (path: string) => revisionByPath.get(path) ?? null,
}))

import {
  assertCompleteProfileTranslation,
  canonicalProfileClaimRevision,
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
  beforeEach(() => {
    revisionByPath.clear()
    revisionByPath.set('/es/hierbas/example/', canonicalProfileClaimRevision(canonical))
  })

  it('requires every approved canonical claim and ignores pending claims', () => {
    const result = profileTranslationCoverage(canonical, translation({
      'approved-1': 'uno',
      'approved-2': 'dos',
    }))

    expect(result).toMatchObject({ approvedClaims: 2, translatedClaims: 2, missing: [], stale: [], complete: true })
  })

  it('fails closed when the translation was recorded against older claims', () => {
    revisionByPath.set('/es/hierbas/example/', 'revision-from-before-the-claims-changed')
    const localized = translation({ 'approved-1': 'uno', 'approved-2': 'dos' })

    const coverage = profileTranslationCoverage(canonical, localized)
    expect(coverage.missing).toEqual([])
    expect(coverage.revisionCurrent).toBe(false)
    expect(coverage.complete).toBe(false)
    expect(() => assertCompleteProfileTranslation(canonical, localized)).toThrow(/revision=stale/)
  })

  it('fails closed when no revision was ever recorded for the translation', () => {
    revisionByPath.clear()
    const localized = translation({ 'approved-1': 'uno', 'approved-2': 'dos' })

    expect(profileTranslationCoverage(canonical, localized).complete).toBe(false)
    expect(() => assertCompleteProfileTranslation(canonical, localized)).toThrow(/revision=stale:missing/)
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

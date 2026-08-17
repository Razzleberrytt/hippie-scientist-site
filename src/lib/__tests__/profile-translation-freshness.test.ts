import { describe, expect, it } from 'vitest'

import { getCompoundProfileTranslation } from '../compound-profile-translations'
import {
  assertCompleteProfileTranslation,
  loadCanonicalLocalizedProfile,
  profileTranslationCoverage,
} from '../localized-profile'
import { getProfileTranslation } from '../profile-translations'

describe('localized profile translation freshness', () => {
  it('accepts the reviewed canonical herb claim revision', () => {
    const canonical = loadCanonicalLocalizedProfile('herb', 'ashwagandha')
    const translation = getProfileTranslation('es', 'herb', 'ashwagandha')
    expect(translation).not.toBeNull()
    expect(() => assertCompleteProfileTranslation(canonical, translation!)).not.toThrow()
    expect(profileTranslationCoverage(canonical, translation!).revisionCurrent).toBe(true)
  })

  it('accepts complete compound translations pinned to the canonical claim revision', () => {
    const canonical = loadCanonicalLocalizedProfile('compound', 'l-theanine')
    for (const locale of ['es', 'pt-BR', 'fr', 'de'] as const) {
      const translation = getCompoundProfileTranslation(locale, 'l-theanine')
      expect(translation).not.toBeNull()
      expect(() => assertCompleteProfileTranslation(canonical, translation!)).not.toThrow()
      const coverage = profileTranslationCoverage(canonical, translation!)
      expect(coverage.approvedClaims).toBe(6)
      expect(coverage.translatedClaims).toBe(6)
      expect(coverage.revisionCurrent).toBe(true)
    }
  })

  it('rejects changed canonical wording even when the claim id is unchanged', () => {
    const canonical = loadCanonicalLocalizedProfile('herb', 'ashwagandha')
    const translation = getProfileTranslation('es', 'herb', 'ashwagandha')
    expect(translation).not.toBeNull()

    const changed = {
      ...canonical,
      claimMap: canonical.claimMap?.map((claim, index) =>
        index === 0 ? { ...claim, claim: `${claim.claim} Materially revised.` } : claim,
      ),
    }

    const coverage = profileTranslationCoverage(changed, translation!)
    expect(coverage.missing).toEqual([])
    expect(coverage.stale).toEqual([])
    expect(coverage.revisionCurrent).toBe(false)
    expect(() => assertCompleteProfileTranslation(changed, translation!)).toThrow(/revision=stale/)
  })
})

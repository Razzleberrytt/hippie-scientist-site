import { describe, expect, it } from 'vitest'
import {
  buildLosslessAccessibilityDescriptionContract,
  validateLosslessAccessibilityDescriptionContract,
} from '../creative-accessibility-description-contract.mjs'
import { buildLosslessCreativeSpec } from '../creative-spec-lossless.mjs'

const fixture = {
  id: 'accessibility-test-object',
  title: 'Ashwagandha and stress: what the evidence actually shows',
  finding: 'Human trials report modest improvements in some stress measures, but effects vary by outcome, extract, dose, study population, and trial design, so the result should be presented as qualified evidence rather than a universal treatment effect for every person or every stress-related symptom.',
  evidenceType: 'randomized controlled trials',
  evidenceGrade: 'B',
  limitation: 'Studies are generally small, use different extracts and outcome measures, and often have short follow-up periods, which limits confidence about long-term effectiveness and makes direct comparison across products or populations uncertain.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
}

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

describe('lossless accessibility description contract', () => {
  it('segments long accessibility copy without dropping governed finding, limitation, grade, or source', () => {
    const contract = buildLosslessAccessibilityDescriptionContract(fixture, { maxSegmentChars: 300 })
    const reconstructed = clean(contract.segments.map((segment) => segment.text).join(' '))

    expect(validateLosslessAccessibilityDescriptionContract(contract, fixture)).toEqual([])
    expect(contract.segments.length).toBeGreaterThan(1)
    expect(contract.segments.every((segment) => segment.characterCount <= 300)).toBe(true)
    expect(reconstructed).toBe(clean(contract.fullText))
    expect(contract.fullText).toContain(fixture.finding)
    expect(contract.fullText).toContain(fixture.limitation)
    expect(contract.fullText).toContain(`grade ${fixture.evidenceGrade}`)
    expect(contract.fullText).toContain(fixture.sourceUrl)
    expect(contract.segmentBudget.truncationAllowed).toBe(false)
    expect(contract.segmentBudget.ellipsisAllowed).toBe(false)
    expect(contract.segmentBudget.paraphraseAllowed).toBe(false)
    expect(contract.platformPolicy.publishOnlyIfFullDescriptionCanBeRepresentedLosslessly).toBe(true)
  })

  it('replaces the legacy truncated carousel alt text in the lossless creative spec', () => {
    const spec = buildLosslessCreativeSpec(fixture)

    expect(spec.version).toBe(13)
    expect(spec.carousel.accessibility.altText).toBe(spec.accessibilityDescription.fullText)
    expect(spec.carousel.accessibility.altText.length).toBeGreaterThan(300)
    expect(spec.carousel.accessibility.truncatedAltTextForbidden).toBe(true)
    expect(spec.carousel.rendererContract.accessibilityDescriptionMayNotTruncateOrParaphrase).toBe(true)
    expect(spec.delivery.accessibilityDescriptionContract.fullTextSha256).toBe(spec.accessibilityDescription.fullTextSha256)
    expect(spec.guardrails.accessibilityDescriptionTruncationForbidden).toBe(true)
    expect(spec.guardrails.accessibilityDescriptionMustPreserveLimitationAndSource).toBe(true)
    expect(spec.visualRegression.fingerprintInput.carousel.accessibilityDescription.losslessRequired).toBe(true)
    expect(spec.visualRegression.fingerprintInput.delivery.accessibilityDescriptionFailClosed).toBe(true)
  })

  it('fails closed instead of slicing an indivisible accessibility token', () => {
    expect(() => buildLosslessAccessibilityDescriptionContract({
      ...fixture,
      title: 'x'.repeat(301),
    }, { maxSegmentChars: 300 })).toThrow(/indivisible token/)
  })
})

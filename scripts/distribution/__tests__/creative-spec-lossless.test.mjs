import { describe, expect, it } from 'vitest'
import { buildLosslessCreativeSpec } from '../creative-spec-lossless.mjs'
import { CREATIVE_BRAND_TOKENS } from '../creative-spec.mjs'

const fixture = {
  id: 'lossless-test-object',
  title: 'Ashwagandha and stress: what the evidence actually shows',
  finding: 'Human trials report modest improvements in some stress measures, but effects vary by outcome, extract, dose, study population, and trial design, so the result should be presented as qualified evidence rather than a universal treatment effect for every person or every stress-related symptom.',
  evidenceType: 'randomized controlled trials',
  evidenceGrade: 'B',
  limitation: 'Studies are generally small, use different extracts and outcome measures, and often have short follow-up periods, which limits confidence about long-term effectiveness and makes direct comparison across products or populations uncertain.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
}

const normalizedSentence = (value) => {
  const text = String(value).trim().replace(/\s+/g, ' ')
  return /[.!?]$/.test(text) ? text : `${text}.`
}

describe('lossless creative presentation adapter', () => {
  it('expands long governed copy into ordered cited continuation slides without ellipsis', () => {
    const spec = buildLosslessCreativeSpec(fixture)
    const findings = spec.carousel.slides.filter((slide) => slide.role === 'finding')
    const limitations = spec.carousel.slides.filter((slide) => slide.role === 'limitation')

    expect(spec.version).toBe(5)
    expect(findings.length).toBeGreaterThan(1)
    expect(limitations.length).toBeGreaterThan(1)
    expect(findings.every((slide) => slide.citationRequired && slide.truncationAllowed === false)).toBe(true)
    expect(limitations.every((slide) => slide.citationRequired && slide.rewriteAllowed === false)).toBe(true)
    expect(findings.every((slide) => slide.headline.length <= CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)).toBe(true)
    expect(limitations.every((slide) => slide.headline.length <= CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)).toBe(true)
    expect(findings.map((slide) => slide.headline).join(' ')).toBe(normalizedSentence(fixture.finding))
    expect(limitations.map((slide) => slide.headline).join(' ')).toBe(normalizedSentence(fixture.limitation))
    expect(findings.some((slide) => slide.headline.includes('…'))).toBe(false)
    expect(limitations.some((slide) => slide.headline.includes('…'))).toBe(false)
  })

  it('carries the same lossless factual plan into vertical-video renderer requirements', () => {
    const spec = buildLosslessCreativeSpec(fixture)
    expect(spec.verticalVideo.losslessCopy.finding.integrity.exactNormalizedMatch).toBe(true)
    expect(spec.verticalVideo.losslessCopy.limitation.integrity.exactNormalizedMatch).toBe(true)
    expect(spec.verticalVideo.rendererContract.factualScenesMustBeDerivedFromLosslessCopyPlan).toBe(true)
    expect(spec.verticalVideo.rendererContract.legacyTruncatedFactualScenesMayNotBePublishedWhenContinuationIsRequired).toBe(true)
    expect(spec.guardrails.losslessGovernedCopyRequired).toBe(true)
    expect(spec.guardrails.continuationPagesMayNotBeDropped).toBe(true)
  })

  it('fails closed when governed copy cannot fit the lossless page budget', () => {
    const indivisible = 'x'.repeat(CREATIVE_BRAND_TOKENS.typography.bodyMaxChars + 1)
    expect(() => buildLosslessCreativeSpec({ ...fixture, finding: indivisible })).toThrow(/cannot fit losslessly/)
  })
})

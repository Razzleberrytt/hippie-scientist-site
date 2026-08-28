import { describe, expect, it } from 'vitest'
import { buildLosslessCreativeSpec } from '../creative-spec-lossless.mjs'
import { CREATIVE_BRAND_TOKENS } from '../creative-spec.mjs'
import { buildCtaContract } from '../creative-cta-contract.mjs'

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

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

describe('lossless creative presentation adapter', () => {
  it('expands long governed copy into ordered cited continuation slides without ellipsis', () => {
    const spec = buildLosslessCreativeSpec(fixture)
    const findings = spec.carousel.slides.filter((slide) => slide.role === 'finding')
    const limitations = spec.carousel.slides.filter((slide) => slide.role === 'limitation')

    expect(spec.version).toBe(11)
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

  it('renders deterministic captions without dropping or adding ellipses to scene voiceover', () => {
    const spec = buildLosslessCreativeSpec(fixture)
    const captions = spec.verticalVideo.captions

    expect(captions.minimumPxAt1080).toBeGreaterThanOrEqual(44)
    expect(captions.maxCharsPerLine).toBeLessThanOrEqual(42)
    expect(captions.maxLines).toBeLessThanOrEqual(2)
    expect(captions.truncationAllowed).toBe(false)
    expect(captions.ellipsisAllowed).toBe(false)
    expect(captions.mustFitPlatformSafeArea).toBe(true)
    expect(captions.cues.every((cue) => cue.text.split('\n').length <= 2)).toBe(true)
    expect(captions.cues.every((cue) => cue.text.split('\n').every((line) => line.length <= 42))).toBe(true)

    for (const [index, scene] of spec.verticalVideo.scenes.entries()) {
      const sceneCues = captions.cues.filter((cue) => cue.sceneIndex === index + 1)
      const reconstructed = clean(sceneCues.map((cue) => cue.text.replace(/\n/g, ' ')).join(' '))
      expect(reconstructed).toBe(clean(scene.voiceover))
      expect(sceneCues.every((cue) => clean(cue.sourceVoiceover) === clean(scene.voiceover))).toBe(true)
    }

    expect(spec.verticalVideo.rendererContract.captionsMustSatisfyLosslessContract).toBe(true)
    expect(spec.guardrails.captionTruncationForbidden).toBe(true)
    expect(spec.guardrails.captionVoiceoverReconstructionRequired).toBe(true)
  })

  it('binds source cards and video source scenes to an explicit mobile-legibility contract', () => {
    const spec = buildLosslessCreativeSpec(fixture)
    const sourceSlide = spec.carousel.slides.find((slide) => slide.role === 'source')

    expect(sourceSlide.body).toBe(fixture.sourceUrl)
    expect(spec.carousel.sourceLegibility.canonicalUrl).toBe(fixture.sourceUrl)
    expect(spec.carousel.sourceLegibility.typography.minimumPxAt1080).toBeGreaterThanOrEqual(32)
    expect(spec.carousel.sourceLegibility.typography.ellipsisAllowed).toBe(false)
    expect(spec.carousel.sourceLegibility.placement.safeAreaRequired).toBe(true)
    expect(spec.carousel.rendererContract.sourceCardMustSatisfyLegibilityContract).toBe(true)
    expect(spec.verticalVideo.rendererContract.dedicatedSourceSceneRequired).toBe(true)
    expect(spec.verticalVideo.rendererContract.sourceSceneMinimumVisibleSeconds).toBeGreaterThanOrEqual(3)
    expect(spec.guardrails.sourceUrlMayNotBeTruncatedOrRewritten).toBe(true)
  })

  it('requires a readable trust-safe hook throughout the first two seconds', () => {
    const spec = buildLosslessCreativeSpec(fixture)
    expect(spec.verticalVideo.hook.text).toBe(fixture.title)
    expect(spec.verticalVideo.hook.timing.startSeconds).toBe(0)
    expect(spec.verticalVideo.hook.timing.endSeconds).toBe(2)
    expect(spec.verticalVideo.hook.typography.minimumPxAt1080).toBeGreaterThanOrEqual(56)
    expect(spec.verticalVideo.hook.placement.safeAreaRequired).toBe(true)
    expect(spec.verticalVideo.hook.trust.ctaAllowedDuringHook).toBe(false)
    expect(spec.verticalVideo.rendererContract.firstTwoSecondsMustSatisfyHookContract).toBe(true)
    expect(spec.guardrails.unsupportedHookCertaintyForbidden).toBe(true)
  })

  it('creates stable crop-safe thumbnail variants without changing governed hook text', () => {
    const spec = buildLosslessCreativeSpec(fixture)
    const thumbnails = spec.thumbnails

    expect(thumbnails.master).toEqual({ width: 1080, height: 1920, format: '9:16' })
    expect(thumbnails.cropResilience.requiredCrops).toEqual(expect.arrayContaining(['4:5', '1:1']))
    expect(thumbnails.typography.minimumHeadlinePxAt1080).toBeGreaterThanOrEqual(64)
    expect(thumbnails.typography.rewriteAllowed).toBe(false)
    expect(thumbnails.typography.truncationAllowed).toBe(false)
    expect(thumbnails.trust.ctaAllowed).toBe(false)
    expect(thumbnails.variants).toHaveLength(3)
    expect(new Set(thumbnails.variants.map((variant) => variant.id)).size).toBe(3)
    expect(thumbnails.variants.every((variant) => variant.headline === fixture.title)).toBe(true)
    expect(thumbnails.variants.every((variant) => variant.ctaAllowed === false)).toBe(true)
    expect(spec.verticalVideo.rendererContract.thumbnailVariantsMayVaryCompositionOnly).toBe(true)
    expect(spec.guardrails.thumbnailHookRewriteForbidden).toBe(true)
    expect(spec.guardrails.thumbnailCropResilienceRequired).toBe(true)
  })

  it('produces a stable deterministic visual-regression fingerprint over layout-critical contracts', () => {
    const first = buildLosslessCreativeSpec(fixture)
    const second = buildLosslessCreativeSpec({ ...fixture })

    expect(first.visualRegression.version).toBe(1)
    expect(first.visualRegression.algorithm).toBe('sha256')
    expect(first.visualRegression.fingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(second.visualRegression.fingerprint).toBe(first.visualRegression.fingerprint)
    expect(first.carousel.visualRegressionFingerprint).toBe(first.visualRegression.fingerprint)
    expect(first.verticalVideo.visualRegressionFingerprint).toBe(first.visualRegression.fingerprint)
    expect(first.delivery.visualRegressionContract.fingerprint).toBe(first.visualRegression.fingerprint)
    expect(first.visualRegression.fingerprintInput.carousel.sourceMinimumPxAt1080).toBeGreaterThanOrEqual(32)
    expect(first.visualRegression.fingerprintInput.verticalVideo.hook.minimumPxAt1080).toBeGreaterThanOrEqual(56)
    expect(first.visualRegression.fingerprintInput.verticalVideo.captions.minimumPxAt1080).toBeGreaterThanOrEqual(44)
    expect(first.visualRegression.fingerprintInput.thumbnails.requiredCrops).toEqual(expect.arrayContaining(['4:5', '1:1']))
    expect(first.visualRegression.excludesGenerativeImageryAsAuthority).toBe(true)
    expect(first.guardrails.visualRegressionDriftRequiresExplicitReview).toBe(true)
  })

  it('binds the CTA to the canonical evidence destination and final three-second window', () => {
    const spec = buildLosslessCreativeSpec(fixture)
    expect(spec.delivery.ctaContract.text).toBe('Read the evidence')
    expect(spec.delivery.ctaContract.destination.landingUrl).toBe(fixture.sourceUrl)
    expect(spec.delivery.ctaContract.destination.canonicalSourceUrl).toBe(fixture.sourceUrl)
    expect(spec.delivery.ctaContract.destination.exactMatchRequired).toBe(true)
    expect(spec.verticalVideo.cta.timing.startSeconds).toBe(27)
    expect(spec.verticalVideo.cta.timing.endSeconds).toBe(30)
    expect(spec.verticalVideo.cta.typography.minimumPxAt1080).toBeGreaterThanOrEqual(44)
    expect(spec.verticalVideo.cta.placement.safeAreaRequired).toBe(true)
    expect(spec.verticalVideo.cta.placement.sourceMayNotBeCovered).toBe(true)
    expect(spec.verticalVideo.cta.placement.disclosureMayNotBeCovered).toBe(true)
    expect(spec.verticalVideo.rendererContract.finalThreeSecondsMustSatisfyCtaContract).toBe(true)
    expect(spec.guardrails.manipulativeCtaUrgencyForbidden).toBe(true)
  })

  it('rejects CTA urgency and canonical-destination drift', () => {
    const platformSafeArea = { instagramReels: { x: 96, y: 220, width: 804, height: 1360 } }
    expect(() => buildCtaContract({
      ctaText: 'Act now — click now',
      landingUrl: fixture.sourceUrl,
      sourceUrl: fixture.sourceUrl,
      platformSafeArea,
    })).toThrow(/manipulative urgency/)
    expect(() => buildCtaContract({
      ctaText: 'Read the evidence',
      landingUrl: 'https://thehippiescientist.net/',
      sourceUrl: fixture.sourceUrl,
      platformSafeArea,
    })).toThrow(/exactly match the canonical evidence source URL/)
  })

  it('rejects hook language that visually or verbally overstates the evidence', () => {
    expect(() => buildLosslessCreativeSpec({ ...fixture, title: 'The proven best cure for stress' })).toThrow(/unsupported certainty or superiority/)
  })

  it('fails closed when governed copy cannot fit the lossless page budget', () => {
    const indivisible = 'x'.repeat(CREATIVE_BRAND_TOKENS.typography.bodyMaxChars + 1)
    expect(() => buildLosslessCreativeSpec({ ...fixture, finding: indivisible })).toThrow(/cannot fit losslessly/)
  })
})
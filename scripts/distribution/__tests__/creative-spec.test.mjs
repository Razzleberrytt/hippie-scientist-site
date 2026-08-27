import { describe, expect, it } from 'vitest'
import {
  buildCreativeSpec,
  CREATIVE_BRAND_TOKENS,
  getContrastRatio,
  validateCreativeContrast,
  validateCreativeInput,
  validatePlatformSafeZones,
} from '../creative-spec.mjs'

const fixture = {
  id: 'test-object',
  title: 'Ashwagandha and stress: what the evidence actually shows',
  finding: 'Human trials report modest improvements in some stress measures',
  evidenceType: 'randomized controlled trials',
  evidenceGrade: 'B',
  limitation: 'Studies are small and use different extracts and outcome measures',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
}

describe('creative distribution spec', () => {
  it('builds a 30-second safe-area-aware vertical video package', () => {
    const spec = buildCreativeSpec(fixture)
    expect(spec.verticalVideo.durationSeconds).toBe(30)
    expect(spec.verticalVideo.scenes[0]).toMatchObject({ start: 0, end: 2, role: 'hook' })
    expect(spec.verticalVideo.scenes.at(-1)?.end).toBe(30)
    expect(spec.verticalVideo.canvas.safeTop).toBeGreaterThan(0)
    expect(spec.verticalVideo.canvas.safeBottom).toBeGreaterThan(0)
    expect(spec.verticalVideo.captions.minimumPxAt1080).toBeGreaterThanOrEqual(44)
  })

  it('keeps carousel factual cards citation-bound and disclosure visible', () => {
    const spec = buildCreativeSpec(fixture)
    const factualSlides = spec.carousel.slides.filter((slide) => ['finding', 'limitation', 'source'].includes(slide.role))
    expect(factualSlides.every((slide) => slide.citationRequired)).toBe(true)
    expect(spec.brandTokens.treatment.disclosure).toMatch(/evidence summary/i)
    expect(spec.guardrails.generativeMediaIsNeverFactualAuthority).toBe(true)
    expect(spec.guardrails.noHiddenDisclosure).toBe(true)
  })

  it('enforces bounded copy for crop resilience and caption readability', () => {
    const spec = buildCreativeSpec({ ...fixture, title: 'A '.repeat(100), finding: 'Evidence '.repeat(100) })
    expect(spec.verticalVideo.firstTwoSecondHook.length).toBeLessThanOrEqual(CREATIVE_BRAND_TOKENS.typography.hookMaxChars)
    expect(spec.carousel.slides[1].headline.length).toBeLessThanOrEqual(CREATIVE_BRAND_TOKENS.typography.bodyMaxChars)
    expect(spec.verticalVideo.captions.maxCharsPerLine).toBeLessThanOrEqual(42)
    expect(spec.verticalVideo.captions.maxLines).toBe(2)
    expect(spec.carousel.accessibility.altText.length).toBeLessThanOrEqual(CREATIVE_BRAND_TOKENS.typography.altTextMaxChars)
    for (const cue of spec.verticalVideo.captions.cues) {
      expect(cue.text.split('\n').length).toBeLessThanOrEqual(CREATIVE_BRAND_TOKENS.typography.captionMaxLines)
      expect(cue.text.split('\n').every((line) => line.length <= CREATIVE_BRAND_TOKENS.typography.captionMaxCharsPerLine)).toBe(true)
    }
  })

  it('emits deterministic caption cues, SRT, transcript, and canonical CTA delivery metadata', () => {
    const spec = buildCreativeSpec(fixture)
    expect(spec.version).toBe(4)
    expect(spec.delivery.landingUrl).toBe(fixture.sourceUrl)
    expect(spec.delivery.exportProfiles.map((profile) => profile.id)).toEqual([
      'vertical-video',
      'portrait-carousel',
      'square-social',
      'pinterest',
    ])
    expect(spec.verticalVideo.captions.cues).toHaveLength(spec.verticalVideo.scenes.length)
    expect(spec.verticalVideo.captions.srt).toContain('00:00:00,000 --> 00:00:02,000')
    expect(spec.verticalVideo.captions.srt).toContain(spec.verticalVideo.captions.cues[0].text)
    expect(spec.verticalVideo.accessibility.transcript).toContain('Read the full evidence and source trail.')
    expect(spec.verticalVideo.accessibility.captionsRequired).toBe(true)
    expect(spec.thumbnailVariants.every((variant) => variant.landingUrl === fixture.sourceUrl)).toBe(true)
    expect(spec.guardrails.socialClickDestinationMustMatchCanonicalSource).toBe(true)
  })

  it('ships platform-specific safe areas for TikTok, Reels, Shorts, feed, square, and Pinterest', () => {
    const spec = buildCreativeSpec(fixture)
    expect(validatePlatformSafeZones()).toEqual([])
    expect(Object.keys(spec.delivery.platformSafeAreas)).toEqual([
      'tiktok',
      'instagramReels',
      'youtubeShorts',
      'instagramFeed',
      'squareSocial',
      'pinterest',
    ])
    expect(spec.verticalVideo.platformSafeAreas.tiktok.exclusions.right).toBeGreaterThan(CREATIVE_BRAND_TOKENS.canvas.vertical.safeSide)
    expect(spec.verticalVideo.platformSafeAreas.instagramReels.exclusions.bottom).toBeGreaterThanOrEqual(CREATIVE_BRAND_TOKENS.canvas.vertical.safeBottom)
    expect(spec.carousel.accessibility.platformSafeArea.format).toBe('portrait')
    expect(spec.verticalVideo.captions.mustFitPlatformSafeArea).toBe(true)
    expect(spec.guardrails.deterministicPlatformSafeAreas).toBe(true)
    expect(spec.guardrails.factualUiMustStayInsidePlatformSafeArea).toBe(true)
    expect(spec.experimentContract.immutableFields).toContain('platform-safe-area')
  })

  it('fails closed when a platform safe zone is smaller than canonical margins or consumes the canvas', () => {
    expect(validatePlatformSafeZones({
      unsafePlatform: { format: 'vertical', top: 0, bottom: 320, left: 96, right: 96 },
    })).toEqual(expect.arrayContaining([
      expect.stringContaining('unsafePlatform.top is smaller'),
    ]))
    expect(validatePlatformSafeZones({
      unsafePlatform: { format: 'square', top: 600, bottom: 600, left: 80, right: 80 },
    })).toEqual(expect.arrayContaining([
      'unsafePlatform vertical safe-zone exclusions consume the canvas',
    ]))
  })

  it('ships a deterministic accessible palette and semantic color treatments', () => {
    const spec = buildCreativeSpec(fixture)
    const { color } = CREATIVE_BRAND_TOKENS
    expect(validateCreativeContrast()).toEqual([])
    expect(color.minimumTextContrast).toBeGreaterThanOrEqual(4.5)
    expect(color.decorativeOnly).toContain('terracotta')
    expect(spec.delivery.colorPolicy.rendererMustUseApprovedTreatment).toBe(true)
    expect(spec.guardrails.deterministicAccessibleColorSystem).toBe(true)
    expect(spec.guardrails.allTextTreatmentsMeetWcagAaContrast).toBe(true)

    for (const treatment of Object.values(color.treatments)) {
      const foreground = color.palette[treatment.foreground]
      const background = color.palette[treatment.background]
      expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(color.minimumTextContrast)
    }

    for (const slide of spec.carousel.slides) {
      expect(spec.delivery.colorPolicy.approvedTreatments).toContain(slide.colorTreatment)
    }
    for (const scene of spec.verticalVideo.scenes) {
      expect(spec.delivery.colorPolicy.approvedTreatments).toContain(scene.colorTreatment)
    }
    expect(spec.delivery.colorPolicy.approvedTreatments).toContain(spec.verticalVideo.captions.colorTreatment)
  })

  it('fails closed when an approved semantic treatment loses accessible contrast', () => {
    const unsafe = {
      ...CREATIVE_BRAND_TOKENS.color,
      palette: { ...CREATIVE_BRAND_TOKENS.color.palette, ink: '#777777', parchment: '#888888' },
      treatments: {
        ...CREATIVE_BRAND_TOKENS.color.treatments,
        primaryLight: { foreground: 'ink', background: 'parchment' },
      },
    }
    expect(validateCreativeContrast(unsafe)).toEqual(expect.arrayContaining([
      expect.stringMatching(/primaryLight contrast .* below 4\.5:1/),
    ]))
  })

  it('keeps creative experiments away from scientific truth and accessibility threshold fields', () => {
    const spec = buildCreativeSpec(fixture)
    expect(spec.experimentContract.mutableFields).toContain('hook-layout')
    expect(spec.experimentContract.mutableFields).not.toContain('factual-text')
    expect(spec.experimentContract.immutableFields).toEqual(expect.arrayContaining([
      'factual-text',
      'evidence-grade',
      'limitation',
      'source-url',
      'disclosure',
      'cta-destination',
      'minimum-contrast-threshold',
      'platform-safe-area',
    ]))
    expect(spec.experimentContract.primaryMetric).toBe('qualified-social-to-site-clickthrough')
    expect(spec.experimentContract.guardrailMetrics).toContain('creative-contrast-pass-rate')
    expect(spec.experimentContract.guardrailMetrics).toContain('creative-safe-area-pass-rate')
  })

  it('fails closed on missing provenance, homepage/external URLs, or invented grades', () => {
    expect(validateCreativeInput({ ...fixture, sourceUrl: 'https://example.com/study' })).toContain('sourceUrl must be a canonical Hippie Scientist evidence page, never the homepage')
    expect(validateCreativeInput({ ...fixture, sourceUrl: 'https://thehippiescientist.net/' })).toContain('sourceUrl must be a canonical Hippie Scientist evidence page, never the homepage')
    expect(validateCreativeInput({ ...fixture, evidenceGrade: 'NOT-A-GRADE' })).toContain('evidenceGrade must use the governed distribution vocabulary')
    expect(() => buildCreativeSpec({ ...fixture, limitation: '' })).toThrow(/limitation is required/)
  })
})

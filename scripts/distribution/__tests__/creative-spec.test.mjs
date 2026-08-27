import { describe, expect, it } from 'vitest'
import { buildCreativeSpec, CREATIVE_BRAND_TOKENS, validateCreativeInput } from '../creative-spec.mjs'

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
  })

  it('fails closed on missing provenance or external source URLs', () => {
    expect(validateCreativeInput({ ...fixture, sourceUrl: 'https://example.com/study' })).toContain('sourceUrl must be a canonical Hippie Scientist URL')
    expect(() => buildCreativeSpec({ ...fixture, limitation: '' })).toThrow(/limitation is required/)
  })
})

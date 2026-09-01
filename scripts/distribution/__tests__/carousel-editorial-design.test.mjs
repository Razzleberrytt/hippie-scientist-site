import { describe, expect, it } from 'vitest'
import { CREATIVE_BRAND_TOKENS } from '../creative-spec.mjs'
import { renderCarouselSlideSvg } from '../render-carousel-svg.mjs'

const options = {
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  contentHash: 'a'.repeat(64),
  disclosure: CREATIVE_BRAND_TOKENS.treatment.disclosure,
}

describe('editorial carousel presentation', () => {
  it('gives hook cards a branded hierarchy and feed-native swipe cue without changing the hook', () => {
    const headline = 'Does Ashwagandha hold up in human studies?'
    const rendered = renderCarouselSlideSvg({
      role: 'hook',
      eyebrow: 'Human evidence',
      headline,
      body: null,
      colorTreatment: 'primaryDark',
    }, options)

    expect(rendered.svg).toContain('THE HIPPIE SCIENTIST')
    expect(rendered.svg).toContain('SWIPE FOR THE EVIDENCE →')
    expect(rendered.svg).toContain(headline)
    expect(rendered.svg).toContain('carousel-editorial-v2')
    expect(rendered.svg).toContain(CREATIVE_BRAND_TOKENS.color.palette.terracotta)
  })

  it('keeps factual cards free of the hook-only swipe cue', () => {
    const rendered = renderCarouselSlideSvg({
      role: 'finding',
      eyebrow: 'What the evidence says',
      headline: 'A governed finding remains unchanged.',
      body: null,
      colorTreatment: 'evidence',
    }, options)

    expect(rendered.svg).not.toContain('SWIPE FOR THE EVIDENCE →')
    expect(rendered.svg).toContain('A governed finding remains unchanged.')
  })
})

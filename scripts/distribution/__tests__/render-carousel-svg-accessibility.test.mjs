import { expect, test } from 'vitest'
import { CREATIVE_BRAND_TOKENS } from '../creative-spec.mjs'
import { renderCarouselSlideSvg } from '../render-carousel-svg.mjs'

const options = {
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  contentHash: 'a'.repeat(64),
  disclosure: CREATIVE_BRAND_TOKENS.treatment.disclosure,
}

test('renders a deterministic accessible name and description for standalone social SVGs', () => {
  const rendered = renderCarouselSlideSvg({
    role: 'finding',
    eyebrow: 'What the evidence says',
    headline: 'A governed finding remains unchanged.',
    body: 'Evidence context remains visible.',
    colorTreatment: 'evidence',
  }, options)

  expect(rendered.svg).toContain('role="img" aria-labelledby="slide-title slide-desc"')
  expect(rendered.svg).toContain('<title id="slide-title">What the evidence says</title>')
  expect(rendered.svg).toContain('<desc id="slide-desc">')
  expect(rendered.svg).toContain('A governed finding remains unchanged.')
  expect(rendered.svg).toContain('Evidence context remains visible.')
  expect(rendered.svg).toContain('Educational content')
  expect(rendered.svg).toContain('Source: https://thehippiescientist.net/herbs/ashwagandha/')
})

test('escapes accessible metadata without creating a second factual rewrite', () => {
  const rendered = renderCarouselSlideSvg({
    role: 'limitation',
    eyebrow: 'Limits & uncertainty',
    headline: 'Evidence is limited <and> uncertain.',
    body: null,
    colorTreatment: 'primaryLight',
  }, options)

  expect(rendered.svg).toContain('<title id="slide-title">Limits &amp; uncertainty</title>')
  expect(rendered.svg).toContain('Evidence is limited &lt;and&gt; uncertain.')
  expect(rendered.svg).not.toContain('aria-label=')
})

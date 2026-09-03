import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
  buildSocialCardModel,
  renderSocialCardSvg,
} from '../scripts/media/build-article-social-images.mjs'

const valerian = {
  slug: 'valerian-root',
  title: 'Valerian Root for Sleep: Does It Work? Evidence Review (2026)',
  category: 'Sleep',
  evidenceGrade: 'B',
  sourceCount: 15,
}

const lionsMane = {
  slug: 'lions-mane-bdnf',
  title: "Lion's Mane, BDNF & Cognitive Resilience",
  category: 'Field Notes',
  evidenceGrade: '',
  sourceCount: 0,
}

describe('article social preview cards', () => {
  it('gives different articles different real JPEG URLs', () => {
    const valerianModel = buildSocialCardModel(valerian)
    const lionsManeModel = buildSocialCardModel(lionsMane)

    expect(valerianModel.publicPath).toBe('/media/social/articles/valerian-root.jpg')
    expect(lionsManeModel.publicPath).toBe('/media/social/articles/lions-mane-bdnf.jpg')
    expect(valerianModel.publicPath).not.toBe(lionsManeModel.publicPath)
    expect(valerianModel.sourceCount).toBe(15)
  })

  it('renders the locked 1200x630 THS card instead of the old generic artwork', () => {
    const svg = renderSocialCardSvg(valerian)
    expect(SOCIAL_CARD_WIDTH).toBe(1200)
    expect(SOCIAL_CARD_HEIGHT).toBe(630)
    expect(svg).toContain('width="1200" height="630"')
    expect(svg).toContain('THE HIPPIE SCIENTIST')
    expect(svg).toContain('Valerian Root for Sleep')
    expect(svg).toContain('15 CITED SOURCES')
    expect(svg).not.toContain('SUPPLEMENT RESEARCH FRAMEWORK')
  })

  it('keeps page metadata, Twitter metadata, and Article JSON-LD off og-default.jpg', () => {
    const page = fs.readFileSync('app/articles/[slug]/page.tsx', 'utf8')
    const layout = fs.readFileSync('app/articles/[slug]/layout.tsx', 'utf8')
    const buildArticles = fs.readFileSync('scripts/build-articles.mjs', 'utf8')

    expect(page).toContain('image: articleSocialImagePath(page.slug)')
    expect(page).toContain('image: `${SITE_URL}${articleSocialImagePath(page.slug)}`')
    expect(layout).toContain('/media/social/articles/${page.slug}.jpg')
    expect(page).not.toContain('/og-default.jpg')
    expect(layout).not.toContain('/og-default.jpg')
    expect(buildArticles).toContain('await buildArticleSocialImages()')
  })
})

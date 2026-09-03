import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  ARTICLE_SOCIAL_CARD_VERSION,
  articleSocialAssetPath,
  articleSocialCacheKey,
  articleSocialImagePath,
} from '../lib/article-social.js'
import {
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_VERSION,
  SOCIAL_CARD_WIDTH,
  buildSocialCardModel,
  renderSocialCardSvg,
} from '../scripts/media/build-article-social-images.mjs'

const valerian = {
  slug: 'valerian-root',
  title: 'Valerian Root for Sleep: Does It Work? Evidence Review (2026)',
  category: 'Sleep',
  // Deliberately present to prove unbound evidence-grade frontmatter cannot
  // become a social-distribution claim.
  evidenceGrade: 'A+',
  sourceCount: 15,
}

const lionsMane = {
  slug: 'lions-mane-bdnf',
  title: "Lion's Mane, BDNF & Cognitive Resilience",
  category: 'Field Notes',
  sourceCount: 0,
}

describe('article social preview cards', () => {
  it('gives different articles different cache-safe JPEG URLs while keeping physical assets simple', () => {
    const valerianModel = buildSocialCardModel(valerian)
    const lionsManeModel = buildSocialCardModel(lionsMane)

    expect(articleSocialAssetPath(valerian.slug)).toBe('/media/social/articles/valerian-root.jpg')
    expect(valerianModel.assetPath).toBe('/media/social/articles/valerian-root.jpg')
    expect(lionsManeModel.assetPath).toBe('/media/social/articles/lions-mane-bdnf.jpg')
    expect(valerianModel.publicPath).toMatch(/^\/media\/social\/articles\/valerian-root\.jpg\?v=\d+-[a-z0-9]+$/)
    expect(lionsManeModel.publicPath).toMatch(/^\/media\/social\/articles\/lions-mane-bdnf\.jpg\?v=\d+-[a-z0-9]+$/)
    expect(valerianModel.publicPath).not.toBe(lionsManeModel.publicPath)
    expect(valerianModel.sourceCount).toBe(15)
    expect(SOCIAL_CARD_VERSION).toBe(ARTICLE_SOCIAL_CARD_VERSION)
  })

  it('uses deterministic cache identity and invalidates when rendered presentation changes', () => {
    const stableKey = articleSocialCacheKey(valerian)
    expect(articleSocialCacheKey({ ...valerian })).toBe(stableKey)
    expect(articleSocialImagePath(valerian)).toContain(`?v=${stableKey}`)
    expect(articleSocialCacheKey({ ...valerian, title: `${valerian.title} updated` })).not.toBe(stableKey)
    expect(articleSocialCacheKey({ ...valerian, category: 'Stress' })).not.toBe(stableKey)
    expect(articleSocialCacheKey({ ...valerian, sourceCount: 16 })).not.toBe(stableKey)
  })

  it('renders the locked 1200x630 THS card with article-specific visual structure', () => {
    const svg = renderSocialCardSvg(valerian)
    expect(SOCIAL_CARD_WIDTH).toBe(1200)
    expect(SOCIAL_CARD_HEIGHT).toBe(630)
    expect(svg).toContain('width="1200" height="630"')
    expect(svg).toContain('THE HIPPIE SCIENTIST')
    expect(svg).toContain('RESEARCH • SOURCES • CONTEXT')
    expect(svg).toContain('Valerian Root for Sleep')
    expect(svg).toContain('15 CITED SOURCES')
    expect(svg).toContain('ARTICLE SIGNAL')
    expect(svg).not.toContain('SUPPLEMENT RESEARCH FRAMEWORK')
  })

  it('escapes XML-sensitive title and category text before it reaches the SVG', () => {
    const svg = renderSocialCardSvg({
      slug: 'special-characters',
      title: 'A & B < C > D "quoted" \'apostrophe\'',
      category: 'Sleep & Stress',
      sourceCount: 3,
    })

    expect(svg).toContain('A &amp; B &lt; C &gt; D')
    expect(svg).toContain('&quot;quoted&quot;')
    expect(svg).toContain('&apos;apostrophe&apos;')
    expect(svg).toContain('SLEEP &amp; STRESS')
    expect(svg).not.toContain('A & B < C > D')
  })

  it('contains very long titles inside the three-line card contract', () => {
    const svg = renderSocialCardSvg({
      slug: 'very-long-title',
      title: 'A Very Long Article Title About Botanical Research Methods, Human Evidence, Historical Context, Safety Boundaries, Mechanisms, Extraction Details, and Practical Interpretation for Curious Readers',
      category: 'Evidence Review',
      sourceCount: 21,
    })

    const headlineLines = [...svg.matchAll(/<text x="94" y="\d+" font-family="Georgia,[\s\S]*?<\/text>/g)]
    expect(headlineLines.length).toBeLessThanOrEqual(3)
    expect(svg).toContain('…')
  })

  it('does not promote unbound evidence-grade frontmatter onto social cards', () => {
    const model = buildSocialCardModel(valerian)
    const svg = renderSocialCardSvg(valerian)

    expect(model).not.toHaveProperty('evidenceGrade')
    expect(svg).not.toContain('EVIDENCE A+')
  })

  it('keeps page metadata, Twitter metadata, and Article JSON-LD on one cache-keyed image authority', () => {
    const page = fs.readFileSync('app/articles/[slug]/page.tsx', 'utf8')
    const layout = fs.readFileSync('app/articles/[slug]/layout.tsx', 'utf8')
    const generator = fs.readFileSync('scripts/media/build-article-social-images.mjs', 'utf8')
    const buildArticles = fs.readFileSync('scripts/build-articles.mjs', 'utf8')

    expect(page).toContain("from '@/lib/article-social'")
    expect(page).toContain('image: socialImage')
    expect(page).toContain("'@type': 'ImageObject'")
    expect(page).toContain('url: socialImageUrl')
    expect(page).toContain('thumbnailUrl: socialImageUrl')
    expect(page).toContain('ARTICLE_SOCIAL_CARD_WIDTH')
    expect(page).toContain('ARTICLE_SOCIAL_CARD_HEIGHT')
    expect(layout).not.toContain('generateMetadata')
    expect(layout).not.toContain('twitter')
    expect(page).not.toContain('/og-default.jpg')
    expect(layout).not.toContain('/og-default.jpg')
    expect(generator).toContain("createHash('sha256')")
    expect(generator).toContain('uniqueDigestCount')
    expect(generator).toContain('cacheKey')
    expect(generator).toContain('bytes')
    expect(buildArticles).toContain('await buildArticleSocialImages()')
  })
})

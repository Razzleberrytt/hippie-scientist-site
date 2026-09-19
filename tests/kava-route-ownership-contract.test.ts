import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (...parts: string[]) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8')

const article = read('content', 'articles', 'kava.md')
const guide = read('app', 'guides', 'herbs', 'kava', 'page.tsx')
const articleTemplate = read('app', 'articles', '[slug]', 'page.tsx')
const herbTemplate = read('app', 'herbs', '[slug]', 'page.tsx')
const deprecatedHerbs = read('lib', 'deprecated-herb-canonicals.ts')
const redirects = read('public', '_redirects')
const linkEngine = read('scripts', 'data', 'build-internal-link-engine.mjs')
const sitemap = read('app', 'sitemap.ts')

describe('Kava route ownership contract', () => {
  it('keeps three distinct live reader jobs instead of consolidating the citation winner', () => {
    expect(article).toContain('Kava for Anxiety: Does It Work for Social Anxiety?')
    expect(article).toContain('social anxiety and kava drinks versus studied extracts')
    expect(article).toContain('[Kava evidence and safety guide](/guides/herbs/kava/)')
    expect(article).toContain('[Kava monograph](/herbs/kava/)')

    expect(guide).toContain("const ROUTE = `/guides/herbs/${SLUG}`")
    expect(guide).toContain('This page is the broad clinical-evidence and liver-risk guide.')
    expect(guide).toContain('href="/articles/kava/"')
    expect(guide).toContain('href="/herbs/kava/"')
  })

  it('keeps article, guide, and monograph canonical ownership self-directed', () => {
    expect(articleTemplate).toContain('path: `/articles/${page.slug}/`')
    expect(guide).toContain('path: ROUTE')
    expect(guide).toContain('pageUrl={PAGE_URL}')
    expect(herbTemplate).toContain("generateDetailMetadata({ ...herb, slug: aliasCanonicalSlug ?? canonicalSlug }, 'herb')")
    expect(deprecatedHerbs).toContain("'piper-methysticum': 'kava'")
    expect(deprecatedHerbs).not.toMatch(/^\s*['"]?kava['"]?\s*:/m)
  })

  it('preserves the legacy guide redirect without redirecting either live Kava surface', () => {
    expect(redirects).toContain('/guides/kava /guides/herbs/kava/ 301')
    expect(redirects).toContain('/guides/kava/ /guides/herbs/kava/ 301')
    expect(redirects).not.toMatch(/^\/articles\/kava\/?\s+/m)
    expect(redirects).not.toMatch(/^\/herbs\/kava\/?\s+/m)
  })

  it('routes the generated depth monograph toward the broad guide at the source of truth', () => {
    expect(linkEngine).toContain("'/herbs/kava': ['/guides/herbs/kava']")
    expect(linkEngine).toContain("'/guides/herbs/kava': ['/herbs/kava']")
    expect(linkEngine).toContain('EDITORIAL_LINK_BOOSTS[source.route]')
  })

  it('keeps all three route families eligible for sitemap ownership checks', () => {
    expect(sitemap).toContain('addRoute(`/herbs/${herb.slug}`')
    expect(sitemap).toContain('addRoute(`/articles/${article.slug}`')
    expect(sitemap).toContain("readAppGuidePageSlugs('app/guides')")
    expect(sitemap).toContain('addRoute(`/guides/${guide.slug}`')
  })

  it('does not rewrite the evidence or safety conclusion as part of discovery maintenance', () => {
    expect(article).toContain('There is not strong direct clinical evidence that kava drinks treat social anxiety disorder.')
    expect(guide).toContain('Limited and mixed. Some earlier trials were positive; the largest later GAD trial was negative.')
    expect(guide).toContain('rare but sometimes severe liver injury')
  })
})

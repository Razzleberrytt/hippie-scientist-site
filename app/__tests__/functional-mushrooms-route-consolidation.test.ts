import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const OVERRIDE = 'public/redirect-overrides/030-functional-mushrooms-canonical-2026-09-03.txt'
const CANONICAL_PAGE = 'app/guides/other/functional-mushrooms-guide/page.tsx'
const ARTICLE_ROUTE = 'app/articles/[slug]/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('functional mushrooms legacy route consolidation', () => {
  it('permanently consolidates the legacy article onto the governed guide', () => {
    const redirects = read(OVERRIDE)
    expect(redirects).toContain(
      '/articles/functional-mushrooms-guide/ /guides/other/functional-mushrooms-guide/ 301',
    )

    const canonical = read(CANONICAL_PAGE)
    expect(canonical).toContain("path: '/guides/other/functional-mushrooms-guide/'")
    expect(canonical).toContain('The Species Name Is Not Enough')
  })

  it('keeps redirected article fallbacks fail-closed for indexing', () => {
    const articleRoute = read(ARTICLE_ROUTE)
    expect(articleRoute).toContain('withRedirectSourceMetadata')
    expect(articleRoute).toContain("`/articles/${page.slug}/`")
  })
})

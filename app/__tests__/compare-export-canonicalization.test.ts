import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'scripts/seo/apply-redirect-overrides.mjs'),
  'utf8',
)

describe('comparison export canonicalization', () => {
  it('uses real comparison page directories when canonicalizing legacy comparison hrefs', () => {
    expect(source).toContain("path.join(root, 'app', 'guides', 'compare')")
    expect(source).toMatch(/builtCompareSlugs\.has\(slug\)/)
    expect(source).toContain('`/guides/compare/${slug}`')
  })

  it('sends non-built comparison hrefs to the comparison hub', () => {
    expect(source).toMatch(/return '\/guides\/compare'/)
    expect(source).toMatch(/canonicalComparisonRoute\(normalizedSource\)/)
  })
})

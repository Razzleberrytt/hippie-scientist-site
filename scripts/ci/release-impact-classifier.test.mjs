import { describe, expect, it } from 'vitest'
import { requiresFullRelease } from './release-impact-classifier.mjs'

describe('release impact classifier', () => {
  it.each([
    'scripts/data/build-runtime-from-workbook.mjs',
    'scripts/ci/validate-route-seo.mjs',
    'scripts/build-deploy.mjs',
    'app/page.tsx',
    'app/herbs/[slug]/page.tsx',
    'app/api/example/route.ts',
    'app/sitemap.ts',
    'lib/seo.ts',
    'lib/schema/graph.ts',
    'public/data/herbs.json',
    'next.config.mjs',
    'package.json',
    'package-lock.json',
  ])('treats %s as release-sensitive', (filePath) => {
    expect(requiresFullRelease([filePath])).toBe(true)
  })

  it.each([
    'components/Card.tsx',
    'src/components/ProfileHero.tsx',
    'tests/profile.test.ts',
    'docs/build-and-verification.md',
    '.github/workflows/check.yml',
    'README.md',
  ])('delegates %s to standard CI', (filePath) => {
    expect(requiresFullRelease([filePath])).toBe(false)
  })

  it('requires full release when any changed path is release-sensitive', () => {
    expect(requiresFullRelease(['docs/readme.md', 'app/compounds/page.tsx'])).toBe(true)
  })
})

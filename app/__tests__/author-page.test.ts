import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('Author page', () => {
  it('includes the updated author identity copy', () => {
    const source = readFileSync(join(process.cwd(), 'app/info/author/page.tsx'), 'utf8')

    expect(source).toContain('Willie B. Randolph III')
    expect(source).toContain('Oak Ridge, Tennessee')
    expect(source).toContain('father of two little girls')
  })

  it('keeps active bylines and schema helpers aligned with the canonical author profile', () => {
    const identityFiles = [
      'components/StructuredData.tsx',
      'components/blog/BlogPostPage.tsx',
      'lib/structured-data.ts',
      'src/lib/seo.ts',
      'app/guides/sleep/best-supplements-for-sleep/page.tsx',
      'app/guides/sleep/best-natural-sleep-aids-that-work/page.tsx',
      'app/guides/other/healthy-dipping-tobacco-alternatives/page.tsx',
      'app/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/page.tsx',
      'app/guides/anxiety/best-supplements-for-overthinking/page.tsx',
      'app/guides/anxiety/how-to-lower-cortisol-naturally/page.tsx',
      'app/guides/focus/focus-without-caffeine-crash/page.tsx',
    ]
    const sources = identityFiles
      .map((file) => readFileSync(join(process.cwd(), file), 'utf8'))
      .join('\n')

    expect(sources).not.toContain('Will Thomas')
    expect(sources).not.toContain('href="/author/"')
    expect(sources).toContain('Willie B. Randolph III')
    expect(sources).toContain('/info/author/')
  })
})

import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { COMPARE_COMBINATIONS } from '@/config/compare-combinations'
import { BUILT_COMPARE_SLUGS, isBuiltComparisonSlug } from '@/lib/comparison-utils'

describe('comparison editorial publication gate', () => {
  it('does not expose a catch-all dynamic route that could publish every configured pair', () => {
    expect(existsSync(path.join(process.cwd(), 'app/guides/compare/[slug]/page.tsx'))).toBe(false)
  })

  it('keeps candidate combinations unpublished until a real editorial route exists', () => {
    const built = new Set<string>(BUILT_COMPARE_SLUGS)
    const candidatesOnly = COMPARE_COMBINATIONS.filter((slug) => !built.has(slug))

    expect(candidatesOnly.length).toBeGreaterThan(0)
    for (const slug of candidatesOnly) {
      expect(isBuiltComparisonSlug(slug)).toBe(false)
      expect(existsSync(path.join(process.cwd(), 'app/guides/compare', slug, 'page.tsx'))).toBe(false)
    }
  })
})

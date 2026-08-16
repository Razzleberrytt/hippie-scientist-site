import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const routePaths = [
  'app/guides/timing/[slug]/page.tsx',
  'app/guides/timing/[slug]/morning-or-night/page.tsx',
  'app/guides/timing/[slug]/with-or-without-food/page.tsx',
]

describe('timing guide static-export contracts', () => {
  for (const routePath of routePaths) {
    it(`${routePath} provides a 404-safe sentinel when its governed dataset is empty`, () => {
      const source = fs.readFileSync(path.join(process.cwd(), routePath), 'utf8')
      expect(source).toContain("const EMPTY_STATIC_EXPORT_SLUG = '__static-export-empty__'")
      expect(source).toContain('return realParams.length ? realParams : [{ slug: EMPTY_STATIC_EXPORT_SLUG }]')
      expect(source).toContain("import { notFound } from 'next/navigation'")
      expect(source).toContain('if (!record) notFound()')
    })
  }
})

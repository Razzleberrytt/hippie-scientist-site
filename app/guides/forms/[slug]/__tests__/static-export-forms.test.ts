import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('forms route static-export contract', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app/guides/forms/[slug]/page.tsx'),
    'utf8',
  )

  it('provides a sentinel static param when governance yields no indexable form pages', () => {
    expect(source).toContain("const EMPTY_STATIC_EXPORT_SLUG = '__static-export-empty__'")
    expect(source).toContain('return realParams.length ? realParams : [{ slug: EMPTY_STATIC_EXPORT_SLUG }]')
  })

  it('keeps the sentinel and any unknown slug out of rendered content', () => {
    expect(source).toContain("import { notFound } from 'next/navigation'")
    expect(source).toContain('if (!record) notFound()')
  })
})

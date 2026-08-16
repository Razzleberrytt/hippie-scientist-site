import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('interaction guide static-export contracts', () => {
  it('keeps the parent interaction route buildable when governance yields no indexable records', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app/guides/interactions/[slug]/page.tsx'),
      'utf8',
    )

    expect(source).toContain("const EMPTY_STATIC_EXPORT_SLUG = '__static-export-empty__'")
    expect(source).toContain('return realParams.length ? realParams : [{ slug: EMPTY_STATIC_EXPORT_SLUG }]')
    expect(source).toContain('if (!record) notFound()')
  })

  it('keeps the medication-class route buildable when no class-specific pages survive governance', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'app/guides/interactions/[slug]/[medicationClass]/page.tsx'),
      'utf8',
    )

    expect(source).toContain("const EMPTY_STATIC_EXPORT_SLUG = '__static-export-empty__'")
    expect(source).toContain("const EMPTY_STATIC_EXPORT_MEDICATION_CLASS = '__static-export-empty__'")
    expect(source).toContain('if (!resolved) notFound()')
  })
})

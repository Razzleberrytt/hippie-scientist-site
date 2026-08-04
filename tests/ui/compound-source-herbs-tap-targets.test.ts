import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('components/seo/CompoundSourceHerbs.tsx', 'utf8')

describe('compound source herb links', () => {
  it('uses full-width accessible tap targets with visible focus treatment', () => {
    expect(source).toContain('flex min-h-11 items-center justify-between')
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('<span aria-hidden="true">→</span>')
  })
})

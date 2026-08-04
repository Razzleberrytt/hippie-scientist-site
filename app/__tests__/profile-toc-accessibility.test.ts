import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(join(process.cwd(), 'components/ui/ProfileTOC.tsx'), 'utf8')

describe('ProfileTOC accessibility contract', () => {
  it('keeps mobile controls and jump links at least 44px tall', () => {
    expect(source.match(/min-h-11/g)?.length).toBeGreaterThanOrEqual(2)
  })

  it('provides visible keyboard focus treatment', () => {
    expect(source.match(/focus-visible:ring-2/g)?.length).toBeGreaterThanOrEqual(2)
    expect(source).toContain('focus-visible:ring-brand-600')
  })

  it('preserves desktop sticky navigation', () => {
    expect(source).toContain('lg:sticky lg:top-24')
  })
})

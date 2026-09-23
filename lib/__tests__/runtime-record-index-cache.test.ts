import { describe, expect, it } from 'vitest'

import { buildRuntimeSlugSets } from '@/lib/runtime-record-index'
import type { RuntimeRecord } from '@/types/content'

describe('cached unified runtime slug sets', () => {
  it('preserves the existing Set membership semantics for herb and compound slugs', () => {
    const herbs = [
      { slug: 'ashwagandha' },
      { slug: 'rhodiola' },
      { slug: 'ashwagandha' },
      { slug: '' },
    ] as RuntimeRecord[]
    const compounds = [
      { slug: 'l-theanine' },
      { slug: 'magnesium' },
      { slug: 'l-theanine' },
    ] as RuntimeRecord[]

    const { herbSlugs, compoundSlugs } = buildRuntimeSlugSets(herbs, compounds)

    expect([...herbSlugs]).toEqual(['ashwagandha', 'rhodiola', ''])
    expect([...compoundSlugs]).toEqual(['l-theanine', 'magnesium'])
  })

  it('derives independent sets from their respective runtime corpora', () => {
    const herbs = [{ slug: 'shared-name' }] as RuntimeRecord[]
    const compounds = [{ slug: 'shared-name' }] as RuntimeRecord[]

    const { herbSlugs, compoundSlugs } = buildRuntimeSlugSets(herbs, compounds)

    expect(herbSlugs).not.toBe(compoundSlugs)
    expect(herbSlugs.has('shared-name')).toBe(true)
    expect(compoundSlugs.has('shared-name')).toBe(true)
  })
})

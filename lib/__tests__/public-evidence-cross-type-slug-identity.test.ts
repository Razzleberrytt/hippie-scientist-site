import { describe, expect, it } from 'vitest'

import { getCompounds, getHerbs } from '@/src/lib/runtime-data'

function slugs(records: Awaited<ReturnType<typeof getHerbs>>): string[] {
  return records
    .map((record) => typeof record?.slug === 'string' ? record.slug.trim() : '')
    .filter(Boolean)
}

describe('public evidence cross-type slug identity', () => {
  it('keeps herb and compound runtime slugs globally unique', async () => {
    const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
    const herbSlugs = new Set(slugs(herbs))
    const collisions = [...new Set(slugs(compounds).filter((slug) => herbSlugs.has(slug)))].sort()

    expect(collisions, `Cross-type slug collisions: ${collisions.join(', ')}`).toEqual([])
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getRuntimeMapEntriesForSlugs } = vi.hoisted(() => ({
  getRuntimeMapEntriesForSlugs: vi.fn(),
}))

vi.mock('../../src/lib/runtime-related-maps', () => ({
  getRuntimeMapEntries: vi.fn(),
  getRuntimeMapEntriesForSlugs,
}))

import { getBatchedRuntimeRecords } from '../related-runtime'

const source = { slug: 'magnesium', name: 'Magnesium' }
const candidate = { slug: 'glycine', name: 'Glycine' }

describe('getBatchedRuntimeRecords stack short-circuit', () => {
  beforeEach(() => {
    getRuntimeMapEntriesForSlugs.mockReset()
  })

  it('returns immediately for batched stack preloads without reading runtime maps', async () => {
    const result = await getBatchedRuntimeRecords('stack', [source], [candidate], 6)

    expect(result).toEqual({})
    expect(getRuntimeMapEntriesForSlugs).not.toHaveBeenCalled()
  })

  it('continues to hydrate supported batched relationship kinds', async () => {
    getRuntimeMapEntriesForSlugs.mockResolvedValue({
      magnesium: [{ slug: 'glycine', score: 0.8 }],
    })

    const result = await getBatchedRuntimeRecords('related', [source], [candidate], 6)

    expect(getRuntimeMapEntriesForSlugs).toHaveBeenCalledWith('related', ['magnesium'])
    expect(result.magnesium?.[0]).toMatchObject({ slug: 'glycine', relatedScore: 0.8 })
  })
})

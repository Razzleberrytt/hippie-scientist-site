import { describe, expect, it } from 'vitest'
import { assertResearchObjectMatchesMediaPack, resolveShortVideoRelease } from '../build-bounded-pilot.mjs'
import { hashResearchObject } from '../distribution-pack-contract.mjs'

describe('bounded-pilot short-video release boundary', () => {
  it('preserves R8.04 for missing/unmarked legacy specs', () => {
    expect(resolveShortVideoRelease({ creativeSpec: {} })).toBe('R8.04')
    expect(resolveShortVideoRelease({})).toBe('R8.04')
  })

  it('requires R8.05 only when the package explicitly declares R8.05', () => {
    expect(resolveShortVideoRelease({ creativeSpec: { systemRelease: 'R8.05' } })).toBe('R8.05')
    expect(() => resolveShortVideoRelease({ creativeSpec: { systemRelease: 'R9.0' } })).toThrow(/unsupported short-video system release/i)
  })
})

describe('R8.05 media-pack source binding', () => {
  const researchObject = {
    id: 'example-object',
    title: 'Example',
    finding: 'Canonical finding.',
    limitation: 'Canonical limitation.',
    sourceUrl: 'https://thehippiescientist.net/herbs/example/',
    evidenceType: 'RCT',
    evidenceGrade: 'B',
  }

  it('accepts the exact research object bound to the pack hash', () => {
    const mediaPack = { source: { contentHash: hashResearchObject(researchObject) } }
    expect(assertResearchObjectMatchesMediaPack(researchObject, mediaPack)).toBe(true)
  })

  it('rejects a research object changed after media-pack generation', () => {
    const mediaPack = { source: { contentHash: hashResearchObject(researchObject) } }
    const changed = { ...researchObject, finding: 'Changed finding.' }
    expect(() => assertResearchObjectMatchesMediaPack(changed, mediaPack)).toThrow(/STALE.*media-pack content hash/i)
  })
})

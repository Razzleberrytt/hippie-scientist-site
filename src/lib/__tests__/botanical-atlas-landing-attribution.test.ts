import { describe, expect, it } from 'vitest'
import { getAtlasLandingSource } from '../botanicalAtlasTracking'

describe('botanical atlas landing attribution', () => {
  it('separates the three goal hubs', () => {
    expect(getAtlasLandingSource('https://thehippiescientist.net/guides/anxiety/')).toBe('anxiety_hub')
    expect(getAtlasLandingSource('https://thehippiescientist.net/guides/sleep/best-supplements-for-sleep/')).toBe('sleep_hub')
    expect(getAtlasLandingSource('https://thehippiescientist.net/guides/focus/')).toBe('focus_hub')
  })

  it('recognizes profile and editorial entry points', () => {
    expect(getAtlasLandingSource('https://thehippiescientist.net/herbs/ashwagandha/')).toBe('herb_profile')
    expect(getAtlasLandingSource('https://thehippiescientist.net/compounds/caffeine/')).toBe('compound_profile')
    expect(getAtlasLandingSource('https://thehippiescientist.net/articles/example/')).toBe('editorial')
  })

  it('falls back safely for direct, external, and malformed referrers', () => {
    expect(getAtlasLandingSource('')).toBe('direct_or_external')
    expect(getAtlasLandingSource('https://example.com/story')).toBe('direct_or_external')
    expect(getAtlasLandingSource('not a url')).toBe('direct_or_external')
  })
})

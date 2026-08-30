import { describe, expect, it } from 'vitest'
import {
  buildSourceLegibilityContract,
  validateSourceLegibilityContract,
} from '../creative-source-legibility.mjs'

const sourceUrl = 'https://thehippiescientist.net/herbs/ashwagandha/'
const sourceSlide = {
  role: 'source',
  body: sourceUrl,
  citationRequired: true,
  colorTreatment: 'source',
}
const platformSafeArea = { x: 80, y: 120, width: 920, height: 1070 }

describe('creative source-card safe-region contract', () => {
  it('builds a deterministic bottom-aligned source region inside the governed safe area', () => {
    const contract = buildSourceLegibilityContract({ sourceUrl, sourceSlide, platformSafeArea })

    expect(contract.version).toBe(2)
    expect(contract.canonicalUrl).toBe(sourceUrl)
    expect(contract.typography.minimumPxAt1080).toBeGreaterThanOrEqual(32)
    expect(contract.placement.deterministicRegionRequired).toBe(true)
    expect(contract.placement.sourceRegion.anchor).toBe('bottom-safe-area')
    expect(validateSourceLegibilityContract(contract)).toEqual([])

    const region = contract.placement.sourceRegion
    expect(region.x).toBeGreaterThanOrEqual(platformSafeArea.x)
    expect(region.y).toBeGreaterThanOrEqual(platformSafeArea.y)
    expect(region.x + region.width).toBeLessThanOrEqual(platformSafeArea.x + platformSafeArea.width)
    expect(region.y + region.height).toBeLessThanOrEqual(platformSafeArea.y + platformSafeArea.height)
  })

  it('fails closed when the safe area cannot fit the configured source typography', () => {
    expect(() => buildSourceLegibilityContract({
      sourceUrl,
      sourceSlide,
      platformSafeArea: { x: 80, y: 120, width: 920, height: 120 },
    })).toThrow(/cannot fit the configured source-card typography/)
  })

  it('fails closed when source typography is configured below the legibility floor', () => {
    expect(() => buildSourceLegibilityContract(
      { sourceUrl, sourceSlide, platformSafeArea },
      { minimumSourcePxAt1080: 24 },
    )).toThrow(/at least 32px/)
  })

  it('detects source-card geometry escaping the platform safe area', () => {
    const contract = buildSourceLegibilityContract({ sourceUrl, sourceSlide, platformSafeArea })
    const tampered = structuredClone(contract)
    tampered.placement.sourceRegion.x = platformSafeArea.x - 1

    expect(validateSourceLegibilityContract(tampered)).toContain('source-card region leaves the platform safe area')
  })

  it('detects an undersized source region even when outer geometry remains safe', () => {
    const contract = buildSourceLegibilityContract({ sourceUrl, sourceSlide, platformSafeArea })
    const tampered = structuredClone(contract)
    tampered.placement.sourceRegion.height = 80

    expect(validateSourceLegibilityContract(tampered)).toContain('source-card region is too short for the configured typography')
  })

  it('preserves the exact canonical source URL as non-rewritable authority', () => {
    expect(() => buildSourceLegibilityContract({
      sourceUrl,
      sourceSlide: { ...sourceSlide, body: 'thehippiescientist.net/herbs/ashwagandha/' },
      platformSafeArea,
    })).toThrow(/exact canonical URL/)
  })
})

import { describe, expect, it } from 'vitest'
import { buildCreativeSpec } from '../creative-spec.mjs'
import { buildThumbnailContract, validateThumbnailContract } from '../creative-thumbnail-contract.mjs'

const input = {
  id: 'ashwagandha-stress-evidence',
  title: 'Ashwagandha and stress: what the evidence actually says',
  finding: 'A governed finding.',
  evidenceType: 'human randomized evidence',
  evidenceGrade: 'B',
  limitation: 'A governed limitation.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
}

describe('creative thumbnail contract', () => {
  it('creates stable crop-resilient variants without changing governed hook text', () => {
    const creative = buildCreativeSpec(input)
    const contract = buildThumbnailContract({
      hookText: creative.verticalVideo.firstTwoSecondHook,
      platformSafeAreas: creative.delivery.platformSafeAreas,
    })

    expect(validateThumbnailContract(contract, creative.verticalVideo.firstTwoSecondHook)).toEqual([])
    expect(contract.variants).toHaveLength(3)
    expect(new Set(contract.variants.map((variant) => variant.id)).size).toBe(3)
    expect(contract.cropResilience.requiredCrops).toEqual(['4:5', '1:1'])
    expect(contract.variants.every((variant) => variant.headline === creative.verticalVideo.firstTwoSecondHook)).toBe(true)
    expect(contract.variants.every((variant) => variant.ctaAllowed === false)).toBe(true)
  })

  it('rejects hook rewriting, truncation, CTA injection, and crop-loss regressions', () => {
    const creative = buildCreativeSpec(input)
    const contract = buildThumbnailContract({
      hookText: creative.verticalVideo.firstTwoSecondHook,
      platformSafeAreas: creative.delivery.platformSafeAreas,
    })
    const unsafe = structuredClone(contract)
    unsafe.variants[0].headline = 'Clinically proven stress relief'
    unsafe.variants[0].ctaAllowed = true
    unsafe.typography.truncationAllowed = true
    unsafe.cropResilience.headlineMustRemainFullyVisible = false

    expect(validateThumbnailContract(unsafe, creative.verticalVideo.firstTwoSecondHook)).toEqual(expect.arrayContaining([
      expect.stringMatching(/preserve the governed hook text/i),
      expect.stringMatching(/may not contain a CTA/i),
      expect.stringMatching(/may not be rewritten or truncated/i),
      expect.stringMatching(/remain fully visible/i),
    ]))
  })

  it('rejects duplicate variant IDs and insufficient feed-speed type size', () => {
    const creative = buildCreativeSpec(input)
    const contract = buildThumbnailContract({
      hookText: creative.verticalVideo.firstTwoSecondHook,
      platformSafeAreas: creative.delivery.platformSafeAreas,
    })
    const unsafe = structuredClone(contract)
    unsafe.typography.minimumHeadlinePxAt1080 = 40
    unsafe.variants[1].id = unsafe.variants[0].id

    expect(validateThumbnailContract(unsafe, creative.verticalVideo.firstTwoSecondHook)).toEqual(expect.arrayContaining([
      expect.stringMatching(/at least 64px/i),
      expect.stringMatching(/stable and unique/i),
    ]))
  })
})

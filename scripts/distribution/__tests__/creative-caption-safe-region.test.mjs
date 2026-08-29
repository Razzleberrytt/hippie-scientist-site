import { expect, test } from 'vitest'
import { buildLosslessCaptionContract, validateLosslessCaptionContract } from '../creative-caption-contract.mjs'

const scenes = [
  {
    role: 'hook',
    start: 0,
    end: 2,
    voiceover: 'What the evidence actually says',
    factualAuthority: 'canonical-input',
  },
  {
    role: 'finding',
    start: 2,
    end: 9,
    voiceover: 'A governed finding stays exactly the same in captions',
    factualAuthority: 'canonical-input',
  },
]

const platformSafeAreas = {
  tiktok: { x: 96, y: 220, width: 764, height: 1340 },
  instagramReels: { x: 96, y: 220, width: 804, height: 1360 },
  youtubeShorts: { x: 96, y: 220, width: 804, height: 1380 },
}

test('derives one deterministic lower caption region inside every vertical platform safe area', () => {
  const contract = buildLosslessCaptionContract({ scenes, platformSafeAreas })
  expect(contract.version).toBe(2)
  expect(contract.captionRegion.anchor).toBe('lower-middle-safe-intersection')
  expect(contract.captionRegion.minimumPxAt1080).toBeGreaterThanOrEqual(44)
  expect(contract.captionRegion.maxLines).toBe(2)

  const regionRight = contract.captionRegion.x + contract.captionRegion.width
  const regionBottom = contract.captionRegion.y + contract.captionRegion.height
  for (const area of Object.values(platformSafeAreas)) {
    expect(contract.captionRegion.x).toBeGreaterThanOrEqual(area.x)
    expect(contract.captionRegion.y).toBeGreaterThanOrEqual(area.y)
    expect(regionRight).toBeLessThanOrEqual(area.x + area.width)
    expect(regionBottom).toBeLessThanOrEqual(area.y + area.height)
  }
  expect(validateLosslessCaptionContract(contract, scenes)).toEqual([])
})

test('fails closed when platform safe areas do not share enough room for the caption block', () => {
  expect(() => buildLosslessCaptionContract({
    scenes,
    platformSafeAreas: {
      a: { x: 0, y: 0, width: 100, height: 100 },
      b: { x: 200, y: 200, width: 100, height: 100 },
    },
  })).toThrow(/usable caption-safe intersection/)

  expect(() => buildLosslessCaptionContract({
    scenes,
    platformSafeAreas: {
      a: { x: 0, y: 0, width: 1080, height: 120 },
      b: { x: 0, y: 0, width: 1080, height: 120 },
    },
  })).toThrow(/cannot fit the configured caption block/)
})

test('validation rejects a caption region moved outside any platform safe area or made too short', () => {
  const contract = buildLosslessCaptionContract({ scenes, platformSafeAreas })

  const escaped = {
    ...contract,
    captionRegion: { ...contract.captionRegion, y: 1500 },
  }
  expect(validateLosslessCaptionContract(escaped, scenes)).toContain('caption region leaves the tiktok safe area')

  const tooShort = {
    ...contract,
    captionRegion: { ...contract.captionRegion, height: 80 },
  }
  expect(validateLosslessCaptionContract(tooShort, scenes)).toContain('caption region is too short for the configured caption block')
})

import { describe, it, expect } from 'vitest'
import { R808_HUD_FRAME_CHECKS, validateR808HudReview } from '../r808-hud-inspection.mjs'

describe('R8.08 exact-master phantom-HUD prevention', () => {
  const approved = Object.fromEntries(R808_HUD_FRAME_CHECKS.map(field => [field, 'pass']))

  it('requires four explicit first/middle/limitation/source observations', () => {
    expect(R808_HUD_FRAME_CHECKS).toEqual([
      'hudFirstFrame', 'hudMiddleFrame', 'hudLimitationFrame', 'hudSourceFrame',
    ])
    expect(validateR808HudReview(approved)).toEqual(approved)
  })

  it('fails closed if any frame has not been independently inspected', () => {
    for (const field of R808_HUD_FRAME_CHECKS) {
      const incomplete = { ...approved }
      delete incomplete[field]
      expect(() => validateR808HudReview(incomplete)).toThrow(field)
      expect(() => validateR808HudReview({ ...approved, [field]: 'fail' })).toThrow(field)
    }
    expect(() => validateR808HudReview(null)).toThrow('hudFirstFrame')
  })

  it('keeps both master approval and publisher staging wired to the shared gate', async () => {
    const fs = await import('node:fs')
    const approval = fs.readFileSync('scripts/distribution/approve-r805-master.mjs', 'utf8')
    const staging = fs.readFileSync('scripts/distribution/stage-publication-media.mjs', 'utf8')
    expect(approval).toContain('validateR808HudReview({ hudFirstFrame, hudMiddleFrame, hudLimitationFrame, hudSourceFrame })')
    expect(approval).toContain('...(hudFrameInspection ?? {})')
    expect(staging).toContain('validateR808HudReview(masterQa.qa)')
  })
})

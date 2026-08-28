import { describe, expect, it } from 'vitest'
import {
  CREATIVE_LAYOUT_PROFILES,
  measureCreativeLayoutFit,
  validateCreativeLayoutFit,
} from '../creative-layout-fit-contract.mjs'

const trustBlocks = [
  { role: 'hook', text: 'What the evidence actually shows' },
  { role: 'finding', text: 'A concise governed finding that fits comfortably in the available layout.' },
  { role: 'limitation', text: 'A governed limitation remains visible beside the finding.' },
  { role: 'source', text: 'Source: thehippiescientist.net/herbs/ashwagandha/' },
  { role: 'disclosure', text: 'Educational content — evidence summary, not medical advice.' },
]

describe('creative layout-fit contract', () => {
  it('keeps fitting governed copy ready at accessible typography floors across every canonical profile', () => {
    for (const profileId of Object.keys(CREATIVE_LAYOUT_PROFILES)) {
      const result = measureCreativeLayoutFit({ profileId, blocks: trustBlocks })
      expect(validateCreativeLayoutFit(result)).toEqual([])
      expect(result.status).toBe('ready')
      expect(result.geometry.minimumBodyPx).toBeGreaterThanOrEqual(42)
      expect(result.guardrails.truncationAllowed).toBe(false)
      expect(result.guardrails.paraphraseAllowed).toBe(false)
      expect(result.guardrails.clippingAllowed).toBe(false)
    }
  })

  it('paginates long governed copy instead of shrinking, clipping, or truncating it', () => {
    const longFinding = Array.from({ length: 70 }, (_, index) => `governed${index}`).join(' ')
    const result = measureCreativeLayoutFit({
      profileId: 'portrait-carousel',
      blocks: trustBlocks.map((block) => block.role === 'finding' ? { ...block, text: longFinding } : block),
    })
    expect(validateCreativeLayoutFit(result)).toEqual([])
    expect(result.status).toBe('paginate')
    const finding = result.diagnostics.find((item) => item.role === 'finding')
    expect(finding.panelCount).toBeGreaterThan(1)
    expect(finding.text).toBe(longFinding)
    expect(finding.minimumBodyPx).toBe(CREATIVE_LAYOUT_PROFILES['portrait-carousel'].minBodyPx)
    expect(finding.truncationAllowed).toBe(false)
  })

  it('fails closed when deterministic pagination capacity is exceeded', () => {
    const impossible = Array.from({ length: 500 }, (_, index) => `evidence${index}`).join(' ')
    const result = measureCreativeLayoutFit({
      profileId: 'square-social',
      blocks: trustBlocks.map((block) => block.role === 'finding' ? { ...block, text: impossible } : block),
    })
    expect(result.status).toBe('blocked')
    expect(result.reasons.join(' ')).toMatch(/capacity|maximum/i)
    expect(result.diagnostics.find((item) => item.role === 'finding').text).toBe(impossible)
  })

  it('blocks layouts that omit reserved source or disclosure regions', () => {
    const result = measureCreativeLayoutFit({
      profileId: 'vertical-video',
      blocks: trustBlocks.filter((block) => block.role !== 'source'),
    })
    expect(result.status).toBe('blocked')
    expect(result.reasons.join(' ')).toMatch(/source/i)
  })

  it('rejects validation drift that weakens reserved trust-region guardrails', () => {
    const result = measureCreativeLayoutFit({ profileId: 'vertical-video', blocks: trustBlocks })
    const weakened = {
      ...result,
      guardrails: { ...result.guardrails, sourceRegionReserved: false },
    }
    expect(validateCreativeLayoutFit(weakened)).toContain('source and disclosure regions must remain reserved')
  })

  it('refuses typography below the canonical accessible minimum', () => {
    expect(() => measureCreativeLayoutFit({
      profileId: 'vertical-video',
      blocks: trustBlocks,
      minimumBodyPx: 30,
    })).toThrow(/may not be smaller/i)
  })

  it('is deterministic for identical governed input', () => {
    const first = measureCreativeLayoutFit({ profileId: 'pinterest', blocks: trustBlocks })
    const second = measureCreativeLayoutFit({ profileId: 'pinterest', blocks: trustBlocks })
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })
})

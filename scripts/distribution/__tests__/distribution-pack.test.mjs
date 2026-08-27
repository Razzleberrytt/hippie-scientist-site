import { describe, expect, it } from 'vitest'
import {
  advanceQueue,
  buildDistributionPack,
  validateDistributionPack,
} from '../lib/distribution-pack.mjs'

const input = {
  source: {
    url: 'https://thehippiescientist.net/compounds/bpc-157/',
    canonicalId: 'compound:bpc-157',
    contentHash: 'source-sha-256-placeholder',
    reviewedAt: '2026-08-26',
  },
  claims: [{
    id: 'human-evidence',
    text: 'FDA identified five small human clinical studies in its 2026 review.',
    qualification: 'The evidence is insufficient to establish clinical efficacy or long-term safety.',
    provenance: {
      sourceUrl: 'https://thehippiescientist.net/compounds/bpc-157/',
      field: 'summary',
    },
  }],
  assets: [{ id: 'carousel-1', type: 'carousel', path: 'distribution/bpc-157/carousel-1.svg' }],
}

describe('distribution pack contract', () => {
  it('builds deterministic provenance-bound packs', () => {
    const a = buildDistributionPack(input)
    const b = buildDistributionPack(input)
    expect(a.packId).toBe(b.packId)
    expect(a.factualHash).toBe(b.factualHash)
    expect(a.assets[0].factualHash).toBe(a.factualHash)
    expect(validateDistributionPack(a)).toEqual({ valid: true, errors: [] })
  })

  it('invalidates assets when governed factual payload changes', () => {
    const pack = buildDistributionPack(input)
    pack.factualPayload.claims[0].qualification = 'Changed governed qualification.'
    const result = validateDistributionPack(pack)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('factual payload hash mismatch')
    expect(result.errors).toContain('asset carousel-1 is stale')
  })

  it('fails closed when a claim lacks provenance', () => {
    expect(() => buildDistributionPack({
      ...input,
      claims: [{ text: 'Unsupported free-floating claim' }],
    })).toThrow(/provenance/)
  })

  it('permits only one-step queue transitions', () => {
    const generated = buildDistributionPack(input)
    const validated = advanceQueue(generated, 'validated')
    expect(validated.queue.state).toBe('validated')
    expect(() => advanceQueue(generated, 'ready')).toThrow(/invalid queue transition/)
  })
})

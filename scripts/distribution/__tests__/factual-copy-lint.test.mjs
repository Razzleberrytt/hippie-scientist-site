import { describe, expect, it } from 'vitest'

import { validateFactualAssetCopy } from '../factual-copy-lint.mjs'

function pack(overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    packId: 'fixture-media-v1',
    claims: [{
      id: 'CLAIM_001',
      publicSafeStatement: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.',
      evidenceContext: 'human',
    }],
    uncertainties: [{
      id: 'UNCERTAINTY_001',
      statement: 'This was one study and does not establish a universal effect.',
    }],
    cta: { label: 'Read the evidence' },
    ...overrides,
  }
}

describe('distribution factual copy lint', () => {
  it('accepts a complete claim-safe narration with exact governed claim, uncertainty, and CTA', () => {
    expect(validateFactualAssetCopy(pack(), {
      assetType: 'narration',
      lines: [
        { role: 'label', text: 'What the evidence says' },
        { role: 'claim', claimId: 'CLAIM_001', text: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.' },
        { role: 'uncertainty', uncertaintyId: 'UNCERTAINTY_001', text: 'This was one study and does not establish a universal effect.' },
        { role: 'cta', text: 'Read the evidence' },
      ],
    })).toEqual([])
  })

  it('rejects generated claim strengthening instead of trusting self-described simplification', () => {
    const errors = validateFactualAssetCopy(pack(), {
      assetType: 'carousel',
      lines: [{ role: 'claim', claimId: 'CLAIM_001', text: 'This intervention is proven to improve sleep.' }],
    })
    expect(errors.join('\n')).toMatch(/must equal the governed publicSafeStatement/i)
  })

  it('rejects study-context dose conversion into consumer dosing advice', () => {
    const errors = validateFactualAssetCopy(pack(), {
      assetType: 'overlay',
      lines: [{ role: 'label', factual: false, text: 'Take 2 capsules daily for better sleep.' }],
    })
    expect(errors.join('\n')).toMatch(/consumer dosing advice/i)
  })

  it('rejects second-person benefit projection and absolute safety language anywhere in copy', () => {
    const errors = validateFactualAssetCopy(pack(), {
      assetType: 'caption',
      lines: [
        { role: 'claim', claimId: 'CLAIM_001', text: 'This can help you sleep better.' },
        { role: 'label', text: 'Completely safe and risk-free.' },
      ],
    })
    expect(errors.join('\n')).toMatch(/consumer/i)
    expect(errors.join('\n')).toMatch(/absolute-safety/i)
  })

  it('requires complete caption/script payloads to preserve governed uncertainty', () => {
    const errors = validateFactualAssetCopy(pack(), {
      assetType: 'script',
      lines: [{ role: 'claim', claimId: 'CLAIM_001', text: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.' }],
    })
    expect(errors).toContain('complete script is missing governed uncertainty UNCERTAINTY_001')
  })

  it('rejects preclinical-to-human projection even when the text is attached to the declared claim id', () => {
    const preclinical = pack({
      claims: [{
        id: 'CLAIM_001',
        publicSafeStatement: 'In the recorded animal study, the intervention changed the measured sleep-related marker.',
        evidenceContext: 'preclinical',
      }],
    })
    const errors = validateFactualAssetCopy(preclinical, {
      assetType: 'carousel',
      lines: [{ role: 'claim', claimId: 'CLAIM_001', text: 'Animal studies show people improve sleep with the intervention.' }],
    })
    expect(errors.join('\n')).toMatch(/preclinical evidence into human benefit language/i)
  })

  it('keeps nonfactual creative labels possible without letting them masquerade as evidence', () => {
    expect(validateFactualAssetCopy(pack(), {
      assetType: 'overlay',
      lines: [
        { role: 'label', text: 'One study, carefully framed' },
        { role: 'claim', claimId: 'CLAIM_001', text: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.' },
      ],
    })).toEqual([])

    expect(validateFactualAssetCopy(pack(), {
      assetType: 'overlay',
      lines: [{ role: 'label', factual: true, text: 'Clinically proven.' }],
    }).join('\n')).toMatch(/must be represented as governed claim or uncertainty/i)
  })
})

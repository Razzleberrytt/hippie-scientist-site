import { describe, expect, it } from 'vitest'

import { validateFactualAssetCopy } from '../factual-copy-lint.mjs'

const pack = {
  schemaVersion: '1.0.0',
  packId: 'fixture-media-v1',
  claims: [{
    id: 'CLAIM_001',
    publicSafeStatement: 'In the recorded randomized trial, the intervention improved the prespecified sleep outcome versus control.',
    evidenceContext: 'human',
  }],
  safety: [],
  uncertainties: [{
    id: 'UNCERTAINTY_001',
    statement: 'This was one study and does not establish a universal effect.',
  }],
  cta: { label: 'Read the evidence' },
}

describe('distribution factual-copy unbound context lint', () => {
  it.each([
    '300 mg studied',
    '500 IU studied',
    '250 I.U. studied',
    '10 µg studied',
    '10 μg studied',
    '2 billion CFU studied',
    'Works in 30 minutes',
    'Starts working in 30 minutes',
    'Effects begin within 30 minutes',
    '30 minute onset',
    '30-minute onset',
    'Equivalent to melatonin',
    'As effective as the standard treatment',
    'More effective than melatonin',
    'Matches melatonin efficacy',
    'Comparable efficacy to melatonin',
    'Superior to melatonin',
    'Outperforms melatonin',
    'Human study',
    'Randomized controlled trial',
    'Placebo-controlled trial',
    'Systematic review',
    'Meta-analysis',
    'Preclinical study',
    'In mice',
    'Studied in adults',
    '12-week trial',
  ])('rejects factual label text that bypasses governed provenance: %s', (text) => {
    const errors = validateFactualAssetCopy(pack, {
      assetType: 'overlay',
      lines: [{ role: 'label', factual: false, text }],
    })
    expect(errors.join('\n')).toMatch(/factual labels must be represented as governed claim, uncertainty, or safety lines/i)
  })

  it.each([
    'One study, carefully framed',
    'What the evidence can and cannot say',
    'A 30-minute read',
    'Match the label to the source',
    'IU and CFU are units, not guidance',
    'Read the evidence',
  ])('keeps genuinely nonfactual creative labels available: %s', (text) => {
    expect(validateFactualAssetCopy(pack, {
      assetType: 'overlay',
      lines: [{ role: 'label', factual: false, text }],
    })).toEqual([])
  })
})

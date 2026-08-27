import { describe, expect, it } from 'vitest'
import { buildCreativeExperimentContract } from '../creative-experiment-contract.mjs'

const mediaPack = {
  source: {
    url: 'https://thehippiescientist.net/herbs/ashwagandha/',
    contentHash: 'abc123canonicalhash',
  },
}

const creativeSpec = {
  claimSafetyStatus: 'validated-lossless',
  sourceIdentity: {
    id: 'ashwagandha-stress-evidence-2026-08',
    sourceUrl: mediaPack.source.url,
  },
  delivery: {
    landingUrl: mediaPack.source.url,
    disclosure: 'Educational content • evidence summary, not medical advice',
    factualTextPolicy: 'Use governed factual strings verbatim.',
    safeAreaPolicy: 'Keep factual UI inside the selected platform safe area.',
    colorPolicy: { minimumTextContrast: 4.5 },
  },
  carousel: {
    slides: [
      { role: 'finding', headline: 'Governed finding', citationRequired: true },
      { role: 'limitation', headline: 'Governed limitation', citationRequired: true },
    ],
  },
  verticalVideo: {
    scenes: [{ role: 'finding', onScreenText: 'Governed finding' }],
  },
  experimentContract: {
    mutableFields: ['background-treatment', 'b-roll', 'transition-style', 'hook-layout', 'thumbnail-layout'],
    immutableFields: [
      'factual-text',
      'evidence-grade',
      'limitation',
      'source-url',
      'disclosure',
      'cta-destination',
      'caption-meaning',
      'minimum-contrast-threshold',
      'platform-safe-area',
    ],
    primaryMetric: 'qualified-social-to-site-clickthrough',
    guardrailMetrics: ['source-card-legibility', 'caption-completion', 'disclosure-visibility', 'creative-safe-area-pass-rate', 'creative-contrast-pass-rate'],
  },
}

const variants = [
  { label: 'Hook A', changes: { 'hook-layout': 'statement-first', 'thumbnail-layout': 'grade-badge-right' } },
  { label: 'Hook B', changes: { 'hook-layout': 'question-first', 'thumbnail-layout': 'grade-badge-left' } },
]

describe('creative experiment contract', () => {
  it('creates stable provenance-bound experiment and variant identities', () => {
    const first = buildCreativeExperimentContract({ mediaPack, creativeSpec, platform: 'instagram-reels', format: '1080x1920', variants })
    const second = buildCreativeExperimentContract({ mediaPack, creativeSpec, platform: 'instagram-reels', format: '1080x1920', variants })

    expect(second).toEqual(first)
    expect(first.experimentId).toMatch(/^experiment-[0-9a-f]{16}$/)
    expect(first.variants).toHaveLength(2)
    expect(new Set(first.variants.map((variant) => variant.id)).size).toBe(2)
    expect(new Set(first.variants.map((variant) => variant.factualFingerprint)).size).toBe(1)
    expect(first.source.contentHash).toBe(mediaPack.source.contentHash)
    expect(first.measurement.primaryMetric).toBe('qualified-social-to-site-clickthrough')
    expect(first.measurement.publishingSideEffects).toBe(false)
  })

  it('keeps attribution scoped to platform, format, and source-content identity', () => {
    const reels = buildCreativeExperimentContract({ mediaPack, creativeSpec, platform: 'instagram-reels', format: '1080x1920', variants })
    const shorts = buildCreativeExperimentContract({ mediaPack, creativeSpec, platform: 'youtube-shorts', format: '1080x1920', variants })
    const changedSource = buildCreativeExperimentContract({
      mediaPack: { source: { ...mediaPack.source, contentHash: 'new-canonical-hash' } },
      creativeSpec,
      platform: 'instagram-reels',
      format: '1080x1920',
      variants,
    })

    expect(shorts.experimentId).not.toBe(reels.experimentId)
    expect(changedSource.experimentId).not.toBe(reels.experimentId)
    expect(reels.measurement.attributionPolicy).toMatch(/same platform, format, source-content hash/i)
  })

  it('fails closed when a variant attempts to mutate scientific, accessibility, or delivery truth', () => {
    for (const immutable of ['factual-text', 'limitation', 'source-url', 'disclosure', 'minimum-contrast-threshold', 'platform-safe-area']) {
      expect(() => buildCreativeExperimentContract({
        mediaPack,
        creativeSpec,
        platform: 'instagram-reels',
        format: '1080x1920',
        variants: [variants[0], { label: 'Unsafe', changes: { [immutable]: 'changed' } }],
      })).toThrow(new RegExp(`immutable field: ${immutable}`))
    }
  })

  it('rejects undeclared creative mutations and duplicate variants', () => {
    expect(() => buildCreativeExperimentContract({
      mediaPack,
      creativeSpec,
      platform: 'instagram-reels',
      format: '1080x1920',
      variants: [variants[0], { label: 'Unknown', changes: { 'font-size': 20 } }],
    })).toThrow(/undeclared mutable field: font-size/)

    expect(() => buildCreativeExperimentContract({
      mediaPack,
      creativeSpec,
      platform: 'instagram-reels',
      format: '1080x1920',
      variants: [variants[0], variants[0]],
    })).toThrow(/creative variants must be distinct/)
  })

  it('rejects stale or mismatched provenance and incomplete creative safety contracts', () => {
    expect(() => buildCreativeExperimentContract({
      mediaPack,
      creativeSpec: { ...creativeSpec, claimSafetyStatus: 'blocked-unsafe-truncation' },
      platform: 'instagram-reels',
      format: '1080x1920',
      variants,
    })).toThrow(/validated-lossless/)

    expect(() => buildCreativeExperimentContract({
      mediaPack,
      creativeSpec: { ...creativeSpec, sourceIdentity: { ...creativeSpec.sourceIdentity, sourceUrl: 'https://thehippiescientist.net/herbs/rhodiola/' } },
      platform: 'instagram-reels',
      format: '1080x1920',
      variants,
    })).toThrow(/source URL must match/)

    expect(() => buildCreativeExperimentContract({
      mediaPack,
      creativeSpec: {
        ...creativeSpec,
        experimentContract: {
          ...creativeSpec.experimentContract,
          immutableFields: creativeSpec.experimentContract.immutableFields.filter((field) => field !== 'caption-meaning'),
        },
      },
      platform: 'instagram-reels',
      format: '1080x1920',
      variants,
    })).toThrow(/caption-meaning immutable/)
  })
})

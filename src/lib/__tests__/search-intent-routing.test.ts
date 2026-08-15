import { describe, expect, it } from 'vitest'
import {
  canStartMetadataRewrite,
  classifyQueryIntent,
  compareCannibalization,
  diagnoseCtr,
  diagnoseQueryRouting,
  routePolicyForIntent,
  shouldPreserveMetadata,
  type MetadataExperiment,
} from '../search-intent-routing'

describe('query intent routing', () => {
  it.each([
    ['what is ashwagandha', 'informational'],
    ['ashwagandha side effects', 'safety'],
    ['ashwagandha vs rhodiola', 'comparison'],
    ['ashwagandha dosage mg', 'dose'],
    ['ashwagandha morning or night', 'timing'],
    ['best standardized ashwagandha extract', 'product-quality'],
    ['ashwagandha receptor mechanism', 'mechanism'],
    ['ashwagandha randomized trial evidence', 'research'],
    ['best supplement to buy for stress', 'commercial'],
  ] as const)('classifies %s as %s', (query, intent) => {
    expect(classifyQueryIntent(query)).toBe(intent)
  })

  it('routes each intent to the page family designed for it', () => {
    expect(routePolicyForIntent('comparison').routeFamily).toBe('/guides/compare')
    expect(routePolicyForIntent('safety').commercialEligible).toBe(false)
    expect(routePolicyForIntent('mechanism').commercialEligible).toBe(false)
  })

  it('detects when Google prefers a different URL and recommends corrective actions', () => {
    const result = diagnoseQueryRouting({
      query: 'magnesium for sleep',
      intendedUrl: '/guides/sleep/magnesium-for-sleep/',
      observedUrls: [
        { url: '/herbs/magnesium/', impressions: 80 },
        { url: '/guides/sleep/magnesium-for-sleep/', impressions: 20 },
      ],
    })

    expect(result.mismatch).toBe(true)
    expect(result.cannibalized).toBe(true)
    expect(result.actions).toContain('align-internal-links-with-intended-url')
  })

  it('tracks query-to-page stability and release-introduced cannibalization', () => {
    const before = diagnoseQueryRouting({
      query: 'l theanine for sleep',
      intendedUrl: '/guides/sleep/l-theanine-for-sleep/',
      observedUrls: [{ url: '/guides/sleep/l-theanine-for-sleep/', impressions: 100 }],
    })
    const after = diagnoseQueryRouting({
      query: 'l theanine for sleep',
      intendedUrl: '/guides/sleep/l-theanine-for-sleep/',
      observedUrls: [
        { url: '/guides/sleep/l-theanine-for-sleep/', impressions: 55 },
        { url: '/herbs/l-theanine/', impressions: 45 },
      ],
    })

    expect(before.stability).toBe(1)
    expect(after.stability).toBe(0.55)
    expect(
      compareCannibalization(
        { releaseId: 'before', diagnostics: [before] },
        { releaseId: 'after', diagnostics: [after] },
      )[0].introduced,
    ).toBe(true)
  })
})

describe('CTR and metadata experiments', () => {
  const experiments: MetadataExperiment[] = [
    {
      id: 'exp-1',
      url: '/guides/sleep/magnesium-for-sleep/',
      startedAt: '2026-08-01',
      titleBefore: 'Old title',
      titleAfter: 'Winning title',
      baselineCtr: 0.02,
      resultCtr: 0.04,
      status: 'won',
    },
  ]

  it('flags only material CTR underperformers for rewriting', () => {
    const weak = diagnoseCtr({
      url: '/weak/',
      impressions: 1000,
      clicks: 10,
      position: 5,
    })
    const tinySample = diagnoseCtr({
      url: '/tiny/',
      impressions: 20,
      clicks: 0,
      position: 5,
    })

    expect(weak.underperforming).toBe(true)
    expect(weak.rewriteEligible).toBe(true)
    expect(tinySample.rewriteEligible).toBe(false)
  })

  it('preserves winning and running metadata instead of endlessly changing it', () => {
    expect(shouldPreserveMetadata(experiments, '/guides/sleep/magnesium-for-sleep/')).toBe(true)

    const ctr = diagnoseCtr({
      url: '/guides/sleep/magnesium-for-sleep/',
      impressions: 1000,
      clicks: 10,
      position: 5,
    })
    expect(canStartMetadataRewrite(ctr, experiments)).toBe(false)
  })

  it('allows a new experiment only for a real underperformer with no protected winner', () => {
    const ctr = diagnoseCtr({ url: '/new-page/', impressions: 1000, clicks: 5, position: 4 })
    expect(canStartMetadataRewrite(ctr, experiments)).toBe(true)
  })
})

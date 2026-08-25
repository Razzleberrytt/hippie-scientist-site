import { expect, test } from 'vitest'
import { buildFeedbackReport, profileIdentity } from '../search-index-feedback.mjs'

const statusWeights = {
  content_quality: 1,
  discovered_but_not_in_index: 0.8,
  not_yet_crawled: 0.35,
  indexed: 0,
}

test('profileIdentity limits enrichment reconciliation to herb and compound profile routes', () => {
  expect(profileIdentity('https://thehippiescientist.net/herbs/fennel/')).toEqual({ kind: 'herb', slug: 'fennel' })
  expect(profileIdentity('https://thehippiescientist.net/compounds/quercetin')).toEqual({ kind: 'compound', slug: 'quercetin' })
  expect(profileIdentity('https://thehippiescientist.net/goals/pain/')).toBeNull()
})

test('reconciles external rejection against shadow and final publication truth without mutation', () => {
  const report = buildFeedbackReport({
    input: {
      observations: [
        {
          engine: 'bing',
          status: 'content_quality',
          url: 'https://thehippiescientist.net/herbs/fennel/',
          observed_at: '2026-08-25',
          active: true,
        },
        {
          engine: 'bing',
          status: 'discovered_but_not_in_index',
          url: 'https://thehippiescientist.net/compounds/quercetin/',
          observed_at: '2026-08-25',
          active: true,
        },
        {
          engine: 'bing',
          status: 'not_yet_crawled',
          url: 'https://thehippiescientist.net/guides/compare/oregano-vs-thyme/',
          observed_at: '2026-08-25',
          active: true,
        },
      ],
    },
    shadowReport: {
      failures: [{ kind: 'herb', slug: 'fennel' }],
      watch: [],
    },
    publicationTruth: {
      profiles: [
        {
          kind: 'herb',
          slug: 'fennel',
          publicationReason: 'published',
          sitemapIncluded: true,
          emittedNoindex: false,
        },
        {
          kind: 'compound',
          slug: 'quercetin',
          publicationReason: 'published',
          sitemapIncluded: true,
          emittedNoindex: false,
        },
      ],
    },
    statusWeights,
    generatedAt: '2026-08-25T00:00:00.000Z',
  })

  expect(report.publicationMutation).toBe(false)
  expect(report.summary.agreementHighPriority).toBe(1)
  expect(report.summary.externalInternalDisagreements).toBe(1)
  expect(report.summary.crawlAttention).toBe(1)
  expect(report.observations.find((row) => row.url.includes('/herbs/fennel/'))?.diagnosis).toBe('AGREEMENT_HIGH_PRIORITY')
  expect(report.observations.find((row) => row.url.includes('/compounds/quercetin/'))?.diagnosis).toBe('EXTERNAL_INTERNAL_DISAGREEMENT')
})

test('newer active observation supersedes stale rejection for the same URL', () => {
  const report = buildFeedbackReport({
    input: {
      observations: [
        {
          engine: 'bing',
          status: 'content_quality',
          url: 'https://thehippiescientist.net/herbs/fennel/',
          observed_at: '2026-08-20',
          active: true,
        },
        {
          engine: 'bing',
          status: 'indexed',
          url: 'https://thehippiescientist.net/herbs/fennel/',
          observed_at: '2026-08-25',
          active: true,
        },
      ],
    },
    shadowReport: { failures: [], watch: [] },
    publicationTruth: {
      profiles: [
        {
          kind: 'herb',
          slug: 'fennel',
          publicationReason: 'published',
          sitemapIncluded: true,
          emittedNoindex: false,
        },
      ],
    },
    statusWeights,
    generatedAt: '2026-08-25T00:00:00.000Z',
  })

  expect(report.observations).toHaveLength(1)
  expect(report.observations[0]).toMatchObject({ status: 'indexed', diagnosis: 'INDEXED', shadow: 'PASS' })
})

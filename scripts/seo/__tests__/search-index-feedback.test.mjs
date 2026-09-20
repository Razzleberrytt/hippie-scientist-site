import { expect, test } from 'vitest'
import { buildFeedbackReport, classifyPublicationState, crawlAgeDays, normalizeObservationUrl, profileIdentity } from '../search-index-feedback.mjs'

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


test('normalizes slash variants without erasing query-parameter evidence', () => {
  const slash = normalizeObservationUrl('https://thehippiescientist.net/compounds/quercetin/')
  const noSlash = normalizeObservationUrl('https://thehippiescientist.net/compounds/quercetin')
  const query = normalizeObservationUrl('https://thehippiescientist.net/compare/?c=commipheric-acid,5-htp')

  expect(slash.url).toBe(noSlash.url)
  expect(slash.observationKey).toBe(noSlash.observationKey)
  expect(query).toMatchObject({
    rawUrl: 'https://thehippiescientist.net/compare/?c=commipheric-acid,5-htp',
    url: 'https://thehippiescientist.net/compare/',
    query: '?c=commipheric-acid,5-htp',
    hasQuery: true,
  })
  expect(query.observationKey).not.toBe(query.url)
})

test('reports crawl age without converting it into an automatic publication decision', () => {
  expect(crawlAgeDays('2026-07-01', '2026-09-20')).toBe(81)
  expect(crawlAgeDays('', '2026-09-20')).toBeNull()
  expect(crawlAgeDays('2026-09-21', '2026-09-20')).toBeNull()
})

test('keeps Google crawled-not-indexed distinct from content-quality and query duplicate signals', () => {
  const report = buildFeedbackReport({
    input: {
      observations: [
        {
          engine: 'google',
          status: 'crawled_but_not_in_index',
          url: 'https://thehippiescientist.net/compounds/quercetin',
          observed_at: '2026-09-20',
          last_crawled: '2026-06-01',
          source: 'gsc-page-indexing',
          active: true,
        },
        {
          engine: 'google',
          status: 'duplicate_without_user_selected_canonical',
          url: 'https://thehippiescientist.net/compare/?c=commipheric-acid,5-htp',
          observed_at: '2026-09-20',
          source: 'gsc-page-indexing',
          active: true,
        },
      ],
    },
    shadowReport: { failures: [], watch: [] },
    publicationTruth: {
      profiles: [
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
    generatedAt: '2026-09-20T00:00:00.000Z',
  })

  const crawled = report.observations.find((row) => row.status === 'crawled_but_not_in_index')
  const query = report.observations.find((row) => row.status === 'duplicate_without_user_selected_canonical')

  expect(crawled).toMatchObject({
    diagnosis: 'EXTERNAL_INTERNAL_DISAGREEMENT',
    shadow: 'PASS',
    lastCrawled: '2026-06-01',
    crawlAgeDays: 111,
  })
  expect(query).toMatchObject({
    diagnosis: 'QUERY_PARAMETER_VARIANT',
    hasQuery: true,
    profile: null,
  })
  expect(report.summary.queryParameterVariants).toBe(1)
  expect(report.summary.crawlDatesProvided).toBe(1)
  expect(report.summary.crawlObservationsOlderThan30Days).toBe(1)
})

test('slash variants resolve to one latest observation identity', () => {
  const report = buildFeedbackReport({
    input: {
      observations: [
        {
          engine: 'google',
          status: 'crawled_but_not_in_index',
          url: 'https://thehippiescientist.net/herbs/fennel',
          observed_at: '2026-09-19',
          active: true,
        },
        {
          engine: 'google',
          status: 'indexed',
          url: 'https://thehippiescientist.net/herbs/fennel/',
          observed_at: '2026-09-20',
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
    generatedAt: '2026-09-20T00:00:00.000Z',
  })

  expect(report.observations).toHaveLength(1)
  expect(report.observations[0]).toMatchObject({ status: 'indexed', diagnosis: 'INDEXED' })
})


test('classifies current publication state before acting on external index observations', () => {
  const publicationTruth = {
    profiles: [
      {
        route: '/herbs/published/',
        publicationReason: 'published',
        sitemapIncluded: true,
        emittedNoindex: false,
        canonicalMatches: true,
        parity: true,
      },
      {
        route: '/herbs/held/',
        publicationReason: 'governance:insufficient grounding',
        sitemapIncluded: false,
        emittedNoindex: true,
        canonicalMatches: true,
        parity: true,
      },
      {
        route: '/herbs/alias/',
        publicationReason: 'redirect-source',
        sitemapIncluded: false,
        emittedNoindex: true,
        redirectSource: true,
        parity: true,
      },
    ],
  }
  const routeTruth = {
    '/guides/current/': {
      exists: true,
      redirectSource: false,
      noindex: false,
      canonicalRoute: '/guides/current/',
      selfCanonical: true,
      sitemapIncluded: true,
    },
    '/old-guide/': { exists: false, redirectSource: true },
    '/utility/': {
      exists: true,
      redirectSource: false,
      noindex: true,
      canonicalRoute: '/utility/',
      selfCanonical: true,
      sitemapIncluded: false,
    },
  }

  const observation = (url, hasQuery = false) => ({ url, hasQuery })

  expect(classifyPublicationState(observation('https://thehippiescientist.net/herbs/published/'), publicationTruth, routeTruth))
    .toBe('CURRENT_PUBLISHED')
  expect(classifyPublicationState(observation('https://thehippiescientist.net/herbs/held/'), publicationTruth, routeTruth))
    .toBe('INTENTIONAL_NOINDEX')
  expect(classifyPublicationState(observation('https://thehippiescientist.net/herbs/alias/'), publicationTruth, routeTruth))
    .toBe('REDIRECT_SOURCE')
  expect(classifyPublicationState(observation('https://thehippiescientist.net/guides/current/'), publicationTruth, routeTruth))
    .toBe('CURRENT_PUBLISHED')
  expect(classifyPublicationState(observation('https://thehippiescientist.net/old-guide/'), publicationTruth, routeTruth))
    .toBe('REDIRECT_SOURCE')
  expect(classifyPublicationState(observation('https://thehippiescientist.net/utility/'), publicationTruth, routeTruth))
    .toBe('INTENTIONAL_NOINDEX')
  expect(classifyPublicationState(observation('https://thehippiescientist.net/ghost/'), publicationTruth, routeTruth))
    .toBe('HISTORICAL_OR_UNBUILT')
  expect(classifyPublicationState(observation('https://thehippiescientist.net/compare/', true), publicationTruth, routeTruth))
    .toBe('QUERY_PARAMETER_VARIANT')
})

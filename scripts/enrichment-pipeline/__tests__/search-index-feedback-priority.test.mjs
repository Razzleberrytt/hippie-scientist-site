import { expect, test } from 'vitest'

import {
  buildPriorityContext,
  loadPriorityConfig,
  scoreEntity,
} from '../lib/priority.mjs'

function baseRow(slug = 'fennel') {
  return {
    slug,
    runtime_export_decision: 'full_public_runtime',
    public_search_visibility: 'public',
    seo_indexing_recommendation: 'index',
    ai_retrieval_priority: 'moderate',
    semantic_priority: 'moderate',
    discovery_weight: 5,
    authority_score: 5,
    recommendation_weight: 5,
    contraindications_or_flags: 'Present',
    runtime_safety: 'Present',
    safety_notes: 'Present',
    primary_effects_or_targets: 'Present',
    mechanism_summary: '',
    evidence_tier: '',
    summary: '',
    description: 'Present',
    keywords: 'Present',
    latin_name: 'Present',
  }
}

function canonicalFor(row) {
  return {
    bySlug: new Map([[row.slug, { row }]]),
    maintenanceRows: [],
  }
}

function contextFor(row, observations) {
  return buildPriorityContext(
    canonicalFor(row),
    {
      seoPriority: {},
      searchIndexObservations: { version: 1, observations },
    },
    loadPriorityConfig({ force: true }),
  )
}

test('content-quality rejection becomes an enrichment value signal without mutating publication data', () => {
  const row = baseRow()
  const rejectedContext = contextFor(row, [
    {
      engine: 'bing',
      status: 'content_quality',
      url: 'https://thehippiescientist.net/herbs/fennel/',
      observed_at: '2026-08-25',
      active: true,
    },
  ])
  const unobservedContext = contextFor(row, [])

  const rejected = scoreEntity({ row, slug: row.slug, completenessDeficit: 0.3 }, rejectedContext)
  const unobserved = scoreEntity({ row, slug: row.slug, completenessDeficit: 0.3 }, unobservedContext)

  expect(rejected.signals.search_index_feedback).toBe(1)
  expect(rejected.signalsUsed).toContain('search_index_feedback')
  expect(rejected.score).toBeGreaterThan(unobserved.score)
  expect(row.seo_indexing_recommendation).toBe('index')
})

test('entities without feedback preserve the exact legacy signal ratios after renormalization', () => {
  const row = baseRow('baseline')
  const config = loadPriorityConfig({ force: true })
  const currentContext = buildPriorityContext(canonicalFor(row), { seoPriority: {} }, config)
  const current = scoreEntity({ row, slug: row.slug, completenessDeficit: 0.3 }, currentContext)

  const legacyConfig = structuredClone(config)
  delete legacyConfig.weights.search_index_feedback
  delete legacyConfig.signals.search_index_feedback
  for (const name of Object.keys(legacyConfig.weights)) {
    legacyConfig.weights[name] = legacyConfig.weights[name] / 0.92
  }
  const legacyContext = buildPriorityContext(canonicalFor(row), { seoPriority: {} }, legacyConfig)
  const legacy = scoreEntity({ row, slug: row.slug, completenessDeficit: 0.3 }, legacyContext)

  expect(current.signals.search_index_feedback).toBeNull()
  expect(current.score).toBe(legacy.score)
})

test('latest active profile observation wins and non-profile URLs do not enter entity priority', () => {
  const row = baseRow('quercetin')
  const context = contextFor(row, [
    {
      engine: 'bing',
      status: 'content_quality',
      url: 'https://thehippiescientist.net/compounds/quercetin/',
      observed_at: '2026-08-20',
      active: true,
    },
    {
      engine: 'bing',
      status: 'indexed',
      url: 'https://thehippiescientist.net/compounds/quercetin/',
      observed_at: '2026-08-25',
      active: true,
    },
    {
      engine: 'bing',
      status: 'content_quality',
      url: 'https://thehippiescientist.net/compounds/quercetin/',
      observed_at: '2026-08-26',
      active: false,
    },
    {
      engine: 'bing',
      status: 'content_quality',
      url: 'https://thehippiescientist.net/goals/pain/',
      observed_at: '2026-08-25',
      active: true,
    },
  ])

  expect(context.searchIndexFeedback.get('quercetin')).toMatchObject({
    score: 0,
    status: 'indexed',
    observedAt: '2026-08-25',
  })
  expect(context.searchIndexFeedback.has('pain')).toBe(false)
})

test('explicit slug cannot bypass exact herb/compound profile URL validation', () => {
  const row = baseRow('pain')
  const context = contextFor(row, [
    {
      slug: 'pain',
      engine: 'bing',
      status: 'content_quality',
      url: 'https://thehippiescientist.net/goals/pain/',
      observed_at: '2026-08-25',
      active: true,
    },
    {
      slug: 'pain',
      engine: 'bing',
      status: 'content_quality',
      url: 'https://thehippiescientist.net/herbs/fennel/',
      observed_at: '2026-08-25',
      active: true,
    },
  ])

  expect(context.searchIndexFeedback.has('pain')).toBe(false)
})

test('equal-date observations conservatively keep the stronger rejection', () => {
  const row = baseRow('sage')
  const context = contextFor(row, [
    {
      engine: 'bing',
      status: 'not_yet_crawled',
      url: 'https://thehippiescientist.net/herbs/sage/',
      observed_at: '2026-08-25',
      active: true,
    },
    {
      engine: 'bing',
      status: 'discovered_but_not_in_index',
      url: 'https://thehippiescientist.net/herbs/sage/',
      observed_at: '2026-08-25',
      active: true,
    },
  ])

  expect(context.searchIndexFeedback.get('sage')).toMatchObject({
    score: 0.8,
    status: 'discovered_but_not_in_index',
  })
})

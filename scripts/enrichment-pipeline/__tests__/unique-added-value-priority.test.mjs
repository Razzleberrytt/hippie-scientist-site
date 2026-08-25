import { expect, test } from 'vitest'

import {
  buildPriorityContext,
  loadPriorityConfig,
  scoreEntity,
} from '../lib/priority.mjs'

function baseRow(overrides = {}) {
  return {
    slug: 'fixture',
    runtime_export_decision: 'primary_runtime_priority',
    public_search_visibility: 'public',
    seo_indexing_recommendation: 'primary_index',
    ai_retrieval_priority: 'highest',
    semantic_priority: 'highest',
    discovery_weight: 10,
    authority_score: 10,
    recommendation_weight: 10,
    contraindications_or_flags: 'Present',
    runtime_safety: 'Present',
    safety_notes: 'Present',
    primary_effects_or_targets: 'Present',
    mechanism_summary: 'Present',
    evidence_tier: 'Present',
    summary: 'Present',
    description: 'Present',
    keywords: 'Present',
    latin_name: 'Present',
    ...overrides,
  }
}

function score(row) {
  const canonical = {
    bySlug: new Map([[row.slug, { row }]]),
    maintenanceRows: [],
  }
  const context = buildPriorityContext(canonical, { seoPriority: {} }, loadPriorityConfig({ force: true }))
  return scoreEntity({ row, slug: row.slug, completenessDeficit: 0.2 }, context)
}

test('differentiated evidence and safety gaps outrank commodity metadata gaps', () => {
  const differentiated = score(baseRow({
    runtime_safety: '',
    contraindications_or_flags: '',
    mechanism_summary: '',
  }))
  const commodity = score(baseRow({
    keywords: '',
    latin_name: '',
  }))

  expect(differentiated.signals.unique_added_value).toBeGreaterThan(commodity.signals.unique_added_value)
  expect(differentiated.score).toBeGreaterThan(commodity.score)
  expect(differentiated.signalsUsed).toContain('unique_added_value')
})

test('fully covered differentiated fields contribute zero unique-added-value deficit', () => {
  const result = score(baseRow())
  expect(result.signals.unique_added_value).toBe(0)
})

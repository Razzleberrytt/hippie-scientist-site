import { loadContract } from '../lib/contract.mjs'

/**
 * Synthetic canonical fixtures.
 *
 * These mirror the shape `loadCanonical()` returns so validators, the scanner,
 * and the importer can be exercised without opening the 2 MB binary workbook —
 * and, more importantly, without any test having a handle on the real canonical
 * source at all.
 */

const contract = loadContract()

const BASE_ROW = Object.fromEntries([...contract.fields.keys()].map((name) => [name, '']))

export function makeRow(overrides = {}) {
  return { ...BASE_ROW, ...overrides }
}

export function makeCanonical(rows, { entitySheet = 'Entity_Master', duplicateSlugs = [] } = {}) {
  const bySlug = new Map()
  rows.forEach((row, index) => {
    bySlug.set(String(row.slug).toLowerCase(), { row, rowNumber: index + 2, index })
  })
  return {
    workbookPath: '(fixture)',
    entitySheet,
    sheetNames: [entitySheet, 'Evidence_Register', 'Source_Register', 'Maintenance_Queue'],
    columns: [...contract.fields.keys()],
    entityRows: rows,
    bySlug,
    duplicateSlugs,
    evidenceRows: [],
    sourceRows: [],
    relationshipRows: [],
    maintenanceRows: [],
    unresolvedGapRows: [],
  }
}

/** A published herb with an empty latin_name — the canonical automatic case. */
export function publishedHerb(overrides = {}) {
  return makeRow({
    entity_type: 'herb',
    slug: 'fixture-herb',
    name: 'Fixture Herb',
    class_or_domain: 'stress',
    primary_effects_or_targets: 'stress-response',
    mechanism_summary: 'HPA-axis modulation',
    canonical_pathways: 'Stress Response',
    evidence_grade: 'b',
    evidence_tier: 'Moderate Human Evidence',
    confidence_tier: 'moderate',
    summary: 'A fixture used by the enrichment pipeline tests.',
    safety_notes: 'Generally well tolerated in the studied populations.',
    contraindications_or_flags: 'Pregnancy',
    dosage_or_preferred_form: 'Studied at 300 mg/day of a standardized extract.',
    runtime_safety: 'Some caution advised.',
    runtime_export_decision: 'full_public_runtime',
    public_search_visibility: 'public',
    seo_indexing_recommendation: 'index',
    ai_retrieval_priority: 'moderate',
    semantic_priority: 'moderate',
    profile_status: 'commercial_ready',
    publish_status: 'publishable',
    runtime_class: 'grounded_secondary',
    discovery_weight: '45',
    authority_score: '30',
    recommendation_weight: '22',
    ...overrides,
  })
}

export function makeJob(overrides = {}) {
  return {
    job_id: 'job_fixture0000001',
    entity_type: 'herb',
    slug: 'fixture-herb',
    name: 'Fixture Herb',
    sheet: 'Entity_Master',
    row_number: 2,
    mode: 'automatic',
    field_group: null,
    requested_fields: ['latin_name'],
    field_priority: 'P2',
    priority: 'P2',
    score: 60,
    value_signals: ['runtime_visibility'],
    risk_band: 'P4',
    risk_reasons: [],
    requires_human_review: false,
    reasons: { latin_name: 'missing' },
    current_values: { latin_name: '' },
    budget: { max_sources_examined: 4, max_new_sources: 2, stop_when_supported: true, prefer_existing_sources: true },
    status: 'pending',
    ...overrides,
  }
}

export function makeCandidate(overrides = {}) {
  return {
    candidate_version: 1,
    candidate_id: 'cand_fixture000001',
    job_id: 'job_fixture0000001',
    worker: 'test-worker',
    created_at: '2026-01-01T00:00:00.000Z',
    entity: { type: 'herb', slug: 'fixture-herb', sheet: 'Entity_Master' },
    requested_fields: ['latin_name'],
    changes: [
      {
        field: 'latin_name',
        operation: 'set',
        current_value: '',
        proposed_value: 'Withania somnifera',
        confidence: 'high',
        evidence_level: 'regulatory-monograph',
        source_ids: ['powo-1'],
        rationale: 'Accepted name per Plants of the World Online.',
      },
    ],
    sources: [
      {
        id: 'powo-1',
        class: 'reference-database-authority',
        url: 'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1',
        title: 'Withania somnifera (L.) Dunal',
        year: 2024,
      },
    ],
    provenance: {
      job_id: 'job_fixture0000001',
      requested_fields: ['latin_name'],
      budget: {},
      sources_examined: 1,
      sources_reused: 0,
      sources_new: 1,
      cache_hits: 0,
      external_research_required: true,
      tool: 'test-worker',
      notes: '',
    },
    ...overrides,
  }
}

export { contract }

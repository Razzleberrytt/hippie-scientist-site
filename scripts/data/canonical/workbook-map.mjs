// Workbook → canonical mapping.
//
// Pure, deterministic transform from parsed workbook sheets into canonical
// entities / claims / edges / sources. No filesystem writes here — the caller
// (migrate-workbook.mjs) handles IO, staging, and reporting.
//
// Guiding rules:
// - Preserve every column. Anything without a clean destination goes to `legacy`.
// - Deterministic IDs so re-running is idempotent.
// - Full provenance: sheet + row + column preserved on every record.
// - Canonical keeps ALL rows (governance/runtime filtering happens later in the
//   export adapter, never here).

import { entityId, claimId, edgeId, sourceId } from './ids.mjs'
import {
  cleanString,
  isEmpty,
  splitList,
  dedupeStrings,
  slugify,
  parseNumber,
  normalizeEvidenceLevel,
} from './normalize.mjs'

const FIXED_TS = '2026-06-01T00:00:00.000Z'

// Columns of Entity_Master that map to first-class envelope/data fields. Every
// other column is preserved under `legacy`.
const ENTITY_MAPPED_COLUMNS = new Set([
  'entity_type', 'slug', 'name', 'latin_name', 'summary', 'description',
])

const EDGE_TYPE_MAP = {
  contains_compound: 'contains_compound',
  'direct herb-compound map': 'contains_compound',
  'pathway-overlap': 'pathway_overlap',
  'mechanism-overlap': 'mechanism_overlap',
}

// Split on the same delimiters the workbook build uses ([\n|;,]) and dedupe
// case-insensitively, so mechanism synonyms tokenize identically downstream.
function splitDelimited(values) {
  const parts = (Array.isArray(values) ? values : [values]).flatMap((v) =>
    cleanString(v)
      .split(/[\n|;,]+/)
      .map((s) => cleanString(s).replace(/^[-*•]\s*/, ''))
      .filter(Boolean),
  )
  return dedupeStrings(parts)
}

function provenance(sheet, row, column) {
  return { source: 'workbook', source_ref: `${sheet}!row${row}${column ? `:${column}` : ''}`, migrated_from: { sheet, row, column: column || undefined }, at: FIXED_TS }
}

function baseTimestamps(overrides = {}) {
  return { created_at: FIXED_TS, updated_at: FIXED_TS, ...overrides }
}

// ---- Entity_Master → herb/compound entities ----

function mapEntityRow(row, rowIndex, sheetName) {
  const entityType = cleanString(row.entity_type).toLowerCase()
  if (entityType !== 'herb' && entityType !== 'compound') return null

  const name = cleanString(row.name)
  const slug = cleanString(row.slug) || slugify(name)
  if (!slug || !name) return null

  const id = entityId(entityType, slug)
  const aliases = dedupeStrings([
    ...(row.latin_name ? [cleanString(row.latin_name)] : []),
  ])

  // Everything not in the mapped set is preserved under legacy (verbatim,
  // non-empty only, to keep files lean but lossless).
  const legacy = {}
  const data = {}
  for (const [key, value] of Object.entries(row)) {
    if (ENTITY_MAPPED_COLUMNS.has(key)) continue
    if (isEmpty(value)) continue
    legacy[key] = value
  }
  // Promote a curated subset of high-value columns into structured `data`
  // (still also available in legacy for lossless round-trip is unnecessary —
  // these are removed from legacy to avoid duplication).
  const promote = {
    latin_name: 'latin_name',
    class_or_domain: 'class_or_domain',
    primary_effects_or_targets: 'primary_effects',
    secondary_effects: 'secondary_effects',
    mechanism_summary: 'mechanism_summary',
    canonical_pathways: 'canonical_pathways',
    evidence_grade: 'evidence_grade',
    evidence_tier: 'evidence_tier',
    confidence_tier: 'confidence_tier',
    safety_notes: 'safety_notes',
    contraindications_or_flags: 'contraindications',
    dosage_or_preferred_form: 'dosage',
    tags: 'tags',
    keywords: 'keywords',
    runtime_export_decision: 'runtime_export_decision',
    public_search_visibility: 'public_search_visibility',
    seo_indexing_recommendation: 'seo_indexing_recommendation',
    controlled_substance: 'controlled_substance',
    legal_status: 'legal_status',
    governance_status: 'governance_status',
    topic_ecosystems: 'topic_ecosystems',
    canonical_ecosystem: 'canonical_ecosystem',
  }
  for (const [col, target] of Object.entries(promote)) {
    if (!isEmpty(row[col])) {
      data[target] = cleanString(row[col])
      delete legacy[col]
    }
  }

  return {
    id,
    entity_type: entityType,
    canonical_name: name,
    slug,
    aliases,
    description: cleanString(row.summary || row.description),
    review_status: 'approved',
    ...baseTimestamps(),
    provenance: [provenance(sheetName, rowIndex + 1)],
    data,
    legacy,
  }
}

// ---- Source_Register → sources.jsonl ----

function mapSourceRow(row, rowIndex, sheetName) {
  const pmid = cleanString(row.pmid)
  const doi = cleanString(row.doi)
  const url = cleanString(row.url)
  const title = cleanString(row.title)
  const year = cleanString(row.year)
  if (!pmid && !doi && !url && !title) return null

  const id = sourceId({ pmid, doi, url, title, year })
  const legacy = {}
  for (const key of ['source_table', 'source_id', 'related_ids', 'entity_slugs', 'status', 'date_retrieved']) {
    if (!isEmpty(row[key])) legacy[key] = cleanString(row[key])
  }

  return {
    id,
    pmid: pmid || undefined,
    doi: doi || undefined,
    url: url || undefined,
    title,
    author_or_label: cleanString(row.author_or_label),
    year: year || undefined,
    journal: cleanString(row.journal),
    used_for: cleanString(row.used_for),
    citation: cleanString(row.citation_or_note),
    review_status: 'approved',
    ...baseTimestamps(),
    provenance: [provenance(sheetName, rowIndex + 1)],
    legacy,
  }
}

// Build a source record from an Evidence_Register row's inline citation, when
// present, so claim.source_ids can resolve even if the source isn't in
// Source_Register.
function sourceFromEvidence(row, rowIndex, sheetName) {
  const pmid = cleanString(row.pmid)
  const doi = cleanString(row.doi)
  const url = cleanString(row.url_or_source)
  if (!pmid && !doi && !url) return null
  const id = sourceId({ pmid, doi, url, title: cleanString(row.entity_name) })
  return {
    id,
    pmid: pmid || undefined,
    doi: doi || undefined,
    url: url || undefined,
    title: cleanString(row.supported_claim_language) || cleanString(row.notes),
    author_or_label: '',
    year: undefined,
    journal: '',
    used_for: cleanString(row.evidence_type),
    citation: '',
    review_status: 'pending',
    ...baseTimestamps(),
    provenance: [provenance(sheetName, rowIndex + 1)],
    legacy: {},
  }
}

export function mapWorkbook(workbook) {
  const sheet = (name) => (workbook.Sheets?.[name] || [])
  const entitiesById = new Map()
  const sourcesById = new Map()
  const claimsById = new Map()
  const edgesById = new Map()
  const effectsById = new Map()
  const studiesById = new Map()
  const mechanismsById = new Map()
  const unmatched = { claims: [], edges: [] }

  // Entities
  const entityMasterName = workbook.SheetNames.find((n) => n === 'Entity_Master') || 'Entity_Master'
  sheet(entityMasterName).forEach((row, i) => {
    const entity = mapEntityRow(row, i, entityMasterName)
    if (entity && !entitiesById.has(entity.id)) entitiesById.set(entity.id, entity)
  })

  const slugToEntity = new Map()
  for (const entity of entitiesById.values()) slugToEntity.set(entity.slug.toLowerCase(), entity)

  // Sources (Source_Register)
  const sourceRegName = 'Source_Register'
  sheet(sourceRegName).forEach((row, i) => {
    const source = mapSourceRow(row, i, sourceRegName)
    if (source && !sourcesById.has(source.id)) sourcesById.set(source.id, source)
  })

  // Effect entity helper (derived, deterministic).
  function effectEntity(label, sheetName, rowIndex) {
    const name = cleanString(label)
    if (!name) return null
    const slug = slugify(name)
    const id = entityId('effect', slug)
    if (!effectsById.has(id)) {
      effectsById.set(id, {
        id,
        entity_type: 'effect',
        canonical_name: name,
        slug,
        aliases: [],
        description: '',
        review_status: 'pending',
        ...baseTimestamps(),
        provenance: [{ source: 'derived', source_ref: `${sheetName}!row${rowIndex + 1}:effect_or_condition`, at: FIXED_TS }],
        data: { derived: true },
        legacy: {},
      })
    }
    return effectsById.get(id)
  }

  // Claims + study entities from Evidence_Register
  const evidenceName = 'Evidence_Register'
  sheet(evidenceName).forEach((row, i) => {
    const subjectSlug = cleanString(row.entity_slug).toLowerCase()
    const subject = slugToEntity.get(subjectSlug)
    if (!subject) {
      unmatched.claims.push({ row: i + 1, entity_slug: cleanString(row.entity_slug), reason: 'subject slug not found' })
      return
    }
    // study entity
    const recordId = cleanString(row.record_id)
    let study = null
    if (recordId) {
      const sid = entityId('study', recordId)
      if (!studiesById.has(sid)) {
        studiesById.set(sid, {
          id: sid,
          entity_type: 'study',
          canonical_name: cleanString(row.study_type) ? `${row.study_type}: ${row.entity_name} / ${row.effect_or_condition}` : recordId,
          slug: slugify(recordId),
          aliases: [],
          description: cleanString(row.notes),
          review_status: 'pending',
          ...baseTimestamps(),
          provenance: [provenance(evidenceName, i + 1)],
          data: {
            study_type: cleanString(row.study_type),
            population: cleanString(row.population),
            sample_size: parseNumber(row.sample_size),
            dose_or_duration: cleanString(row.dose_or_duration),
            pmid: cleanString(row.pmid),
            doi: cleanString(row.doi),
            evidence_grade: cleanString(row.evidence_grade),
          },
          legacy: {},
        })
      }
      study = studiesById.get(sid)
    }

    // inline source
    const inlineSource = sourceFromEvidence(row, i, evidenceName)
    const sourceIds = []
    if (inlineSource) {
      if (!sourcesById.has(inlineSource.id)) sourcesById.set(inlineSource.id, inlineSource)
      sourceIds.push(inlineSource.id)
    }

    const effect = effectEntity(row.effect_or_condition, evidenceName, i)
    const claim = {
      subject_id: subject.id,
      predicate: 'supports_outcome',
      object_id: effect ? effect.id : undefined,
      object_literal: effect ? undefined : cleanString(row.effect_or_condition) || 'unspecified',
      qualifiers: {
        population: cleanString(row.population) || undefined,
        dose_or_duration: cleanString(row.dose_or_duration) || undefined,
        direction: cleanString(row.direction_or_claim_tier) || undefined,
        study_id: study ? study.id : undefined,
      },
      source_ids: sourceIds,
      evidence_level: normalizeEvidenceLevel(row.evidence_type || row.human_or_preclinical),
      confidence: 0.5,
      review_status: 'pending',
      notes: cleanString(row.supported_claim_language) || cleanString(row.notes),
      ...baseTimestamps(),
      provenance: [provenance(evidenceName, i + 1)],
      legacy: {},
    }
    // prune undefined qualifiers
    claim.qualifiers = Object.fromEntries(Object.entries(claim.qualifiers).filter(([, v]) => v !== undefined))
    claim.id = claimId(claim)
    if (!claimsById.has(claim.id)) claimsById.set(claim.id, claim)
  })

  // Canonical mechanism taxonomy → mechanism entities (Taxonomy_Rules rows with
  // source_table = 'Canonical_Mechanisms'). Carries category / class / target
  // system / synonyms used to normalize entity mechanisms during site export.
  const taxonomyName = 'Taxonomy_Rules'
  sheet(taxonomyName).forEach((row, i) => {
    const sourceTable = cleanString(row.source_table)
    if (sourceTable !== 'Canonical_Mechanisms' && sourceTable !== 'Canonical Mechanisms') return
    const label = cleanString(row.label_or_name || row.canonical_label || row.label || row.name)
    if (!label) return
    const slug = slugify(cleanString(row.key) || label)
    const id = entityId('mechanism', slug)
    if (mechanismsById.has(id)) return
    // synonyms mirror the workbook build: label + pipe-delimited rule_or_value +
    // alias_or_context, split on the same delimiters.
    const synonyms = splitDelimited([label, row.rule_or_value, row.alias_or_context])
    mechanismsById.set(id, {
      id,
      entity_type: 'mechanism',
      canonical_name: label,
      slug,
      aliases: synonyms.filter((s) => s.toLowerCase() !== label.toLowerCase()),
      description: cleanString(row.notes),
      review_status: 'approved',
      ...baseTimestamps(),
      provenance: [provenance(taxonomyName, i + 1)],
      data: {
        category: cleanString(row.category),
        mechanism_class: cleanString(row.mechanism_class || row.sub_category),
        target_system: cleanString(row.target_system),
        synonyms,
        derived: true,
      },
      legacy: {},
    })
  })

  // Edges from Entity_Relationships
  const relName = 'Entity_Relationships'
  sheet(relName).forEach((row, i) => {
    const fromSlug = cleanString(row.source_slug).toLowerCase()
    const toSlug = cleanString(row.target_slug).toLowerCase()
    const from = slugToEntity.get(fromSlug)
    const to = slugToEntity.get(toSlug)
    if (!from || !to) {
      unmatched.edges.push({ row: i + 1, source_slug: cleanString(row.source_slug), target_slug: cleanString(row.target_slug), reason: !from ? 'source not found' : 'target not found' })
      return
    }
    const rawType = cleanString(row.relationship_type).toLowerCase()
    const relType = EDGE_TYPE_MAP[rawType] || 'related_to'
    const edge = {
      from_id: from.id,
      rel_type: relType,
      to_id: to.id,
      direction: relType === 'pathway_overlap' || relType === 'mechanism_overlap' ? 'undirected' : 'directed',
      weight: parseNumber(row.weight_or_strength),
      confidence: undefined,
      source_ids: [],
      evidence_level: 'none',
      origin: 'explicit',
      review_status: 'pending',
      provenance: [provenance(relName, i + 1)],
      ...baseTimestamps(),
    }
    if (edge.weight === undefined) delete edge.weight
    delete edge.confidence
    edge.id = edgeId(edge)
    if (!edgesById.has(edge.id)) edgesById.set(edge.id, edge)
  })

  const entities = [
    ...entitiesById.values(),
    ...effectsById.values(),
    ...studiesById.values(),
    ...mechanismsById.values(),
  ]

  return {
    entities,
    claims: [...claimsById.values()],
    edges: [...edgesById.values()],
    sources: [...sourcesById.values()],
    reports: {
      unmatched,
      counts: {
        herbs: [...entitiesById.values()].filter((e) => e.entity_type === 'herb').length,
        compounds: [...entitiesById.values()].filter((e) => e.entity_type === 'compound').length,
        effects: effectsById.size,
        studies: studiesById.size,
        mechanisms: mechanismsById.size,
        sources: sourcesById.size,
        claims: claimsById.size,
        edges: edgesById.size,
      },
    },
  }
}

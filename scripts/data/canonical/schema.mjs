// Canonical data schemas (Zod).
//
// These are the stable contracts for every record in data/canonical/**. They
// are intentionally permissive about type-specific payload (kept in `data`) but
// strict about the shared envelope (id, type, timestamps, provenance) so the
// graph, SQLite build, and patch engine can rely on it.

import { z } from 'zod'

export const REVIEW_STATUSES = ['approved', 'pending', 'needs_review', 'deprecated']

export const EVIDENCE_LEVELS = [
  'human_rct',
  'human_obs',
  'preclinical',
  'traditional',
  'anecdotal',
  'none',
]

export const ENTITY_TYPES = [
  'herb',
  'compound',
  'effect',
  'condition',
  'mechanism',
  'study',
  'source',
  'safety_issue',
  'drug_interaction',
  'preparation',
]

export const EDGE_ORIGINS = ['explicit', 'derived', 'suggested']

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'must be an ISO datetime' })

// A single provenance entry — where a value came from.
export const provenanceEntrySchema = z.object({
  source: z.string().min(1), // e.g. "workbook", "patch:<id>", "derived"
  source_ref: z.string().optional(), // e.g. "Entity_Master!A42"
  migrated_from: z
    .object({
      sheet: z.string().optional(),
      row: z.number().optional(),
      column: z.string().optional(),
    })
    .optional(),
  at: isoDate.optional(),
  notes: z.string().optional(),
})

export const provenanceSchema = z.array(provenanceEntrySchema).default([])

// -------- Entities --------

export const entitySchema = z
  .object({
    id: z.string().regex(/^ent_[a-z_]+_[0-9a-f]{12}$/),
    entity_type: z.enum(ENTITY_TYPES),
    canonical_name: z.string().min(1),
    slug: z.string().min(1),
    aliases: z.array(z.string()).default([]),
    description: z.string().default(''),
    review_status: z.enum(REVIEW_STATUSES).default('pending'),
    created_at: isoDate,
    updated_at: isoDate,
    provenance: provenanceSchema,
    // Type-specific structured payload. Kept open so different entity types can
    // carry different fields without schema churn.
    data: z.record(z.string(), z.unknown()).default({}),
    // Anything that had no clean destination during migration/patching. Never
    // discarded — preserved verbatim here.
    legacy: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()

// -------- Claims --------

export const CLAIM_PREDICATES = [
  'affects_mechanism',
  'supports_outcome',
  'has_dosage',
  'has_safety_warning',
  'contraindicated_in',
  'interacts_with',
  'contains',
  'targets_condition',
  'other',
]

export const claimSchema = z
  .object({
    id: z.string().regex(/^clm_[0-9a-f]{12}$/),
    subject_id: z.string().min(1),
    predicate: z.enum(CLAIM_PREDICATES),
    object_id: z.string().optional(),
    object_literal: z.unknown().optional(),
    qualifiers: z.record(z.string(), z.unknown()).default({}),
    source_ids: z.array(z.string()).default([]),
    evidence_level: z.enum(EVIDENCE_LEVELS).default('none'),
    confidence: z.number().min(0).max(1).default(0.5),
    review_status: z.enum(REVIEW_STATUSES).default('pending'),
    notes: z.string().default(''),
    created_at: isoDate,
    updated_at: isoDate,
    provenance: provenanceSchema,
    legacy: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()
  .refine((claim) => claim.object_id != null || claim.object_literal != null, {
    message: 'claim must have either object_id or object_literal',
  })

// -------- Relationships / edges --------

export const EDGE_TYPES = [
  'contains_compound',
  'shares_compound',
  'shares_mechanism',
  'affects_effect',
  'targets_condition',
  'interacts_with',
  'pathway_overlap',
  'mechanism_overlap',
  'related_to',
  'has_safety_issue',
  'has_preparation',
  'other',
]

export const edgeSchema = z
  .object({
    id: z.string().regex(/^edg_[0-9a-f]{12}$/),
    from_id: z.string().min(1),
    rel_type: z.enum(EDGE_TYPES),
    to_id: z.string().min(1),
    direction: z.enum(['directed', 'undirected']).default('directed'),
    weight: z.number().optional(),
    confidence: z.number().min(0).max(1).optional(),
    source_ids: z.array(z.string()).default([]),
    evidence_level: z.enum(EVIDENCE_LEVELS).default('none'),
    origin: z.enum(EDGE_ORIGINS).default('explicit'),
    explanation: z.string().optional(),
    review_status: z.enum(REVIEW_STATUSES).default('pending'),
    provenance: provenanceSchema,
    created_at: isoDate,
    updated_at: isoDate,
  })
  .strict()
  .refine((edge) => edge.origin !== 'suggested' || (edge.explanation && edge.explanation.length > 0), {
    message: 'suggested edges must include an explanation',
  })

// -------- Sources --------

export const sourceSchema = z
  .object({
    id: z.string().regex(/^src_[0-9a-f]{12}$/),
    pmid: z.string().optional(),
    doi: z.string().optional(),
    url: z.string().optional(),
    title: z.string().default(''),
    author_or_label: z.string().default(''),
    year: z.union([z.string(), z.number()]).optional(),
    journal: z.string().default(''),
    used_for: z.string().default(''),
    citation: z.string().default(''),
    review_status: z.enum(REVIEW_STATUSES).default('pending'),
    created_at: isoDate,
    updated_at: isoDate,
    provenance: provenanceSchema,
    legacy: z.record(z.string(), z.unknown()).default({}),
  })
  .strict()

// -------- Patch (normalized) --------

export const PATCH_OPERATIONS = [
  'create_entity',
  'update_field',
  'add_alias',
  'add_claim',
  'update_claim',
  'add_relationship',
  'update_relationship',
  'add_source',
  'add_safety_warning',
  'add_drug_interaction',
  'deprecate',
  'merge_candidates',
]

export const patchOperationSchema = z
  .object({
    op: z.enum(PATCH_OPERATIONS),
    // Free-form payload validated per-op at apply time. Kept open so different
    // operations carry different shapes.
    field: z.string().optional(),
    value: z.unknown().optional(),
    payload: z.record(z.string(), z.unknown()).default({}),
    confidence: z.number().min(0).max(1).optional(),
    notes: z.string().optional(),
  })
  .strict()

export const patchSourceSchema = z.object({
  pmid: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
  year: z.union([z.string(), z.number()]).optional(),
})

export const normalizedPatchSchema = z
  .object({
    patch_id: z.string().min(1),
    patch_version: z.string().default('1'),
    created_at: isoDate,
    generator: z.string().optional(),
    target: z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
      canonical_name: z.string().optional(),
      alias: z.string().optional(),
      entity_type: z.enum(ENTITY_TYPES).optional(),
    }),
    operations: z.array(patchOperationSchema).min(1),
    sources: z.array(patchSourceSchema).default([]),
    notes: z.string().default(''),
    confidence: z.number().min(0).max(1).default(0.5),
    requires_review: z.boolean().default(true),
    original_filename: z.string().default(''),
    original_hash: z.string().default(''),
  })
  .strict()

export const SCHEMAS = {
  entity: entitySchema,
  claim: claimSchema,
  edge: edgeSchema,
  source: sourceSchema,
  patch: normalizedPatchSchema,
}

// Validate an array of records against a schema, returning {valid, errors}
// rather than throwing, so callers can aggregate a full report.
export function validateAll(schema, records, label = 'record') {
  const errors = []
  const valid = []
  records.forEach((record, index) => {
    const result = schema.safeParse(record)
    if (result.success) {
      valid.push(result.data)
    } else {
      errors.push({
        index,
        id: record?.id ?? record?.patch_id ?? `(${label} #${index})`,
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }
  })
  return { valid, errors }
}

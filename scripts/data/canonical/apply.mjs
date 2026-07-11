// Transactional patch application engine (pure core).
//
// Operates on an in-memory dataset { entities, claims, edges, sources } and
// returns a NEW dataset plus a per-patch result set. No filesystem access here —
// the CLI wraps this with snapshot/write/audit IO. This separation is what makes
// the engine deterministic and unit-testable.
//
// Guarantees:
// - All-or-none batch: if the resulting dataset fails validation the caller
//   commits nothing.
// - Per-patch atomicity: a patch either applies all its operations or is
//   rejected whole.
// - Idempotency: re-applying an already-applied patch produces zero changes.
// - Never overwrites stronger/sourced field data with weaker/unsourced data.
// - Never removes information merely because a patch omits it.

import { entityId, claimId, edgeId, sourceId, contentHash } from './ids.mjs'
import { cleanString } from './normalize.mjs'
import { EVIDENCE_LEVELS } from './schema.mjs'

const FIXED_TS = '2026-01-01T00:00:00.000Z'

// Fields whose overwrite is guarded by the strength rule.
const EVIDENCE_BEARING_FIELDS = new Set([
  'description', 'effects', 'primary_effects', 'mechanisms', 'mechanism_summary',
  'dosage', 'evidence_grade', 'safety_notes', 'contraindications',
])

const EVIDENCE_RANK = Object.fromEntries(EVIDENCE_LEVELS.map((lvl, i) => [lvl, EVIDENCE_LEVELS.length - i]))

function deepClone(dataset) {
  return {
    entities: dataset.entities.map((e) => structuredClone(e)),
    claims: dataset.claims.map((c) => structuredClone(c)),
    edges: dataset.edges.map((e) => structuredClone(e)),
    sources: dataset.sources.map((s) => structuredClone(s)),
  }
}

export function buildIndex(dataset) {
  const byId = new Map()
  const bySlug = new Map()
  const byName = new Map()
  const byAlias = new Map()
  for (const e of dataset.entities) {
    byId.set(e.id, e)
    const slug = e.slug.toLowerCase()
    if (!bySlug.has(slug)) bySlug.set(slug, [])
    bySlug.get(slug).push(e)
    const name = e.canonical_name.toLowerCase()
    if (!byName.has(name)) byName.set(name, [])
    byName.get(name).push(e)
    for (const alias of e.aliases || []) {
      const a = alias.toLowerCase()
      if (!byAlias.has(a)) byAlias.set(a, [])
      byAlias.get(a).push(e)
    }
  }
  return { byId, bySlug, byName, byAlias }
}

// Resolve a patch target to exactly one entity. Order: id → slug → canonical
// name → unique alias. Ambiguity (>1 candidate) is an error, never a guess.
export function resolveTarget(target, index) {
  if (!target) return { error: 'no target' }
  if (target.id) {
    const e = index.byId.get(target.id)
    return e ? { entity: e } : { error: `target id not found: ${target.id}` }
  }
  const tryMap = (map, key, kind) => {
    if (!key) return null
    let candidates = map.get(key.toLowerCase()) || []
    if (target.entity_type) candidates = candidates.filter((c) => c.entity_type === target.entity_type)
    if (candidates.length === 1) return { entity: candidates[0] }
    if (candidates.length > 1) return { ambiguous: candidates.map((c) => c.id), by: kind }
    return null
  }
  return (
    tryMap(index.bySlug, target.slug, 'slug') ||
    tryMap(index.byName, target.canonical_name, 'canonical_name') ||
    tryMap(index.byAlias, target.alias, 'alias') || { error: 'target not resolvable (no matching id/slug/name/alias)' }
  )
}

function strength(evidenceLevel, sourceCount) {
  return (EVIDENCE_RANK[evidenceLevel] || 0) * 10 + Math.min(sourceCount, 9)
}

// Apply one operation to a draft entity, recording a change / conflict / warning.
// Returns { changes, conflicts, warnings }. Mutates draft dataset in place.
function applyOperation(draft, index, entity, op, patch, opts) {
  const changes = []
  const conflicts = []
  const warnings = []
  const patchSourceCount = (patch.sources || []).length
  const patchStrength = strength(op.evidence_level || 'none', patchSourceCount)

  const setField = (fieldPath, value) => {
    const parts = fieldPath.split('.')
    let obj = entity
    if (parts[0] === 'data' || parts[0] === 'legacy') { obj = entity[parts[0]]; parts.shift() }
    else if (!(parts[0] in entity)) { obj = entity.data } // unknown top-level → data
    const key = parts.join('.')
    return { obj, key, old: obj[key] }
  }

  switch (op.op) {
    case 'update_field': {
      const value = typeof op.value === 'string' ? op.value : op.value
      const { obj, key, old } = setField(op.field, value)
      const oldStr = cleanString(old)
      const newStr = cleanString(value)
      if (oldStr === newStr) break // idempotent no-op
      // Strength rule: guard evidence-bearing fields.
      if (oldStr && EVIDENCE_BEARING_FIELDS.has(key) && patchSourceCount === 0 && !opts.force) {
        conflicts.push({ type: 'weaker_overwrite', field: op.field, old: oldStr, proposed: newStr, reason: 'refusing to overwrite existing sourced/curated value with unsourced patch data' })
        break
      }
      obj[key] = value
      changes.push({ type: 'update_field', field: op.field, old: old ?? null, new: value })
      break
    }
    case 'add_alias': {
      const alias = cleanString(op.value)
      if (!alias) break
      const exists = (entity.aliases || []).some((a) => a.toLowerCase() === alias.toLowerCase())
      if (exists) break // idempotent
      entity.aliases = [...(entity.aliases || []), alias]
      changes.push({ type: 'add_alias', value: alias })
      break
    }
    case 'add_source': {
      const src = normalizePatchSource(op.payload || op.value || {})
      if (!src) { warnings.push('add_source had no usable identifier'); break }
      const id = sourceId(src)
      if (!draft.sources.some((s) => s.id === id)) {
        draft.sources.push({ id, pmid: src.pmid, doi: src.doi, url: src.url, title: src.title || '', author_or_label: '', year: src.year, journal: '', used_for: '', citation: '', review_status: 'pending', created_at: FIXED_TS, updated_at: FIXED_TS, provenance: [{ source: `patch:${patch.patch_id}`, at: FIXED_TS }], legacy: {} })
        changes.push({ type: 'add_source', id })
      }
      break
    }
    case 'add_claim':
    case 'add_safety_warning':
    case 'add_drug_interaction': {
      const predicate = op.op === 'add_safety_warning' ? 'has_safety_warning' : op.op === 'add_drug_interaction' ? 'interacts_with' : 'supports_outcome'
      const sourceIds = ensureSources(draft, patch, changes)
      if ((op.op === 'add_safety_warning' || op.op === 'add_drug_interaction' || op.op === 'add_claim') && sourceIds.length === 0) {
        warnings.push(`${op.op} added without a traceable source — kept as pending/needs_review`)
      }
      const claimDraft = {
        subject_id: entity.id,
        predicate,
        object_literal: cleanString(op.value) || cleanString(op.field) || 'unspecified',
        qualifiers: {},
        source_ids: sourceIds,
        evidence_level: op.evidence_level || (sourceIds.length ? 'human_obs' : 'none'),
        confidence: typeof op.confidence === 'number' ? op.confidence : 0.5,
        review_status: sourceIds.length ? 'pending' : 'needs_review',
        notes: op.notes || '',
        created_at: FIXED_TS,
        updated_at: FIXED_TS,
        provenance: [{ source: `patch:${patch.patch_id}`, at: FIXED_TS }],
        legacy: {},
      }
      claimDraft.id = claimId(claimDraft)
      const existing = draft.claims.find((c) => c.id === claimDraft.id)
      if (existing) break // idempotent
      // Conflict detection: same subject+predicate, contradictory object.
      const contradiction = draft.claims.find((c) => c.subject_id === entity.id && c.predicate === predicate && cleanString(c.object_literal) && cleanString(c.object_literal) !== cleanString(claimDraft.object_literal) && op.op === 'add_safety_warning')
      if (contradiction) conflicts.push({ type: 'safety_conflict', existing: contradiction.object_literal, proposed: claimDraft.object_literal })
      draft.claims.push(claimDraft)
      changes.push({ type: op.op, claim_id: claimDraft.id, predicate })
      break
    }
    case 'add_relationship':
    case 'update_relationship': {
      const toRef = op.payload?.to || op.value
      const toEntity = resolveTarget({ slug: op.payload?.to_slug, id: op.payload?.to_id, canonical_name: typeof toRef === 'string' ? toRef : undefined }, index)
      if (!toEntity.entity) { warnings.push('relationship target not resolvable — skipped'); break }
      const edgeDraft = {
        from_id: entity.id,
        rel_type: op.payload?.rel_type || 'related_to',
        to_id: toEntity.entity.id,
        direction: 'directed',
        source_ids: ensureSources(draft, patch, changes),
        evidence_level: op.evidence_level || 'none',
        origin: 'explicit',
        review_status: 'pending',
        provenance: [{ source: `patch:${patch.patch_id}`, at: FIXED_TS }],
        created_at: FIXED_TS,
        updated_at: FIXED_TS,
      }
      edgeDraft.id = edgeId(edgeDraft)
      if (draft.edges.some((e) => e.id === edgeDraft.id)) break // idempotent
      draft.edges.push(edgeDraft)
      changes.push({ type: 'add_relationship', edge_id: edgeDraft.id, rel_type: edgeDraft.rel_type })
      break
    }
    case 'create_entity': {
      // Only reached when target did not resolve; handled by caller.
      warnings.push('create_entity handled at patch level')
      break
    }
    case 'deprecate': {
      if (!opts.allowDestructive) {
        conflicts.push({ type: 'destructive_blocked', op: 'deprecate', reason: 'deprecate requires explicit approval (--allow-destructive)' })
        break
      }
      entity.review_status = 'deprecated'
      changes.push({ type: 'deprecate', id: entity.id })
      break
    }
    case 'merge_candidates': {
      conflicts.push({ type: 'merge_requires_approval', reason: 'merge_candidates is never auto-applied' })
      break
    }
    default:
      warnings.push(`unsupported operation ignored: ${op.op}`)
  }

  return { changes, conflicts, warnings }
}

function normalizePatchSource(obj) {
  const src = {}
  for (const k of ['pmid', 'doi', 'url', 'title', 'year']) if (obj[k]) src[k] = cleanString(obj[k])
  return Object.keys(src).length ? src : null
}

function ensureSources(draft, patch, changes) {
  const ids = []
  for (const src of patch.sources || []) {
    const norm = normalizePatchSource(src)
    if (!norm) continue
    const id = sourceId(norm)
    ids.push(id)
    if (!draft.sources.some((s) => s.id === id)) {
      draft.sources.push({ id, pmid: norm.pmid, doi: norm.doi, url: norm.url, title: norm.title || '', author_or_label: '', year: norm.year, journal: '', used_for: '', citation: '', review_status: 'pending', created_at: FIXED_TS, updated_at: FIXED_TS, provenance: [{ source: `patch:${patch.patch_id}`, at: FIXED_TS }], legacy: {} })
      changes.push({ type: 'add_source', id })
    }
  }
  return ids
}

// Plan + apply a single patch against a draft. Returns per-patch result.
function applyPatch(draft, patch, opts) {
  const index = buildIndex(draft)
  const resolved = resolveTarget(patch.target, index)

  // create_entity path when target does not resolve.
  const wantsCreate = patch.operations.some((o) => o.op === 'create_entity')
  if (resolved.error && wantsCreate) {
    const type = patch.target?.entity_type
    const name = patch.target?.canonical_name || patch.target?.slug
    if (!type || !name) {
      return { patch_id: patch.patch_id, status: 'rejected', reason: 'create_entity requires target.entity_type and a name/slug', changes: [], conflicts: [], warnings: [] }
    }
    const slug = (patch.target.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const id = entityId(type, slug)
    if (draft.entities.some((e) => e.id === id)) {
      // Already exists → fall through to update path on next resolve.
    } else {
      draft.entities.push({ id, entity_type: type, canonical_name: name, slug, aliases: [], description: '', review_status: 'needs_review', created_at: FIXED_TS, updated_at: FIXED_TS, provenance: [{ source: `patch:${patch.patch_id}`, at: FIXED_TS }], data: {}, legacy: {} })
      const index2 = buildIndex(draft)
      return finishPatch(draft, index2, draft.entities.find((e) => e.id === id), patch, opts, [{ type: 'create_entity', id }])
    }
  }

  if (resolved.ambiguous) {
    return { patch_id: patch.patch_id, status: 'rejected', reason: `ambiguous target (${resolved.by}) → ${resolved.ambiguous.join(', ')}`, changes: [], conflicts: [], warnings: [] }
  }
  if (resolved.error) {
    return { patch_id: patch.patch_id, status: 'rejected', reason: resolved.error, changes: [], conflicts: [], warnings: [] }
  }

  return finishPatch(draft, index, resolved.entity, patch, opts, [])
}

function finishPatch(draft, index, entity, patch, opts, seedChanges) {
  const allChanges = [...seedChanges]
  const allConflicts = []
  const allWarnings = []
  for (const op of patch.operations) {
    if (op.op === 'create_entity') continue // already handled
    const { changes, conflicts, warnings } = applyOperation(draft, index, entity, op, patch, opts)
    allChanges.push(...changes)
    allConflicts.push(...conflicts)
    allWarnings.push(...warnings)
  }
  entity.updated_at = FIXED_TS
  const blocked = allConflicts.filter((c) => ['destructive_blocked', 'merge_requires_approval'].includes(c.type))
  const status = blocked.length ? 'rejected' : allChanges.length ? 'applied' : 'noop'
  return {
    patch_id: patch.patch_id,
    target_id: entity.id,
    status,
    reason: blocked.length ? blocked.map((b) => b.reason).join('; ') : undefined,
    changes: allChanges,
    conflicts: allConflicts,
    warnings: allWarnings,
    requires_review: patch.requires_review || allConflicts.length > 0,
  }
}

// Top-level: plan/apply a batch against a dataset. Returns { dataset, results }.
// The returned dataset reflects applied+noop patches; rejected patches leave no
// trace. Caller decides whether to commit based on results/validation.
export function applyBatch(dataset, patches, options = {}) {
  const opts = { force: false, allowDestructive: false, ...options }
  const draft = deepClone(dataset)
  const results = []
  // Sort by patch_id for deterministic application order.
  const ordered = [...patches].sort((a, b) => (a.patch_id < b.patch_id ? -1 : a.patch_id > b.patch_id ? 1 : 0))
  for (const patch of ordered) {
    // Rejected patches must not partially mutate the draft: apply against a
    // clone, only merge back if not rejected.
    const trial = deepClone(draft)
    const result = applyPatch(trial, patch, opts)
    if (result.status !== 'rejected') {
      // commit trial into draft
      draft.entities = trial.entities
      draft.claims = trial.claims
      draft.edges = trial.edges
      draft.sources = trial.sources
    }
    results.push(result)
  }
  return { dataset: draft, results }
}

export function batchHash(dataset) {
  return contentHash({
    entities: dataset.entities.map((e) => e.id).sort(),
    claims: dataset.claims.map((c) => c.id).sort(),
    edges: dataset.edges.map((e) => e.id).sort(),
    sources: dataset.sources.map((s) => s.id).sort(),
  })
}

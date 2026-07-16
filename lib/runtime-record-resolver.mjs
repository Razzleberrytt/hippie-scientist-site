import { CLUSTER_MEMBER_RUNTIME_DECISION } from '../config/cluster-member-runtime-trust.mjs'

const PLACEHOLDERS = new Set(['', '-', '--', 'n/a', 'na', 'none', 'null', 'tbd', 'unknown', 'undefined'])
const GENERIC_SAFETY = /^generally well tolerated(?: for most users)?\.?$/i
const SAFETY_ALIASES = new Set(['safety', 'runtime_safety', 'safetyNotes', 'safety_notes'])
const LIST_FIELDS = new Set([
  'contraindications',
  'interactions',
  'side_effects',
  'caution_signals',
  'indexability_reasons',
])
const CORE_OWNED_FIELDS = new Set([
  'id',
  'slug',
  'entityType',
  'runtime_export_decision',
  'safety',
  'contraindications',
  'interactions',
  'side_effects',
  'caution_signals',
  'pregnancy_warning',
  'evidence_grade',
  'evidence_tier',
  'indexability_status',
  'indexability_score',
  'indexability_reasons',
  'visibility_tier',
  'robots',
  'sitemap_included',
])

function text(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function canonicalField(field) {
  return SAFETY_ALIASES.has(field) ? 'safety' : field
}

export function isMeaningfulRuntimeValue(value, field = '') {
  const canonical = canonicalField(field)
  if (typeof value === 'string') {
    if (LIST_FIELDS.has(canonical)) return false
    const normalized = text(value)
    if (PLACEHOLDERS.has(normalized.toLowerCase())) return false
    if (canonical === 'safety' && GENERIC_SAFETY.test(normalized)) return false
    return true
  }
  if (Array.isArray(value)) {
    if (canonical === 'safety') return false
    if (LIST_FIELDS.has(canonical)) {
      return value.length > 0 && value.every(item => typeof item === 'string' && text(item) && !PLACEHOLDERS.has(text(item).toLowerCase()))
    }
    return value.length > 0
  }
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return typeof value === 'number' || typeof value === 'boolean'
}

export function normalizeRuntimeList(value) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  const output = []
  for (const item of value) {
    const normalized = text(item)
    const key = normalized.toLowerCase()
    if (!normalized || PLACEHOLDERS.has(key) || seen.has(key)) continue
    seen.add(key)
    output.push(normalized)
  }
  return output
}

export function resolveTrustValue(canonicalValue, localValue, options = {}) {
  const field = options.field || ''
  const localValid = isMeaningfulRuntimeValue(localValue, field)
  if (options.allowLocal === true && localValid) {
    return LIST_FIELDS.has(canonicalField(field)) ? normalizeRuntimeList(localValue) : localValue
  }
  if (isMeaningfulRuntimeValue(canonicalValue, field)) {
    return LIST_FIELDS.has(canonicalField(field)) ? normalizeRuntimeList(canonicalValue) : canonicalValue
  }
  return undefined
}

export function resolveRuntimeRecordLayers(base, layers = [], options = {}) {
  if (!base || typeof base !== 'object' || Array.isArray(base)) {
    throw new Error('Runtime inheritance requires a canonical core record')
  }

  const slug = text(base.slug)
  if (!slug) throw new Error('Runtime inheritance requires a canonical slug')

  const approved = new Set((options.approvedTrustOverrides || []).map(canonicalField))
  const resolved = { ...base }
  const isClusterMember = base.runtime_export_decision === CLUSTER_MEMBER_RUNTIME_DECISION

  for (const layer of layers) {
    if (!layer || typeof layer !== 'object' || Array.isArray(layer)) continue
    const layerSlug = text(layer.slug || layer.id)
    if (layerSlug && layerSlug !== slug) {
      throw new Error(`Runtime overlay ${layerSlug} does not match canonical slug ${slug}`)
    }

    for (const [field, value] of Object.entries(layer)) {
      const canonical = canonicalField(field)
      if (CORE_OWNED_FIELDS.has(canonical)) {
        if (!approved.has(canonical)) continue
        const next = resolveTrustValue(resolved[canonical], value, { field: canonical, allowLocal: true })
        if (next !== undefined) resolved[canonical] = next
        continue
      }
      if (!isMeaningfulRuntimeValue(value, field)) continue
      resolved[field] = value
    }
  }

  for (const field of LIST_FIELDS) {
    if (Array.isArray(resolved[field])) resolved[field] = normalizeRuntimeList(resolved[field])
  }

  // Cluster-member records require renderer aliases to inherit from the
  // canonical safety field. Non-cluster records keep their existing aliases,
  // while stale overlays are prevented from replacing canonical safety above.
  if (isClusterMember) {
    const safety = resolveTrustValue(undefined, resolved.safety || base.safety || base.runtime_safety, { field: 'safety', allowLocal: true })
    if (safety !== undefined) {
      resolved.safety = safety
      resolved.runtime_safety = safety
      resolved.safetyNotes = safety
      resolved.safety_notes = safety
    } else {
      delete resolved.safety
      delete resolved.runtime_safety
      delete resolved.safetyNotes
      delete resolved.safety_notes
    }
  }

  return resolved
}

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sourceId } from './ids.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const DEFAULT_APPLIED_PATCH_DIR = path.join(repoRoot, 'data', 'patches', 'applied')

const DOSE_TEXT_RE = /(?:\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|µg|ug|ml|iu)(?:\s*\/\s*(?:day|d))?\b|\b(?:dose|dosage|per day|\/day)\b)/i
const HUMAN_OPERATION_RE = /\b(?:humans?|adults?|participants?|patients?|subjects?|volunteers?|people|randomi[sz]ed|placebo[- ]controlled|crossover|clinical trial)\b/i
const EXPLICIT_NON_HUMAN_SOURCE_RE = /\b(?:in[ -]?vitro|animal|rodent|mouse|mice|rat|cell culture|mechanistic)\b/i
const SAFETY_FIELD_RE = /^(?:safety|safety_notes|runtime_safety|contraindications?|side_effects?|tolerability)$/i
const DOSE_FIELD_RE = /^(?:dose|dosage|typical_dosage|dosage_or_preferred_form|dose_or_duration)$/i
const INTERACTION_FIELD_RE = /^(?:interaction|interactions|drug_interaction|drug_interactions)$/i

function text(value) {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(text).join(' ')
  if (typeof value === 'object') return Object.values(value).map(text).join(' ')
  return ''
}

function normalizeField(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
}

function sourceText(source) {
  return text([
    source?.title,
    source?.citation,
    source?.studyType,
    source?.study_type,
    source?.design,
    source?.publicationType,
    source?.publication_type,
  ])
}

export function rolesForAppliedOperation(operation = {}) {
  const roles = new Set()
  const op = String(operation.op || '').trim().toLowerCase()
  const field = normalizeField(operation.field)

  if (op === 'add_safety_warning' || SAFETY_FIELD_RE.test(field)) roles.add('safety')
  if (op === 'add_drug_interaction' || INTERACTION_FIELD_RE.test(field)) roles.add('interaction')
  if (DOSE_FIELD_RE.test(field)) roles.add('dose')

  // Applied evidence patches attach their patch-level sources to the reviewed
  // operation. Preserve only relationship facts that are explicit in that
  // reviewed operation; this does not create a new scientific claim.
  const operationText = text([
    operation.value,
    operation.claim,
    operation.notes,
    operation.qualifiers,
    operation.payload,
  ])
  if (DOSE_TEXT_RE.test(operationText)) roles.add('dose')
  if (HUMAN_OPERATION_RE.test(operationText)) roles.add('human')

  return [...roles].sort()
}

export function buildAppliedPatchSourceRoleMap({ patchDir = DEFAULT_APPLIED_PATCH_DIR } = {}) {
  const roleMap = new Map()
  if (!fs.existsSync(patchDir)) return roleMap

  const files = fs.readdirSync(patchDir)
    .filter((name) => name.endsWith('.json'))
    .sort()

  for (const name of files) {
    let patch
    try {
      patch = JSON.parse(fs.readFileSync(path.join(patchDir, name), 'utf8'))
    } catch {
      continue
    }

    if (String(patch?._apply_result?.status || '').toLowerCase() !== 'applied') continue
    const roles = new Set((patch.operations || []).flatMap(rolesForAppliedOperation))
    if (!roles.size) continue

    for (const source of patch.sources || []) {
      if (!source || typeof source !== 'object') continue
      const id = sourceId(source)
      if (!id) continue
      const existing = roleMap.get(id) || new Set()
      const explicitlyNonHuman = EXPLICIT_NON_HUMAN_SOURCE_RE.test(sourceText(source))
      for (const role of roles) {
        // A reviewed human-context operation is useful provenance for ambiguous
        // human-study titles, but it must never launder a source that explicitly
        // identifies itself as in-vitro, animal, cell-culture, or mechanistic.
        if (role === 'human' && explicitlyNonHuman) continue
        existing.add(role)
      }
      roleMap.set(id, existing)
    }
  }

  return new Map(
    [...roleMap.entries()]
      .filter(([, roles]) => roles.size > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, roles]) => [id, [...roles].sort()]),
  )
}

export function mergeReviewedSourceRoleNote(existingNote, roles = []) {
  const base = String(existingNote || '').trim()
  const normalized = [...new Set(roles.map((role) => String(role || '').trim().toLowerCase()).filter(Boolean))].sort()
  if (!normalized.length) return base

  const marker = `reviewed source role: ${normalized.join(', ')}`
  if (base.toLowerCase().includes(marker.toLowerCase())) return base
  return [base, marker].filter(Boolean).join('; ')
}

export const APPLIED_PATCH_DIR = DEFAULT_APPLIED_PATCH_DIR

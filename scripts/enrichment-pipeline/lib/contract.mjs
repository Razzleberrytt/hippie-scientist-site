import fs from 'node:fs'
import { contractPath, sourceClassesPath, relative } from './paths.mjs'

export const ENRICHMENT_MODES = new Set(['automatic', 'manual-review', 'derived', 'prohibited'])
export const OVERWRITE_POLICIES = new Set([
  'never',
  'only-if-empty',
  'only-if-higher-confidence',
  'manual-review',
])
export const PRIORITY_BANDS = ['P0', 'P1', 'P2', 'P3', 'P4']

let cached = null

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`Cannot parse ${relative(filePath)}: ${error.message}`)
  }
}

/**
 * Load and validate the enrichment contract.
 *
 * Validation is structural only — it never reads the workbook, so the contract
 * can be loaded in tests and in CI without the binary source present. Field
 * names are checked against the live workbook separately by
 * `validateContractAgainstWorkbook`.
 */
export function loadContract({ force = false } = {}) {
  if (cached && !force) return cached

  const raw = readJson(contractPath)
  const vocab = readJson(sourceClassesPath)
  const errors = []

  if (raw.contract_version !== 1) errors.push('contract_version must equal 1')
  if (!raw.canonical_source?.entity_sheet) errors.push('canonical_source.entity_sheet is required')
  if (!raw.canonical_source?.key_column) errors.push('canonical_source.key_column is required')
  if (!raw.fields || typeof raw.fields !== 'object') errors.push('fields must be an object')

  const evidenceLevels = vocab.evidence_levels || {}
  const sourceClasses = vocab.source_classes || {}
  if (!Object.keys(evidenceLevels).length) errors.push('source-classes.json: evidence_levels is empty')
  if (!Object.keys(sourceClasses).length) errors.push('source-classes.json: source_classes is empty')

  for (const [name, klass] of Object.entries(sourceClasses)) {
    if (!evidenceLevels[klass.evidence_level]) {
      errors.push(
        `source_classes.${name}.evidence_level "${klass.evidence_level}" is not a known evidence level`,
      )
    }
    if (!Number.isInteger(klass.quality_tier) || klass.quality_tier < 1) {
      errors.push(`source_classes.${name}.quality_tier must be a positive integer`)
    }
  }

  const defaults = raw.defaults || {}
  const fields = new Map()

  for (const [name, rawField] of Object.entries(raw.fields || {})) {
    const prefix = `fields.${name}`
    if (!ENRICHMENT_MODES.has(rawField.enrichment)) {
      errors.push(`${prefix}.enrichment must be one of: ${[...ENRICHMENT_MODES].join(', ')}`)
      continue
    }
    if (!String(rawField.rationale || '').trim()) {
      errors.push(`${prefix}.rationale is required — every classification must record why`)
    }

    const field = { ...defaults, ...rawField, name }

    // Non-writable classifications are pinned so a future contract edit cannot
    // quietly hand an automatic overwrite policy to a governance or derived
    // column.
    if (field.enrichment === 'prohibited' || field.enrichment === 'derived') {
      field.overwrite_policy = 'never'
      field.requires_human_review = false
      field.min_sources = 0
      field.accepted_source_classes = []
    }
    if (field.enrichment === 'manual-review') {
      field.overwrite_policy = 'manual-review'
      field.requires_human_review = true
    }

    if (!OVERWRITE_POLICIES.has(field.overwrite_policy)) {
      errors.push(`${prefix}.overwrite_policy must be one of: ${[...OVERWRITE_POLICIES].join(', ')}`)
    }
    if (!PRIORITY_BANDS.includes(field.field_priority)) {
      errors.push(`${prefix}.field_priority must be one of: ${PRIORITY_BANDS.join(', ')}`)
    }
    if (!evidenceLevels[field.min_evidence_level]) {
      errors.push(`${prefix}.min_evidence_level "${field.min_evidence_level}" is not a known evidence level`)
    }
    for (const klass of field.accepted_source_classes || []) {
      if (!sourceClasses[klass]) {
        errors.push(`${prefix}.accepted_source_classes references unknown class "${klass}"`)
      }
    }

    if (field.enrichment === 'automatic') {
      if (field.overwrite_policy === 'never' || field.overwrite_policy === 'manual-review') {
        errors.push(`${prefix} is automatic but its overwrite_policy (${field.overwrite_policy}) can never write`)
      }
      if (!Number.isInteger(field.min_sources) || field.min_sources < 1) {
        errors.push(`${prefix} is automatic and must require at least one source`)
      }
      if (!field.accepted_source_classes?.length) {
        errors.push(`${prefix} is automatic and must list accepted_source_classes`)
      }
      // An automatic field must not be satisfiable by a source class weaker
      // than its own declared evidence floor, and must not declare a floor no
      // accepted class can reach (which would make it permanently unfillable).
      const floor = evidenceLevels[field.min_evidence_level]?.rank ?? 0
      const reachable = (field.accepted_source_classes || []).some(
        (klass) => (evidenceLevels[sourceClasses[klass]?.evidence_level]?.rank ?? -1) >= floor,
      )
      if (!reachable) {
        errors.push(
          `${prefix}: no accepted source class reaches min_evidence_level "${field.min_evidence_level}" — the field could never be filled`,
        )
      }
      if (!Number.isInteger(field.max_length) || field.max_length < 1) {
        errors.push(`${prefix}.max_length must be a positive integer`)
      }
    }

    fields.set(name, Object.freeze(field))
  }

  if (errors.length) {
    throw new Error(`Invalid enrichment contract (${relative(contractPath)}):\n- ${errors.join('\n- ')}`)
  }

  cached = Object.freeze({
    version: raw.contract_version,
    canonicalSource: raw.canonical_source,
    importPath: raw.import_path,
    nonImportableSheets: raw.non_importable_sheets || {},
    defaults,
    fields,
    evidenceLevels,
    sourceClasses,
    confidenceLevels: vocab.confidence_levels || ['low', 'moderate', 'high'],
    overwritePolicyDocs: vocab.overwrite_policies || {},
  })

  return cached
}

export function getField(contract, name) {
  return contract.fields.get(name) || null
}

export function automaticFields(contract) {
  return [...contract.fields.values()].filter((f) => f.enrichment === 'automatic')
}

export function manualReviewFields(contract) {
  return [...contract.fields.values()].filter((f) => f.enrichment === 'manual-review')
}

export function lockedFields(contract) {
  return [...contract.fields.values()].filter(
    (f) => f.enrichment === 'prohibited' || f.enrichment === 'derived',
  )
}

export function evidenceRank(contract, level) {
  return contract.evidenceLevels[level]?.rank ?? -1
}

export function sourceClassEvidenceLevel(contract, klass) {
  return contract.sourceClasses[klass]?.evidence_level ?? null
}

/** True when the field may ever be written by an automatic import. */
export function isWritable(field) {
  return field?.enrichment === 'automatic'
}

/** True when a candidate for this field always needs a human acceptance step. */
export function needsHumanReview(field) {
  return field?.enrichment === 'manual-review' || field?.requires_human_review === true
}

export function fieldAppliesToEntityType(field, entityType) {
  if (!field?.applies_to_entity_types) return true
  return field.applies_to_entity_types.includes(entityType)
}

/**
 * Cross-check the contract against the live workbook header row. Returns a
 * report rather than throwing so callers can decide whether drift is fatal.
 */
export function validateContractAgainstWorkbook(contract, workbookColumns) {
  const columns = new Set(workbookColumns)
  const missingFromWorkbook = [...contract.fields.keys()].filter((name) => !columns.has(name))
  const missingFromContract = [...columns].filter((name) => name && !contract.fields.has(name))
  return {
    ok: missingFromWorkbook.length === 0 && missingFromContract.length === 0,
    missingFromWorkbook,
    missingFromContract,
  }
}

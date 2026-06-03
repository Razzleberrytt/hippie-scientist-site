function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasString(value, key) {
  return typeof value?.[key] === 'string' && value[key].trim().length > 0
}

function hasBasePatchMetadata(patch) {
  return [
    'patch_id',
    'schema_version',
    'source_agent',
    'agent_version',
    'created_at',
    'slug',
    'patch_type',
  ].every(key => hasString(patch, key))
}

function validateEvidencePatch(patch) {
  if (!hasBasePatchMetadata(patch)) return false
  if (patch.patch_type !== 'evidence') return false
  if (!Array.isArray(patch.evidence)) return false

  return patch.evidence.every(row =>
    isPlainObject(row) &&
    hasString(row, 'compound_slug') &&
    hasString(row, 'study_type') &&
    hasString(row, 'population')
  )
}

function validateEnrichmentPatch(patch) {
  return (
    hasBasePatchMetadata(patch) &&
    patch.patch_type === 'enrichment' &&
    isPlainObject(patch.enrichment)
  )
}

function validateAffiliatePatch(patch) {
  return (
    hasBasePatchMetadata(patch) &&
    patch.patch_type === 'affiliate' &&
    isPlainObject(patch.affiliate)
  )
}

export function validatePatch(patch) {
  if (!isPlainObject(patch)) return false

  if (patch.patch_type === 'evidence') return validateEvidencePatch(patch)
  if (patch.patch_type === 'enrichment') return validateEnrichmentPatch(patch)
  if (patch.patch_type === 'affiliate') return validateAffiliatePatch(patch)

  return false
}

export function createSchemaValidator() {
  return validatePatch
}

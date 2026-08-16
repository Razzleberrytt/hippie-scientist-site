import { collectionHasMeaningfulText, hasMeaningfulText, isMissingLike } from './data-quality.mjs'

export const PROFILE_COMPLETENESS_FIELDS = [
  'description', 'safety', 'evidence_level', 'mechanism', 'best_for', 'dosing', 'interactions',
]

const DESCRIPTION_PLACEHOLDERS = [
  /evidence-aware botanical profile with mechanism/i,
  /evidence-aware compound profile with mechanism/i,
]

function hasDescription(item) {
  return hasMeaningfulText(item.description ?? item.summary, DESCRIPTION_PLACEHOLDERS)
}

function hasEvidenceLevel(item) {
  return !isMissingLike(item.evidence_tier ?? item.evidence_grade ?? item.evidenceLevel ?? item.evidence_level)
}

function hasMechanism(item) {
  const value = item.mechanisms ?? item.canonical_mechanisms ?? item.mechanism
  return Array.isArray(value) ? value.length > 0 : !isMissingLike(value)
}

function hasBestFor(item) {
  return collectionHasMeaningfulText(item.effects ?? item.primary_effects ?? item.best_for ?? item.bestFor)
}

function hasDosing(item) {
  const value = item.dosage ?? item.typical_dosage ?? item.dosing ?? item.dosage_range
  return Array.isArray(value) ? value.length > 0 : !isMissingLike(value)
}

function hasInteractions(item, interactionEdgesMap) {
  if (collectionHasMeaningfulText(item.interactions)) return true
  const edges = interactionEdgesMap?.[item.slug]
  return Array.isArray(edges) && edges.length > 0
}

export function evaluateProfileCompleteness(item, options = {}) {
  const {
    interactionEdgesMap = {},
    documentedSafetyExceptions = new Set(),
    safetyValue = item.contraindications ?? item.safety,
  } = options

  const safetyFilled = collectionHasMeaningfulText(safetyValue)
  const safetyDocumentedException = !safetyFilled && documentedSafetyExceptions.has(item.slug)
  const state = {
    description: hasDescription(item),
    safety: safetyFilled || safetyDocumentedException,
    evidence_level: hasEvidenceLevel(item),
    mechanism: hasMechanism(item),
    best_for: hasBestFor(item),
    dosing: hasDosing(item),
    interactions: hasInteractions(item, interactionEdgesMap),
  }
  const missingFields = PROFILE_COMPLETENESS_FIELDS.filter((field) => !state[field])
  const details = Object.fromEntries(PROFILE_COMPLETENESS_FIELDS.map((field) => [
    field,
    field === 'safety' && safetyDocumentedException ? 'DOCUMENTED_EXCEPTION' : state[field] ? 'FILLED' : 'EMPTY',
  ]))

  return {
    completeness: (PROFILE_COMPLETENESS_FIELDS.length - missingFields.length) / PROFILE_COMPLETENESS_FIELDS.length,
    missingFields,
    details,
  }
}

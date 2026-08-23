import { describe, expect, it } from 'vitest'
import {
  automaticFields,
  evidenceRank,
  fieldAppliesToEntityType,
  lockedFields,
  loadContract,
  manualReviewFields,
  needsHumanReview,
  sourceClassEvidenceLevel,
  validateContractAgainstWorkbook,
} from '../lib/contract.mjs'

const contract = loadContract()

describe('enrichment contract', () => {
  it('loads and validates', () => {
    expect(contract.version).toBe(1)
    expect(contract.fields.size).toBeGreaterThan(0)
  })

  it('classifies every field with a recorded rationale', () => {
    for (const field of contract.fields.values()) {
      expect(field.enrichment, field.name).toBeTruthy()
      expect(String(field.rationale).trim(), `${field.name} rationale`).not.toBe('')
    }
  })

  it('never lets a governance or derived column carry a writable policy', () => {
    for (const field of lockedFields(contract)) {
      expect(field.overwrite_policy, field.name).toBe('never')
      expect(field.min_sources, field.name).toBe(0)
    }
  })

  it('keeps publishing, governance, and regulatory columns out of automatic enrichment', () => {
    const mustBeLocked = [
      'slug',
      'entity_type',
      'runtime_export_decision',
      'profile_status',
      'publish_status',
      'public_search_visibility',
      'seo_indexing_recommendation',
      'governance_status',
      'legal_status',
      'regulatory_status',
      'controlled_substance',
      'doNotMonetize',
      'doNotPromote',
      'allow_restricted_reference_export',
    ]
    for (const name of mustBeLocked) {
      expect(contract.fields.get(name)?.enrichment, name).toBe('prohibited')
    }
  })

  it('keeps safety, dosage, and evidence-grading fields under manual review', () => {
    const mustBeManual = [
      'safety_notes',
      'contraindications_or_flags',
      'dosage_or_preferred_form',
      'runtime_safety',
      'evidence_grade',
      'evidence_tier',
      'confidence_tier',
    ]
    for (const name of mustBeManual) {
      const field = contract.fields.get(name)
      expect(field?.enrichment, name).toBe('manual-review')
      expect(needsHumanReview(field), name).toBe(true)
    }
  })

  it('requires cited, sufficiently strong sources for every automatic field', () => {
    const automatic = automaticFields(contract)
    expect(automatic.length).toBeGreaterThan(0)
    for (const field of automatic) {
      expect(field.min_sources, field.name).toBeGreaterThanOrEqual(1)
      expect(field.accepted_source_classes.length, field.name).toBeGreaterThan(0)
      const floor = evidenceRank(contract, field.min_evidence_level)
      const reachable = field.accepted_source_classes.some(
        (klass) => evidenceRank(contract, sourceClassEvidenceLevel(contract, klass)) >= floor,
      )
      expect(reachable, `${field.name} has an unreachable evidence floor`).toBe(true)
    }
  })

  it('does not let mechanistic-only evidence satisfy a claim-bearing effect field', () => {
    const secondary = contract.fields.get('secondary_effects')
    expect(secondary.accepted_source_classes).not.toContain('preclinical-mechanistic-study')
    expect(evidenceRank(contract, secondary.min_evidence_level)).toBeGreaterThanOrEqual(
      evidenceRank(contract, 'human-observational'),
    )
  })

  it('scopes latin_name to herbs only', () => {
    const field = contract.fields.get('latin_name')
    expect(fieldAppliesToEntityType(field, 'herb')).toBe(true)
    expect(fieldAppliesToEntityType(field, 'compound')).toBe(false)
  })

  it('has at least one field in each enrichment mode', () => {
    expect(automaticFields(contract).length).toBeGreaterThan(0)
    expect(manualReviewFields(contract).length).toBeGreaterThan(0)
    expect(lockedFields(contract).length).toBeGreaterThan(0)
  })

  it('reports drift against a workbook header row', () => {
    const columns = [...contract.fields.keys()]
    expect(validateContractAgainstWorkbook(contract, columns).ok).toBe(true)

    const drifted = validateContractAgainstWorkbook(contract, [...columns.slice(1), 'brand_new_column'])
    expect(drifted.ok).toBe(false)
    expect(drifted.missingFromWorkbook).toContain(columns[0])
    expect(drifted.missingFromContract).toContain('brand_new_column')
  })

  it('uses the same confidence vocabulary as the workbook patch runner', () => {
    expect(contract.confidenceLevels).toEqual(['low', 'moderate', 'high'])
  })
})

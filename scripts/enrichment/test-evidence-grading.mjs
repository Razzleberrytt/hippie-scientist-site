#!/usr/bin/env node
import assert from 'node:assert/strict'
import { gradeEvidenceEntries, validateJudgmentConsistency } from './evidence-grading.mjs'

const sourceById = new Map([
  [
    'src_human_rct',
    {
      sourceId: 'src_human_rct',
      sourceClass: 'randomized-human-trial',
      publicationYear: 2023,
      reliabilityTier: 'tier-a',
    },
  ],
  [
    'src_human_obs',
    {
      sourceId: 'src_human_obs',
      sourceClass: 'observational-human-evidence',
      publicationYear: 2021,
      reliabilityTier: 'tier-b',
    },
  ],
  [
    'src_preclinical',
    {
      sourceId: 'src_preclinical',
      sourceClass: 'preclinical-mechanistic-study',
      publicationYear: 2022,
      reliabilityTier: 'tier-b',
    },
  ],
  [
    'src_traditional',
    {
      sourceId: 'src_traditional',
      sourceClass: 'traditional-use-monograph',
      publicationYear: 2007,
      reliabilityTier: 'tier-b',
    },
  ],
  [
    'src_reg_a',
    {
      sourceId: 'src_reg_a',
      sourceClass: 'regulatory-agency-monograph-guidance',
      publicationYear: 2020,
      reliabilityTier: 'tier-a',
    },
  ],
  [
    'src_reg_b',
    {
      sourceId: 'src_reg_b',
      sourceClass: 'regulatory-agency-monograph-guidance',
      publicationYear: 2020,
      reliabilityTier: 'tier-b',
    },
  ],
])

const strongerHuman = gradeEvidenceEntries(
  [
    {
      sourceId: 'src_human_rct',
      evidenceClass: 'human-clinical',
      topicType: 'supported_use',
      claimType: 'efficacy_signal',
      strengthLabel: 'strong',
    },
    {
      sourceId: 'src_human_obs',
      evidenceClass: 'human-observational',
      topicType: 'supported_use',
      claimType: 'efficacy_signal',
      strengthLabel: 'moderate',
    },
  ],
  sourceById,
)
assert.equal(strongerHuman.evidenceLabel, 'stronger_human_support')
assert.deepEqual(validateJudgmentConsistency(strongerHuman), [])

const preclinicalOnly = gradeEvidenceEntries(
  [
    {
      sourceId: 'src_preclinical',
      evidenceClass: 'preclinical-mechanistic',
      topicType: 'mechanism',
      claimType: 'mechanistic_signal',
      strengthLabel: 'moderate',
    },
  ],
  sourceById,
)
assert.equal(preclinicalOnly.evidenceLabel, 'preclinical_only')
assert.equal(preclinicalOnly.grading.humanRelevance, 'preclinical-proxy')
assert.deepEqual(validateJudgmentConsistency(preclinicalOnly), [])

const traditionalOnly = gradeEvidenceEntries(
  [
    {
      sourceId: 'src_traditional',
      evidenceClass: 'traditional-use',
      topicType: 'population_specific_note',
      claimType: 'population_note',
      strengthLabel: 'limited',
    },
  ],
  sourceById,
)
assert.equal(traditionalOnly.evidenceLabel, 'traditional_use_only')
assert.deepEqual(validateJudgmentConsistency(traditionalOnly), [])

const humanConflict = gradeEvidenceEntries(
  [
    {
      sourceId: 'src_human_rct',
      evidenceClass: 'human-clinical',
      topicType: 'supported_use',
      claimType: 'efficacy_signal',
      strengthLabel: 'moderate',
    },
    {
      sourceId: 'src_human_obs',
      evidenceClass: 'human-observational',
      topicType: 'unsupported_or_unclear_use',
      claimType: 'efficacy_null_or_mixed',
      strengthLabel: 'limited',
    },
  ],
  sourceById,
)
assert.equal(humanConflict.evidenceLabel, 'conflicting_evidence')
assert.equal(humanConflict.grading.conflictState, 'conflicting_evidence')
assert.deepEqual(validateJudgmentConsistency(humanConflict), [])

const monographConflict = gradeEvidenceEntries(
  [
    {
      sourceId: 'src_reg_a',
      evidenceClass: 'regulatory-monograph',
      topicType: 'supported_use',
      claimType: 'efficacy_signal',
      strengthLabel: 'limited',
    },
    {
      sourceId: 'src_reg_b',
      evidenceClass: 'regulatory-monograph',
      topicType: 'unsupported_or_unclear_use',
      claimType: 'efficacy_null_or_mixed',
      strengthLabel: 'limited',
    },
  ],
  sourceById,
)
assert.equal(monographConflict.evidenceLabel, 'conflicting_evidence')
assert.deepEqual(validateJudgmentConsistency(monographConflict), [])

const sparseFallback = gradeEvidenceEntries([], sourceById)
assert.equal(sparseFallback.evidenceLabel, 'insufficient_evidence')
assert.deepEqual(validateJudgmentConsistency(sparseFallback), [])

const contradictoryCombo = gradeEvidenceEntries(
  [
    {
      sourceId: 'src_human_rct',
      evidenceClass: 'human-clinical',
      topicType: 'supported_use',
      claimType: 'efficacy_signal',
      uncertaintyNote: 'small trial',
      strengthLabel: 'limited',
    },
    {
      sourceId: 'src_human_rct',
      evidenceClass: 'human-clinical',
      topicType: 'supported_use',
      claimType: 'efficacy_signal',
      strengthLabel: 'limited',
    },
  ],
  sourceById,
)
assert.ok(['mixed_or_uncertain', 'limited_human_support', 'stronger_human_support'].includes(contradictoryCombo.evidenceLabel))
assert.ok(contradictoryCombo.uncertaintyNotes.length > 0)

const impossible = {
  ...preclinicalOnly,
  evidenceLabel: 'stronger_human_support',
}
assert.ok(validateJudgmentConsistency(impossible).length > 0)

console.log('[test-evidence-grading] PASS')

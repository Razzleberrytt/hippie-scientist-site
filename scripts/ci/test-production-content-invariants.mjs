#!/usr/bin/env node
import assert from 'node:assert/strict'
import { evaluateCorpus, evaluateRecord, PRODUCTION_INVARIANT_CODES } from '../lib/production-content-invariants.mjs'

const base = {
  slug: 'fixture',
  indexability_status: 'PUBLISH',
  sitemap_included: true,
  governance: { indexingAllowed: true },
  evidence_grade: 'B',
  evidence_tier: 'Moderate Evidence',
  evidence_design_match: 'direct human outcomes',
  evidence_risk_of_bias: 'acceptable',
  evidence_consistency: 'replicated',
  scientific_name: 'Withania somnifera',
  safety: '',
  dosage: '',
  sources: [
    { id: 'human', title: 'Randomized controlled trial in adults', url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/', citation: 'RCT; 120 adults; 300 mg/day', studyType: 'RCT' },
    { id: 'safety', title: 'Safety and tolerability in adults', url: 'https://pubmed.ncbi.nlm.nih.gov/23456789/', citation: 'Safety; 300 mg/day; adverse events monitored' },
  ],
  claimMap: [],
}

function codes(record, kind = 'herb') {
  return new Set(evaluateRecord(record, kind).map((finding) => finding.code))
}

// #592 A-grade pages must have a mature, replicated human evidence basis plus
// the structured design/risk/consistency rationale published by methodology.
const aGrade = structuredClone(base)
aGrade.evidence_grade = 'A'
aGrade.evidence_tier = 'Strong Human Evidence'
aGrade.sources = [base.sources[0]]
assert(codes(aGrade).has('A_GRADE_CRITERIA'))

// #593 human claims require sources that are themselves classifiable as human evidence.
const human = structuredClone(base)
human.sources = [{ id: 'mechanism', title: 'Cell signaling experiment', url: 'https://example.org/paper' }]
human.claimMap = [{ id: 'c1', claim: 'A randomized human trial improved stress', evidenceLevel: 'human_rct', sourceRefIds: ['mechanism'] }]
assert(codes(human).has('HUMAN_CLAIM_WITHOUT_HUMAN_SOURCE'))

// #594 safety claims require safety evidence, not an arbitrary efficacy paper.
const safety = structuredClone(base)
safety.sources = [base.sources[0]]
safety.claimMap = [{ id: 'c2', claim: 'Avoid during pregnancy because of a safety concern', sourceRefIds: ['human'] }]
assert(codes(safety).has('SAFETY_CLAIM_WITHOUT_SAFETY_SOURCE'))

// #595 numeric dose statements must trace to a dose-bearing source.
const dose = structuredClone(base)
dose.sources = [{ id: 'human', title: 'Randomized controlled trial in adults', url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/', citation: 'Human trial' }]
dose.dosage = 'Take 300 mg/day for 8 weeks.'
assert(codes(dose).has('DOSE_STATEMENT_WITHOUT_DOSE_SOURCE'))

// #596 source references and citation destinations must resolve inside the
// record graph and use structurally valid destinations.
const missingRef = structuredClone(base)
missingRef.claimMap = [{ id: 'c3', claim: 'Human RCT evidence exists', evidenceLevel: 'human_rct', sourceRefIds: ['missing'] }]
assert(codes(missingRef).has('UNRESOLVED_CITATION_REFERENCE'))
const invalidUrl = structuredClone(base)
invalidUrl.sources[0].url = 'https://pubmed.ncbi.nlm.nih.gov/not-a-pmid/'
assert(codes(invalidUrl).has('INVALID_CITATION_DESTINATION'))

// #597 placeholders are forbidden.
const placeholder = structuredClone(base)
placeholder.sources[0].title = 'Minimal citation row added from existing workbook PMID; title still requires PubMed metadata extraction.'
assert(codes(placeholder).has('PRODUCTION_PLACEHOLDER'))

// #598 duplicate canonical entities are a corpus-level failure.
const duplicateA = structuredClone(base)
duplicateA.slug = 'duplicate'
duplicateA.canonical_id = 'entity:shared'
const duplicateB = structuredClone(base)
duplicateB.slug = 'duplicate-2'
duplicateB.canonical_id = 'entity:shared'
assert(evaluateCorpus([{ kind: 'herb', record: duplicateA }, { kind: 'herb', record: duplicateB }]).some((finding) => finding.code === 'DUPLICATE_CANONICAL_ENTITY'))

// #599 scientific names get a conservative structural sanity check.
const malformed = structuredClone(base)
malformed.scientific_name = 'TODO plant 12345'
assert(codes(malformed).has('MALFORMED_SCIENTIFIC_NAME'))

// #600 version/debug language is not a public scientific claim.
const internal = structuredClone(base)
internal.claimMap = [{ id: 'c4', claim: 'v9.8: internal claim wording', sourceRefIds: ['human'] }]
assert(codes(internal).has('INTERNAL_DEVELOPMENT_LANGUAGE'))

const exercised = new Set([
  'A_GRADE_CRITERIA',
  'HUMAN_CLAIM_WITHOUT_HUMAN_SOURCE',
  'SAFETY_CLAIM_WITHOUT_SAFETY_SOURCE',
  'DOSE_STATEMENT_WITHOUT_DOSE_SOURCE',
  'UNRESOLVED_CITATION_REFERENCE',
  'INVALID_CITATION_DESTINATION',
  'PRODUCTION_PLACEHOLDER',
  'DUPLICATE_CANONICAL_ENTITY',
  'MALFORMED_SCIENTIFIC_NAME',
  'INTERNAL_DEVELOPMENT_LANGUAGE',
])
assert.deepEqual([...exercised].sort(), [...PRODUCTION_INVARIANT_CODES].sort())
console.log(`[production-invariant-tests] PASS — exercised all ${PRODUCTION_INVARIANT_CODES.length} invariant codes`)

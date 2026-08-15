import { describe, expect, it } from 'vitest'

import {
  CANONICAL_EVIDENCE_GRADES,
  canonicalGradeFromEvidenceTier,
  isCanonicalEvidenceGrade,
  normalizeEvidenceGrade,
} from '../../../lib/evidence-grade'

describe('canonical evidence grade contract', () => {
  it('exposes exactly the five persisted grades', () => {
    expect(CANONICAL_EVIDENCE_GRADES).toEqual(['A', 'B', 'C', 'D', 'Avoid/Insufficient'])
  })

  it('recognizes only canonical persisted values as canonical', () => {
    for (const grade of CANONICAL_EVIDENCE_GRADES) {
      expect(isCanonicalEvidenceGrade(grade)).toBe(true)
      expect(normalizeEvidenceGrade(grade).canonical).toBe(true)
    }

    expect(isCanonicalEvidenceGrade('F')).toBe(false)
    expect(isCanonicalEvidenceGrade('b+')).toBe(false)
  })

  it('migrates legacy letters and modifiers to canonical grades', () => {
    expect(normalizeEvidenceGrade('a').grade).toBe('A')
    expect(normalizeEvidenceGrade('B+').grade).toBe('B')
    expect(normalizeEvidenceGrade('c-').grade).toBe('C')
    expect(normalizeEvidenceGrade('d+').grade).toBe('D')
  })

  it('retires F into Avoid/Insufficient rather than preserving a sixth grade', () => {
    const normalized = normalizeEvidenceGrade('F')
    expect(normalized.grade).toBe('Avoid/Insufficient')
    expect(normalized.letter).toBeNull()
    expect(normalized.canonical).toBe(false)
  })

  it('keeps preclinical/no-human wording distinct from explicit insufficiency', () => {
    expect(normalizeEvidenceGrade('Preclinical / no human evidence').grade).toBe('D')
    expect(normalizeEvidenceGrade('Insufficient evidence').grade).toBe('Avoid/Insufficient')
  })

  it('caps positive adjectives when the same phrase says evidence is preclinical or lacks humans', () => {
    expect(normalizeEvidenceGrade('Strong mechanistic evidence; no human trials').grade).toBe('D')
    expect(normalizeEvidenceGrade('Robust preclinical evidence in animals').grade).toBe('D')
    expect(canonicalGradeFromEvidenceTier('Strong mechanistic evidence; no human trials')).toBe('D')
  })

  it('still permits strong wording when it is explicitly tied to human/clinical evidence', () => {
    expect(normalizeEvidenceGrade('Strong human clinical evidence').grade).toBe('A')
    expect(normalizeEvidenceGrade('Strong mechanistic and human clinical evidence').grade).toBe('A')
  })

  it('treats inconsistent or conflicting wording conservatively', () => {
    expect(normalizeEvidenceGrade('Strong but inconsistent evidence').grade).toBe('C')
    expect(canonicalGradeFromEvidenceTier('Moderate evidence with conflicting findings')).toBe('C')
  })

  it('does not flatten outcome-dependent grades into one verdict', () => {
    const normalized = normalizeEvidenceGrade('B for PCOS; D for core goals')
    expect(normalized.grade).toBeNull()
    expect(normalized.outcomeDependent).toBe(true)
  })

  it('adapts legacy evidence tiers to the same enum', () => {
    expect(canonicalGradeFromEvidenceTier('Strong Human Evidence')).toBe('A')
    expect(canonicalGradeFromEvidenceTier('Moderate Evidence')).toBe('B')
    expect(canonicalGradeFromEvidenceTier('Limited Evidence')).toBe('C')
    expect(canonicalGradeFromEvidenceTier('Mechanistic / preclinical')).toBe('D')
    expect(canonicalGradeFromEvidenceTier('Insufficient evidence')).toBe('Avoid/Insufficient')
  })
})

import { describe, it, expect } from 'vitest'
import {
  hasHumanEvidence,
  hasMechanismEvidence,
  isPreliminaryResearch,
  getEvidenceTier,
  getEvidenceLabel,
  getEvidenceColor,
  getEvidenceLetterGrade,
  hasStrongSafetyProfile,
} from '../../../lib/evidence'
import type { RuntimeRecord } from '../../types/content'

function record(fields: Partial<RuntimeRecord> & Record<string, unknown> = {}): RuntimeRecord {
  return { slug: 'test-record', ...fields }
}

describe('hasHumanEvidence', () => {
  it('is false when evidence text is explicitly preclinical/animal only', () => {
    expect(hasHumanEvidence(record({ evidence_tier: 'Preclinical / animal studies only' }))).toBe(false)
  })

  it('is true when evidence text references human clinical trials', () => {
    expect(hasHumanEvidence(record({ evidence_tier: 'Strong human clinical trial evidence' }))).toBe(true)
  })

  it('falls back to source count when text is ambiguous', () => {
    expect(hasHumanEvidence(record({ summary_quality: 'reviewed', sourceCount: 6 }))).toBe(true)
    expect(hasHumanEvidence(record({ summary_quality: 'reviewed', sourceCount: 2 }))).toBe(false)
  })

  it('does not use source count fallback when text says evidence is limited', () => {
    expect(hasHumanEvidence(record({ evidence_tier: 'limited', sourceCount: 10 }))).toBe(false)
  })
})

describe('hasMechanismEvidence', () => {
  it('is true when mechanisms are listed', () => {
    expect(hasMechanismEvidence(record({ mechanisms: ['GABA modulation'] }))).toBe(true)
  })

  it('is false when no mechanism/effect/pathway fields are populated', () => {
    expect(hasMechanismEvidence(record())).toBe(false)
  })
})

describe('isPreliminaryResearch', () => {
  it('is true for preliminary/emerging/animal language', () => {
    expect(isPreliminaryResearch(record({ evidence_tier: 'Preliminary animal studies' }))).toBe(true)
  })

  it('is false for strong evidence language', () => {
    expect(isPreliminaryResearch(record({ evidence_tier: 'Strong evidence' }))).toBe(false)
  })
})

describe('getEvidenceTier', () => {
  it('classifies "needs review" style text as review', () => {
    expect(getEvidenceTier(record({ profile_status: 'Draft - needs review' }))).toBe('review')
  })

  it('classifies explicit insufficiency as insufficient', () => {
    expect(getEvidenceTier(record({ evidence_tier: 'Insufficient evidence' }))).toBe('insufficient')
  })

  it('preserves mixed and traditional nuance inside reconciled C/D bands', () => {
    expect(getEvidenceTier(record({ evidence_tier: 'Mixed / conflicting results' }))).toBe('mixed')
    expect(getEvidenceTier(record({ evidence_tier: 'Traditional / historical use only' }))).toBe('traditional')
  })

  it('classifies robust clinical evidence as strong', () => {
    expect(getEvidenceTier(record({ evidence_tier: 'Strong, high-quality evidence' }))).toBe('strong')
  })

  it('classifies moderate clinical evidence as moderate', () => {
    expect(getEvidenceTier(record({ evidence_tier: 'Moderate evidence' }))).toBe('moderate')
  })

  it('uses the reconciled weaker band when authored grade and tier disagree', () => {
    const conflicted = record({ evidence_grade: 'A', evidence_tier: 'Limited Evidence' })
    expect(getEvidenceLetterGrade(conflicted)).toBe('C')
    expect(getEvidenceTier(conflicted)).toBe('limited')
    expect(getEvidenceLabel(conflicted)).toBe('Limited evidence')
    expect(getEvidenceColor(conflicted)).toBe('slate')
  })

  it('routes outcome-dependent authored evidence to review instead of a fabricated strong tier', () => {
    const outcomeDependent = record({ evidence_grade: 'Varies by outcome', evidence_tier: 'Strong Evidence' })
    expect(getEvidenceLetterGrade(outcomeDependent)).toBe('Unassigned')
    expect(getEvidenceTier(outcomeDependent)).toBe('review')
    expect(getEvidenceLabel(outcomeDependent)).toBe('Needs review')
  })

  it('falls back to "limited" when nothing else is known', () => {
    expect(getEvidenceTier(record())).toBe('limited')
  })
})

describe('getEvidenceLabel / getEvidenceColor', () => {
  it('produces a matching human-readable label and color per tier', () => {
    const strong = record({ evidence_tier: 'Strong evidence' })
    expect(getEvidenceLabel(strong)).toBe('Strong evidence')
    expect(getEvidenceColor(strong)).toBe('emerald')

    const insufficient = record({ evidence_tier: 'Insufficient evidence' })
    expect(getEvidenceLabel(insufficient)).toBe('Insufficient evidence')
    expect(getEvidenceColor(insufficient)).toBe('slate')
  })
})

describe('getEvidenceLetterGrade', () => {
  it('uses an explicit grade when it is the only authored evidence signal', () => {
    expect(getEvidenceLetterGrade(record({ evidence_grade: 'A' }))).toBe('A')
    expect(getEvidenceLetterGrade(record({ evidence_grade: 'b+' }))).toBe('B')
  })

  it('derives the grade from evidence_tier vocabulary when no letter grade is present', () => {
    expect(getEvidenceLetterGrade(record({ evidence_tier: 'Strong evidence' }))).toBe('A')
    expect(getEvidenceLetterGrade(record({ evidence_tier: 'Traditional use' }))).toBe('D')
  })

  it('resolves conflicting authored grade and tier conservatively', () => {
    expect(getEvidenceLetterGrade(record({ evidence_grade: 'A', evidence_tier: 'Limited Evidence' }))).toBe('C')
    expect(getEvidenceLetterGrade(record({ evidence_grade: 'B', evidence_tier: 'Preclinical Evidence' }))).toBe('D')
  })

  it('preserves outcome-dependent or explicitly unresolved authored grades as unassigned', () => {
    expect(getEvidenceLetterGrade(record({ evidence_grade: 'Varies by outcome', evidence_tier: 'Strong Evidence' }))).toBe('Unassigned')
    expect(getEvidenceLetterGrade(record({ evidence_grade: 'Not applicable', evidence_tier: 'Moderate Evidence' }))).toBe('Unassigned')
  })

  it('keeps the historical compatibility fallback only when no authored grade or tier exists', () => {
    expect(getEvidenceLetterGrade(record())).toBe('C')
  })
})

describe('hasStrongSafetyProfile', () => {
  it('is false whenever caution/interaction/risk language is present, even alongside positive language', () => {
    expect(
      hasStrongSafetyProfile(
        record({ safetyNotes: 'Generally well tolerated, but use caution with interacting medications.' }),
      ),
    ).toBe(false)
  })

  it('is true only when explicitly positive safety language is present with no caution flags', () => {
    expect(hasStrongSafetyProfile(record({ safetyNotes: 'Well tolerated and considered very safe.' }))).toBe(true)
  })

  it('is false when there is no safety information at all', () => {
    expect(hasStrongSafetyProfile(record())).toBe(false)
  })
})

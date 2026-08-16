import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('canonical research remediation boundary', () => {
  it('routes snapshot remediation through the canonical grade-aware wrapper', () => {
    const root = process.cwd()
    const snapshot = fs.readFileSync(path.join(root, 'lib/research-quality-snapshot.ts'), 'utf8')

    expect(snapshot).toContain("from './research-quality-remediation'")
    expect(snapshot).toContain('buildCanonicalResearchGapQueue(analysis, topology, evidenceGradeConsistency)')
    expect(snapshot).not.toContain('buildResearchGapQueue(analysis, topology)')
  })

  it('injects topology-backed Grade A contradictions as structural remediation blockers', () => {
    const root = process.cwd()
    const remediation = fs.readFileSync(path.join(root, 'lib/research-quality-remediation.ts'), 'utf8')

    expect(remediation).toContain("EVIDENCE_GRADE_BLOCKER_REASON = 'evidence-grade-topology-contradiction'")
    expect(remediation).toContain('EVIDENCE_GRADE_BLOCKER_WEIGHT = 100')
    expect(remediation).toContain('evidenceGradeConsistency.topologyContradictions')
    expect(remediation).toContain("dimension: 'structural'")
    expect(remediation).toContain('item.reasons.some((reason) => reason.kind === EVIDENCE_GRADE_BLOCKER_REASON)')
  })

  it('replaces legacy dependency reasons with one current underlying-study reason', () => {
    const root = process.cwd()
    const remediation = fs.readFileSync(path.join(root, 'lib/research-quality-remediation.ts'), 'utf8')

    expect(remediation).toContain("STUDY_DEPENDENCY_REASON = 'high-study-dependency'")
    expect(remediation).toContain('item.reasons.filter((reason) => reason.kind !== STUDY_DEPENDENCY_REASON)')
    expect(remediation).toContain('topology.underlyingStudyIndependence.profiles')
    expect(remediation).toContain('profile.overDependentOnSingleUnderlyingStudy')
    expect(remediation).toContain('profile.dominantUnderlyingStudySupportedClaimShare')
    expect(remediation).toContain('profile.effectiveUnderlyingStudyCount')
    expect(remediation).toContain('publications resolve to ${profile.underlyingStudyCount} underlying studies')
  })

  it('rebuilds single-study support depth from adjusted claim cardinality', () => {
    const root = process.cwd()
    const remediation = fs.readFileSync(path.join(root, 'lib/research-quality-remediation.ts'), 'utf8')

    expect(remediation).toContain("SINGLE_STUDY_REASON = 'single-study-approved-claim'")
    expect(remediation).toContain('item.reasons.filter((reason) => reason.kind !== SINGLE_STUDY_REASON)')
    expect(remediation).toContain('topology.underlyingStudyIndependence.claims')
    expect(remediation).toContain('const underlyingStudyCount = adjusted?.underlyingStudyCount ?? claim.studyCount')
    expect(remediation).toContain('if (underlyingStudyCount !== 1) continue')
    expect(remediation).toContain('publications collapse to 1 underlying study')
    expect(remediation).toContain('RESEARCH_GAP_WEIGHTS.highConfidenceSingleStudyBonus')
  })
})

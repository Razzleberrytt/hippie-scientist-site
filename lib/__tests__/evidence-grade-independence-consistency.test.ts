import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeEvidenceGradeConsistency } from '@/lib/evidence-grade-consistency'
import type { ResearchQualityTopology } from '@/lib/research-quality-topology'

function fixtureRoot() {
  const root = mkdtempSync(path.join(tmpdir(), 'grade-independence-'))
  const dataDir = path.join(root, 'public', 'data')
  mkdirSync(dataDir, { recursive: true })
  writeFileSync(path.join(dataDir, 'herbs.json'), JSON.stringify([
    { slug: 'grade-a', evidence_grade: 'A', evidence_tier: 'Strong Evidence', indexability_status: 'PUBLISH' },
    { slug: 'grade-b', evidence_grade: 'B', evidence_tier: 'Moderate Evidence', indexability_status: 'PUBLISH' },
    { slug: 'grade-c', evidence_grade: 'C', evidence_tier: 'Limited Evidence', indexability_status: 'PUBLISH' },
  ]))
  writeFileSync(path.join(dataDir, 'compounds.json'), '[]')
  return root
}

function topology(): ResearchQualityTopology {
  return {
    underlyingStudyIndependence: {
      pseudoMultiStudyClaims: [
        {
          url: '/herbs/grade-a/',
          claimId: 'a1',
          predicate: 'supports_outcome',
          confidence: 0.9,
          apparentStudyCount: 2,
          underlyingStudyCount: 1,
          collapsedPublicationCount: 1,
          dependentPublicationGroups: [['pmid:1', 'pmid:2']],
          independenceReduced: true,
          pseudoMultiStudySupport: true,
          highConfidencePseudoMultiStudySupport: true,
          publicationStructuredSupportTier: 'adequate',
          independenceAdjustedStructuredSupportTier: 'single-study',
        },
        {
          url: '/herbs/grade-b/',
          claimId: 'b1',
          predicate: 'supports_outcome',
          confidence: 0.6,
          apparentStudyCount: 2,
          underlyingStudyCount: 1,
          collapsedPublicationCount: 1,
          dependentPublicationGroups: [['pmid:3', 'pmid:4']],
          independenceReduced: true,
          pseudoMultiStudySupport: true,
          highConfidencePseudoMultiStudySupport: false,
          publicationStructuredSupportTier: 'adequate',
          independenceAdjustedStructuredSupportTier: 'single-study',
        },
        {
          url: '/herbs/grade-c/',
          claimId: 'c1',
          predicate: 'supports_outcome',
          confidence: 0.9,
          apparentStudyCount: 2,
          underlyingStudyCount: 1,
          collapsedPublicationCount: 1,
          dependentPublicationGroups: [['pmid:5', 'pmid:6']],
          independenceReduced: true,
          pseudoMultiStudySupport: true,
          highConfidencePseudoMultiStudySupport: true,
          publicationStructuredSupportTier: 'adequate',
          independenceAdjustedStructuredSupportTier: 'single-study',
        },
      ],
    },
  } as unknown as ResearchQualityTopology
}

describe('evidence grade independence consistency', () => {
  it('treats Grade A as contradictory, Grade B as advisory, and leaves C unchanged', () => {
    const root = fixtureRoot()
    try {
      const report = analyzeEvidenceGradeConsistency(root, topology())
      expect(report.totals).toMatchObject({
        topologyContradictionsIndexable: 1,
        topologyWarningsIndexable: 1,
        contradictionsIndexable: 1,
      })
      expect(report.topologyContradictions[0]).toMatchObject({
        url: '/herbs/grade-a/',
        canonicalGrade: 'A',
        pseudoMultiStudyClaimCount: 1,
        highConfidencePseudoMultiStudyClaimCount: 1,
        collapsedPublicationCount: 1,
      })
      expect(report.topologyContradictions[0].issues).toContain('strong-grade-with-pseudo-multi-study-support')
      expect(report.topologyWarnings[0]).toMatchObject({ url: '/herbs/grade-b/', canonicalGrade: 'B' })
      expect(report.topologyWarnings[0].issues).toContain('moderate-grade-with-pseudo-multi-study-support')
      expect(report.findings.some((finding) => finding.url === '/herbs/grade-c/')).toBe(false)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('preserves the legacy consistency behavior when topology is not supplied', () => {
    const root = fixtureRoot()
    try {
      const report = analyzeEvidenceGradeConsistency(root)
      expect(report.totals.topologyContradictionsIndexable).toBe(0)
      expect(report.totals.topologyWarningsIndexable).toBe(0)
      expect(report.findings).toHaveLength(0)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

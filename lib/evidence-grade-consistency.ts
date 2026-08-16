import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CANONICAL_EVIDENCE_GRADES,
  bandFromEvidenceTier,
  gradeTierDistance,
  isCanonicalEvidenceGrade,
  normalizeEvidenceGrade,
  type CanonicalEvidenceGrade,
  type EvidenceBand,
} from './evidence-grade'
import type { ResearchQualityTopology } from './research-quality-topology'

export type EvidenceGradeProfileRecord = {
  slug?: string
  evidence_grade?: unknown
  evidence_grade_reason?: unknown
  evidence_tier?: unknown
  indexability_status?: unknown
  evidence_design_match?: unknown
  evidence_risk_of_bias?: unknown
  evidence_consistency?: unknown
}

export type EvidenceGradeFinding = {
  kind: 'herb' | 'compound'
  slug: string
  url: string
  indexable: boolean
  rawGrade: string
  rawTier: string
  canonicalGrade: CanonicalEvidenceGrade | null
  gradeLetter: string | null
  gradeBand: EvidenceBand | null
  tierBand: EvidenceBand | null
  distance: number | null
  pseudoMultiStudyClaimCount: number
  highConfidencePseudoMultiStudyClaimCount: number
  collapsedPublicationCount: number
  overDependentOnSingleUnderlyingStudy: boolean
  newlyOverDependentAfterIndependenceAdjustment: boolean
  dominantUnderlyingStudySupportedClaimShare: number | null
  effectiveUnderlyingStudyCount: number | null
  issues: string[]
}

export type EvidenceGradeConsistencyReport = {
  generatedAt: string
  canonicalEnum: typeof CANONICAL_EVIDENCE_GRADES
  totals: {
    profiles: number
    indexable: number
    flagged: number
    flaggedIndexable: number
    contradictionsIndexable: number
    topologyContradictionsIndexable: number
    topologyWarningsIndexable: number
    gradeCardRenderable: number
    invalidPublishedGrades: number
  }
  issueCounts: Record<string, number>
  contradictions: EvidenceGradeFinding[]
  topologyContradictions: EvidenceGradeFinding[]
  topologyWarnings: EvidenceGradeFinding[]
  invalid: EvidenceGradeFinding[]
  findings: EvidenceGradeFinding[]
}

function readJson(dataDir: string, file: string): EvidenceGradeProfileRecord[] {
  try {
    const parsed = JSON.parse(readFileSync(path.join(dataDir, file), 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Analyze published profile evidence grades. Legacy grade-vs-tier consistency
 * remains visible, while optional canonical topology adds independence checks.
 * Grade A cannot claim strong evidence when either high-confidence claims only
 * appear multi-study because dependent publications collapse to one underlying
 * study, or the profile as a whole is demonstrably concentrated on one
 * underlying study. Grade B receives advisory warnings for those conditions.
 * Missing lineage never creates either issue.
 */
export function analyzeEvidenceGradeConsistency(
  root = process.cwd(),
  topology?: ResearchQualityTopology,
): EvidenceGradeConsistencyReport {
  const dataDir = path.join(root, 'public', 'data')
  const records: [('herb' | 'compound'), EvidenceGradeProfileRecord[]][] = [
    ['herb', readJson(dataDir, 'herbs.json')],
    ['compound', readJson(dataDir, 'compounds.json')],
  ]
  const findings: EvidenceGradeFinding[] = []

  const pseudoByUrl = new Map<string, {
    claims: number
    highConfidenceClaims: number
    collapsedPublications: number
  }>()
  for (const claim of topology?.underlyingStudyIndependence.pseudoMultiStudyClaims ?? []) {
    const item = pseudoByUrl.get(claim.url) ?? { claims: 0, highConfidenceClaims: 0, collapsedPublications: 0 }
    item.claims += 1
    if (claim.highConfidencePseudoMultiStudySupport) item.highConfidenceClaims += 1
    item.collapsedPublications += claim.collapsedPublicationCount
    pseudoByUrl.set(claim.url, item)
  }
  const independenceProfileByUrl = new Map(
    (topology?.underlyingStudyIndependence.profiles ?? []).map((profile) => [profile.url, profile] as const),
  )

  for (const [kind, rows] of records) {
    for (const record of rows) {
      const slug = String(record.slug ?? '')
      if (!slug) continue

      const url = `/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}/`
      const published = record.evidence_grade
      const normalized = normalizeEvidenceGrade(published)
      const tierBand = bandFromEvidenceTier(record.evidence_tier)
      const distance = gradeTierDistance(normalized.band, tierBand)
      const indexable = String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH'
      const independence = pseudoByUrl.get(url) ?? { claims: 0, highConfidenceClaims: 0, collapsedPublications: 0 }
      const independenceProfile = independenceProfileByUrl.get(url)
      const overDependent = Boolean(independenceProfile?.overDependentOnSingleUnderlyingStudy)
      const newlyOverDependent = Boolean(independenceProfile?.newlyOverDependentAfterIndependenceAdjustment)
      const issues: string[] = []

      const publishedIsValid = published === null || published === undefined || isCanonicalEvidenceGrade(published)
      if (!publishedIsValid) issues.push('invalid-published-grade')
      if (distance !== null && distance >= 2) issues.push('contradicts-evidence-tier')
      else if (distance === 1) issues.push('minor-disagreement')
      if (normalized.outcomeDependent) issues.push('outcome-dependent-grade')
      if (published === null && String(record.evidence_grade_reason ?? '') === 'unresolved') issues.push('missing-grade')

      if (normalized.grade === 'A' && independence.highConfidenceClaims > 0) {
        issues.push('strong-grade-with-pseudo-multi-study-support')
      } else if (normalized.grade === 'B' && independence.claims > 0) {
        issues.push('moderate-grade-with-pseudo-multi-study-support')
      }
      if (normalized.grade === 'A' && overDependent) {
        issues.push('strong-grade-with-underlying-study-concentration')
      } else if (normalized.grade === 'B' && overDependent) {
        issues.push('moderate-grade-with-underlying-study-concentration')
      }
      if (!issues.length) continue

      findings.push({
        kind,
        slug,
        url,
        indexable,
        rawGrade: normalized.raw,
        rawTier: String(record.evidence_tier ?? ''),
        canonicalGrade: normalized.grade,
        gradeLetter: normalized.letter,
        gradeBand: normalized.band,
        tierBand,
        distance,
        pseudoMultiStudyClaimCount: independence.claims,
        highConfidencePseudoMultiStudyClaimCount: independence.highConfidenceClaims,
        collapsedPublicationCount: independence.collapsedPublications,
        overDependentOnSingleUnderlyingStudy: overDependent,
        newlyOverDependentAfterIndependenceAdjustment: newlyOverDependent,
        dominantUnderlyingStudySupportedClaimShare: independenceProfile?.dominantUnderlyingStudySupportedClaimShare ?? null,
        effectiveUnderlyingStudyCount: independenceProfile?.effectiveUnderlyingStudyCount ?? null,
        issues,
      })
    }
  }

  const indexableFindings = findings.filter((finding) => finding.indexable)
  const hasStrongTopologyContradiction = (finding: EvidenceGradeFinding) =>
    finding.issues.includes('strong-grade-with-pseudo-multi-study-support')
    || finding.issues.includes('strong-grade-with-underlying-study-concentration')
  const hasModerateTopologyWarning = (finding: EvidenceGradeFinding) =>
    finding.issues.includes('moderate-grade-with-pseudo-multi-study-support')
    || finding.issues.includes('moderate-grade-with-underlying-study-concentration')

  const topologyContradictions = indexableFindings
    .filter(hasStrongTopologyContradiction)
    .sort((a, b) =>
      Number(b.newlyOverDependentAfterIndependenceAdjustment) - Number(a.newlyOverDependentAfterIndependenceAdjustment)
      || Number(b.overDependentOnSingleUnderlyingStudy) - Number(a.overDependentOnSingleUnderlyingStudy)
      || b.highConfidencePseudoMultiStudyClaimCount - a.highConfidencePseudoMultiStudyClaimCount
      || a.url.localeCompare(b.url),
    )
  const topologyWarnings = indexableFindings
    .filter(hasModerateTopologyWarning)
    .sort((a, b) =>
      Number(b.newlyOverDependentAfterIndependenceAdjustment) - Number(a.newlyOverDependentAfterIndependenceAdjustment)
      || Number(b.overDependentOnSingleUnderlyingStudy) - Number(a.overDependentOnSingleUnderlyingStudy)
      || b.pseudoMultiStudyClaimCount - a.pseudoMultiStudyClaimCount
      || a.url.localeCompare(b.url),
    )
  const contradictions = indexableFindings
    .filter((finding) => finding.issues.includes('contradicts-evidence-tier') || hasStrongTopologyContradiction(finding))
    .sort((a, b) =>
      Number(hasStrongTopologyContradiction(b)) - Number(hasStrongTopologyContradiction(a))
      || (b.distance ?? 0) - (a.distance ?? 0)
      || a.url.localeCompare(b.url),
    )
  const invalid = findings.filter((finding) => finding.issues.includes('invalid-published-grade'))
  const issueCounts: Record<string, number> = {}
  for (const finding of indexableFindings) {
    for (const issue of finding.issues) issueCounts[issue] = (issueCounts[issue] ?? 0) + 1
  }

  const indexableRecords = records.flatMap(([, rows]) =>
    rows.filter((record) => String(record.indexability_status ?? '').toUpperCase() === 'PUBLISH'),
  )
  const gradeCardRenderable = indexableRecords.filter(
    (record) => record.evidence_design_match && record.evidence_risk_of_bias && record.evidence_consistency,
  ).length

  return {
    generatedAt: new Date().toISOString(),
    canonicalEnum: CANONICAL_EVIDENCE_GRADES,
    totals: {
      profiles: records.reduce((sum, [, rows]) => sum + rows.length, 0),
      indexable: indexableRecords.length,
      flagged: findings.length,
      flaggedIndexable: indexableFindings.length,
      contradictionsIndexable: contradictions.length,
      topologyContradictionsIndexable: topologyContradictions.length,
      topologyWarningsIndexable: topologyWarnings.length,
      gradeCardRenderable,
      invalidPublishedGrades: invalid.length,
    },
    issueCounts,
    contradictions,
    topologyContradictions,
    topologyWarnings,
    invalid,
    findings,
  }
}

export function writeEvidenceGradeConsistencyReport(
  report: EvidenceGradeConsistencyReport,
  root = process.cwd(),
): string {
  const reportsDir = path.join(root, 'ops', 'reports')
  const reportPath = path.join(reportsDir, 'evidence-grade-consistency.json')
  mkdirSync(reportsDir, { recursive: true })
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  return reportPath
}

import { buildStudyProvenanceIndex } from './research-provenance-concentration'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type ClaimProvenanceIndependence = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  studyCount: number
  knownAuthorStudyCount: number
  knownJournalStudyCount: number
  distinctFirstAuthorCount: number
  distinctJournalCount: number
  sameFirstAuthorLineage: boolean
  sameJournalLineage: boolean
  provenanceNarrowMultiStudySupport: boolean
  highConfidenceProvenanceNarrowMultiStudySupport: boolean
}

/**
 * Detect multi-study claims whose apparent independence is narrowed by shared
 * publication provenance. Missing metadata never counts as concentration: a
 * claim must have provenance for at least two studies before author/journal
 * lineage can trigger a finding.
 */
export function analyzeClaimProvenanceIndependence(
  analysis: ResearchQualityAnalysis,
): ClaimProvenanceIndependence[] {
  const provenanceByUrl = new Map<string, ReturnType<typeof buildStudyProvenanceIndex>>()
  for (const { url, record } of analysis.profiles) {
    provenanceByUrl.set(url, buildStudyProvenanceIndex(record, analysis.cache))
  }

  return analysis.claimAnalyses
    .filter((claim) => claim.studyCount >= 2)
    .map((claim) => {
      const provenance = provenanceByUrl.get(claim.url) ?? new Map()
      const authors = claim.studyIds
        .map((studyId) => provenance.get(studyId)?.firstAuthor ?? null)
        .filter((value): value is string => Boolean(value))
      const journals = claim.studyIds
        .map((studyId) => provenance.get(studyId)?.journal ?? null)
        .filter((value): value is string => Boolean(value))
      const distinctFirstAuthorCount = new Set(authors).size
      const distinctJournalCount = new Set(journals).size
      const sameFirstAuthorLineage = authors.length >= 2 && distinctFirstAuthorCount === 1
      const sameJournalLineage = journals.length >= 2 && distinctJournalCount === 1
      const provenanceNarrowMultiStudySupport = sameFirstAuthorLineage || sameJournalLineage

      return {
        url: claim.url,
        claimId: claim.claimId,
        predicate: claim.predicate,
        confidence: claim.confidence,
        studyCount: claim.studyCount,
        knownAuthorStudyCount: authors.length,
        knownJournalStudyCount: journals.length,
        distinctFirstAuthorCount,
        distinctJournalCount,
        sameFirstAuthorLineage,
        sameJournalLineage,
        provenanceNarrowMultiStudySupport,
        highConfidenceProvenanceNarrowMultiStudySupport:
          provenanceNarrowMultiStudySupport && claim.confidence >= 0.75,
      }
    })
    .sort((a, b) =>
      Number(b.highConfidenceProvenanceNarrowMultiStudySupport) - Number(a.highConfidenceProvenanceNarrowMultiStudySupport)
      || Number(b.provenanceNarrowMultiStudySupport) - Number(a.provenanceNarrowMultiStudySupport)
      || b.studyCount - a.studyCount
      || b.confidence - a.confidence
      || a.url.localeCompare(b.url)
      || a.claimId.localeCompare(b.claimId),
    )
}

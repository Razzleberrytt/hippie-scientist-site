import {
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
  canonicalStudyGroups,
  type ResearchSource,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export const SYNTHESIS_REFRESH_LAG_YEARS = 5

export type ClaimEvidenceAge = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  outcomeClaim: boolean
  studyCount: number
  knownYearCount: number
  unknownYearCount: number
  oldestYear: number | null
  newestYear: number | null
  medianYear: number | null
  newestEvidenceAge: number | null
  primaryHumanKnownYearCount: number
  synthesisKnownYearCount: number
  newestPrimaryHumanYear: number | null
  newestSynthesisYear: number | null
  synthesisLagYears: number | null
  synthesisOutpacedByNewerPrimaryEvidence: boolean
  highConfidenceSynthesisRefreshGap: boolean
  allKnownEvidenceOlderThan10Years: boolean
  allKnownEvidenceOlderThan15Years: boolean
  legacyOnlyOutcomeClaim: boolean
  highConfidenceLegacyOnlyClaim: boolean
}

export type EvidenceAgeSummary = {
  approvedClaims: number
  claimsWithKnownStudyYears: number
  claimsWithUnknownStudyYears: number
  claimsWithOnlyUnknownStudyYears: number
  synthesisOutpacedClaims: number
  highConfidenceSynthesisRefreshGaps: number
  legacyOnly10Years: number
  legacyOnly15Years: number
  legacyOnlyOutcomeClaims: number
  highConfidenceLegacyOnlyClaims: number
}

function numericYear(value: unknown): number | null {
  const year = Number(value)
  const currentYear = new Date().getFullYear()
  return Number.isInteger(year) && year >= 1800 && year <= currentYear + 1 ? year : null
}

function sourceYears(source: ResearchSource, cache: ResearchQualityAnalysis['cache']): number[] {
  const years = [source.year, source.publishedYear, source.publicationYear]
    .map(numericYear)
    .filter((year): year is number => year !== null)
  const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
  const cachedYear = numericYear((cache[pmid] ?? {}).year)
  if (cachedYear !== null) years.push(cachedYear)
  return [...new Set(years)]
}

function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

/**
 * Build a canonical study -> publication year map from profile sources and the
 * PubMed metadata cache. Conflicting alias years are reduced by median rather
 * than silently choosing the oldest/newest value.
 */
export function canonicalStudyYearMap(analysis: ResearchQualityAnalysis): Map<string, number> {
  const observations = new Map<string, number[]>()

  for (const { record } of analysis.profiles) {
    for (const [studyId, group] of canonicalStudyGroups(record)) {
      const years = group.flatMap((source) => sourceYears(source, analysis.cache))
      if (!years.length) continue
      const existing = observations.get(studyId) ?? []
      existing.push(...years)
      observations.set(studyId, existing)
    }
  }

  const result = new Map<string, number>()
  for (const [studyId, years] of observations) {
    const value = median([...new Set(years)])
    if (value !== null) result.set(studyId, value)
  }
  return result
}

/**
 * Evidence age is a refresh-priority signal, not an evidence grade. Older
 * studies can remain valid. A claim is "legacy-only" only when every study
 * with a known publication year is older than the threshold; unknown years are
 * retained separately so missing metadata cannot masquerade as fresh evidence.
 *
 * A separate design-aware refresh signal detects when the newest linked primary
 * human study is at least five years newer than the newest linked synthesis.
 * This does not say the older review is wrong; it marks a concrete candidate for
 * an updated synthesis because the review cannot cover the newer linked trials.
 */
export function analyzeClaimEvidenceAge(
  analysis: ResearchQualityAnalysis,
  currentYear = Number(process.env.RESEARCH_QUALITY_YEAR) || new Date().getFullYear(),
): ClaimEvidenceAge[] {
  const studyYears = canonicalStudyYearMap(analysis)

  return analysis.claimAnalyses
    .map((claim) => {
      const datedStudies = claim.studyIds
        .map((studyId, index) => ({
          year: studyYears.get(studyId),
          design: claim.designs[index] ?? 'unclassified',
        }))
        .filter((item): item is { year: number; design: (typeof claim.designs)[number] } => typeof item.year === 'number')
      const years = datedStudies.map((item) => item.year).sort((a, b) => a - b)
      const primaryHumanYears = datedStudies
        .filter((item) => PRIMARY_HUMAN_STUDY_CLASSES.has(item.design))
        .map((item) => item.year)
        .sort((a, b) => a - b)
      const synthesisYears = datedStudies
        .filter((item) => SYNTHESIS_STUDY_CLASSES.has(item.design))
        .map((item) => item.year)
        .sort((a, b) => a - b)

      const oldestYear = years[0] ?? null
      const newestYear = years.at(-1) ?? null
      const medianYear = median(years)
      const knownYearCount = years.length
      const unknownYearCount = Math.max(0, claim.studyCount - knownYearCount)
      const newestPrimaryHumanYear = primaryHumanYears.at(-1) ?? null
      const newestSynthesisYear = synthesisYears.at(-1) ?? null
      const synthesisLagYears = newestPrimaryHumanYear !== null && newestSynthesisYear !== null
        ? Math.max(0, newestPrimaryHumanYear - newestSynthesisYear)
        : null
      const synthesisOutpacedByNewerPrimaryEvidence =
        synthesisLagYears !== null && synthesisLagYears >= SYNTHESIS_REFRESH_LAG_YEARS
      const highConfidenceSynthesisRefreshGap =
        synthesisOutpacedByNewerPrimaryEvidence && claim.confidence >= 0.75
      const allKnownEvidenceOlderThan10Years = knownYearCount > 0 && newestYear !== null && currentYear - newestYear > 10
      const allKnownEvidenceOlderThan15Years = knownYearCount > 0 && newestYear !== null && currentYear - newestYear > 15
      const legacyOnlyOutcomeClaim = claim.outcomeClaim && allKnownEvidenceOlderThan10Years
      const highConfidenceLegacyOnlyClaim = claim.confidence >= 0.75 && allKnownEvidenceOlderThan10Years

      return {
        url: claim.url,
        claimId: claim.claimId,
        predicate: claim.predicate,
        confidence: claim.confidence,
        outcomeClaim: claim.outcomeClaim,
        studyCount: claim.studyCount,
        knownYearCount,
        unknownYearCount,
        oldestYear,
        newestYear,
        medianYear,
        newestEvidenceAge: newestYear === null ? null : currentYear - newestYear,
        primaryHumanKnownYearCount: primaryHumanYears.length,
        synthesisKnownYearCount: synthesisYears.length,
        newestPrimaryHumanYear,
        newestSynthesisYear,
        synthesisLagYears,
        synthesisOutpacedByNewerPrimaryEvidence,
        highConfidenceSynthesisRefreshGap,
        allKnownEvidenceOlderThan10Years,
        allKnownEvidenceOlderThan15Years,
        legacyOnlyOutcomeClaim,
        highConfidenceLegacyOnlyClaim,
      }
    })
    .sort((a, b) =>
      Number(b.highConfidenceSynthesisRefreshGap) - Number(a.highConfidenceSynthesisRefreshGap)
      || Number(b.synthesisOutpacedByNewerPrimaryEvidence) - Number(a.synthesisOutpacedByNewerPrimaryEvidence)
      || Number(b.highConfidenceLegacyOnlyClaim) - Number(a.highConfidenceLegacyOnlyClaim)
      || Number(b.legacyOnlyOutcomeClaim) - Number(a.legacyOnlyOutcomeClaim)
      || (b.synthesisLagYears ?? -1) - (a.synthesisLagYears ?? -1)
      || (b.newestEvidenceAge ?? -1) - (a.newestEvidenceAge ?? -1)
      || a.url.localeCompare(b.url)
      || a.claimId.localeCompare(b.claimId),
    )
}

export function summarizeEvidenceAge(claims: ClaimEvidenceAge[]): EvidenceAgeSummary {
  return {
    approvedClaims: claims.length,
    claimsWithKnownStudyYears: claims.filter((claim) => claim.knownYearCount > 0).length,
    claimsWithUnknownStudyYears: claims.filter((claim) => claim.unknownYearCount > 0).length,
    claimsWithOnlyUnknownStudyYears: claims.filter((claim) => claim.studyCount > 0 && claim.knownYearCount === 0).length,
    synthesisOutpacedClaims: claims.filter((claim) => claim.synthesisOutpacedByNewerPrimaryEvidence).length,
    highConfidenceSynthesisRefreshGaps: claims.filter((claim) => claim.highConfidenceSynthesisRefreshGap).length,
    legacyOnly10Years: claims.filter((claim) => claim.allKnownEvidenceOlderThan10Years).length,
    legacyOnly15Years: claims.filter((claim) => claim.allKnownEvidenceOlderThan15Years).length,
    legacyOnlyOutcomeClaims: claims.filter((claim) => claim.legacyOnlyOutcomeClaim).length,
    highConfidenceLegacyOnlyClaims: claims.filter((claim) => claim.highConfidenceLegacyOnlyClaim).length,
  }
}

import { canonicalStudyGroups, type ResearchProfile } from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type StudyProvenance = {
  firstAuthor: string | null
  journal: string | null
  firstAuthorCandidates: string[]
  journalCandidates: string[]
  firstAuthorConflict: boolean
  journalConflict: boolean
}

export type StudyProvenanceConflict = {
  url: string
  studyId: string
  firstAuthorCandidates: string[]
  journalCandidates: string[]
  firstAuthorConflict: boolean
  journalConflict: boolean
}

export type ProvenanceConcentrationProfile = {
  url: string
  claimStudyEdges: number
  authorKnownEdges: number
  journalKnownEdges: number
  authorMetadataCoverage: number
  journalMetadataCoverage: number
  dominantFirstAuthor: string | null
  dominantFirstAuthorEdges: number
  dominantFirstAuthorStudyCount: number
  dominantFirstAuthorEdgeShare: number
  dominantJournal: string | null
  dominantJournalEdges: number
  dominantJournalStudyCount: number
  dominantJournalEdgeShare: number
  firstAuthorConcentrated: boolean
  journalConcentrated: boolean
  provenanceConcentrated: boolean
}

export type ProvenanceConcentrationAnalysis = {
  profiles: ProvenanceConcentrationProfile[]
  summary: {
    profilesAnalyzed: number
    profilesWithSufficientAuthorMetadata: number
    profilesWithSufficientJournalMetadata: number
    firstAuthorConcentratedProfiles: number
    journalConcentratedProfiles: number
    provenanceConcentratedProfiles: number
  }
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function normalizeToken(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function normalizeProvenanceToken(value: unknown): string | null {
  const normalized = normalizeToken(value).toLowerCase()
  return normalized || null
}

function sourceProvenance(
  source: Record<string, unknown>,
  cache: ResearchQualityAnalysis['cache'],
): { firstAuthor: string | null; journal: string | null } {
  const pmid = normalizeToken(source.pmid ?? source.pubmedId)
  const meta = (cache[pmid] ?? {}) as { authorList?: unknown; authors?: unknown; journal?: unknown }
  const metaAuthors = Array.isArray(meta.authorList)
    ? meta.authorList.map(normalizeToken).filter(Boolean)
    : Array.isArray(meta.authors)
      ? meta.authors.map(normalizeToken).filter(Boolean)
      : []
  const sourceAuthors = Array.isArray(source.authorList)
    ? source.authorList.map(normalizeToken).filter(Boolean)
    : Array.isArray(source.authors)
      ? source.authors.map(normalizeToken).filter(Boolean)
      : []
  const firstAuthor = normalizeProvenanceToken(
    metaAuthors[0] || sourceAuthors[0] || source.firstAuthor,
  )
  const journal = normalizeProvenanceToken(meta.journal || source.journal)
  return { firstAuthor, journal }
}

function consensus(values: Array<string | null>): {
  value: string | null
  candidates: string[]
  conflict: boolean
} {
  const candidates = [...new Set(values.filter((value): value is string => Boolean(value)))].sort()
  return {
    value: candidates.length === 1 ? candidates[0] : null,
    candidates,
    conflict: candidates.length > 1,
  }
}

/**
 * Resolve canonical study provenance from every alias row. PubMed metadata is
 * preferred per alias when available. Group-level provenance is emitted only
 * when all known aliases agree; conflicts are explicit instead of depending on
 * source-row order.
 */
function provenanceForGroup(
  group: Array<Record<string, unknown>>,
  cache: ResearchQualityAnalysis['cache'],
): StudyProvenance {
  const resolved = group.map((source) => sourceProvenance(source, cache))
  const authors = consensus(resolved.map((item) => item.firstAuthor))
  const journals = consensus(resolved.map((item) => item.journal))
  return {
    firstAuthor: authors.value,
    journal: journals.value,
    firstAuthorCandidates: authors.candidates,
    journalCandidates: journals.candidates,
    firstAuthorConflict: authors.conflict,
    journalConflict: journals.conflict,
  }
}

/** Build the canonical provenance lookup once so profile- and claim-level topology share identical metadata resolution. */
export function buildStudyProvenanceIndex(
  record: ResearchProfile,
  cache: ResearchQualityAnalysis['cache'],
): Map<string, StudyProvenance> {
  const index = new Map<string, StudyProvenance>()
  for (const [studyId, group] of canonicalStudyGroups(record)) {
    index.set(studyId, provenanceForGroup(group, cache))
  }
  return index
}

export function analyzeStudyProvenanceConflicts(
  analysis: ResearchQualityAnalysis,
): StudyProvenanceConflict[] {
  const conflicts: StudyProvenanceConflict[] = []
  for (const { url, record } of analysis.profiles) {
    for (const [studyId, provenance] of buildStudyProvenanceIndex(record, analysis.cache)) {
      if (!provenance.firstAuthorConflict && !provenance.journalConflict) continue
      conflicts.push({
        url,
        studyId,
        firstAuthorCandidates: provenance.firstAuthorCandidates,
        journalCandidates: provenance.journalCandidates,
        firstAuthorConflict: provenance.firstAuthorConflict,
        journalConflict: provenance.journalConflict,
      })
    }
  }
  return conflicts.sort((a, b) =>
    Number(b.firstAuthorConflict) - Number(a.firstAuthorConflict)
    || Number(b.journalConflict) - Number(a.journalConflict)
    || a.url.localeCompare(b.url)
    || a.studyId.localeCompare(b.studyId),
  )
}

function dominant(
  edgeCounts: Map<string, number>,
  studySets: Map<string, Set<string>>,
): { key: string | null; edges: number; studies: number } {
  const ranked = [...edgeCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const [key, edges] = ranked[0] ?? [null, 0]
  return { key, edges, studies: key ? (studySets.get(key)?.size ?? 0) : 0 }
}

/**
 * Measure whether approved claim-study edges are disproportionately carried by
 * publications from the same first-author lineage or journal. Missing or
 * conflicting provenance lowers coverage; it never counts as concentration.
 */
export function analyzeProvenanceConcentration(analysis: ResearchQualityAnalysis): ProvenanceConcentrationAnalysis {
  const claimsByUrl = new Map<string, typeof analysis.claimAnalyses>()
  for (const claim of analysis.claimAnalyses) {
    const claims = claimsByUrl.get(claim.url) ?? []
    claims.push(claim)
    claimsByUrl.set(claim.url, claims)
  }

  const profiles: ProvenanceConcentrationProfile[] = []
  for (const { url, record } of analysis.profiles) {
    const claims = claimsByUrl.get(url) ?? []
    if (!claims.length) continue

    const provenanceByStudy = buildStudyProvenanceIndex(record, analysis.cache)
    const authorEdges = new Map<string, number>()
    const journalEdges = new Map<string, number>()
    const authorStudies = new Map<string, Set<string>>()
    const journalStudies = new Map<string, Set<string>>()
    let claimStudyEdges = 0
    let authorKnownEdges = 0
    let journalKnownEdges = 0

    for (const claim of claims) {
      for (const studyId of claim.studyIds) {
        claimStudyEdges += 1
        const provenance = provenanceByStudy.get(studyId)
        if (!provenance) continue
        if (provenance.firstAuthor) {
          authorKnownEdges += 1
          authorEdges.set(provenance.firstAuthor, (authorEdges.get(provenance.firstAuthor) ?? 0) + 1)
          const studies = authorStudies.get(provenance.firstAuthor) ?? new Set<string>()
          studies.add(studyId)
          authorStudies.set(provenance.firstAuthor, studies)
        }
        if (provenance.journal) {
          journalKnownEdges += 1
          journalEdges.set(provenance.journal, (journalEdges.get(provenance.journal) ?? 0) + 1)
          const studies = journalStudies.get(provenance.journal) ?? new Set<string>()
          studies.add(studyId)
          journalStudies.set(provenance.journal, studies)
        }
      }
    }

    const authorTop = dominant(authorEdges, authorStudies)
    const journalTop = dominant(journalEdges, journalStudies)
    const authorMetadataCoverage = claimStudyEdges ? authorKnownEdges / claimStudyEdges : 0
    const journalMetadataCoverage = claimStudyEdges ? journalKnownEdges / claimStudyEdges : 0
    const dominantFirstAuthorEdgeShare = authorKnownEdges ? authorTop.edges / authorKnownEdges : 0
    const dominantJournalEdgeShare = journalKnownEdges ? journalTop.edges / journalKnownEdges : 0

    const firstAuthorConcentrated =
      authorKnownEdges >= 4
      && authorMetadataCoverage >= 0.6
      && authorTop.studies >= 2
      && dominantFirstAuthorEdgeShare >= 0.6
    const journalConcentrated =
      journalKnownEdges >= 5
      && journalMetadataCoverage >= 0.6
      && journalTop.studies >= 3
      && dominantJournalEdgeShare >= 0.7

    profiles.push({
      url,
      claimStudyEdges,
      authorKnownEdges,
      journalKnownEdges,
      authorMetadataCoverage: round(authorMetadataCoverage),
      journalMetadataCoverage: round(journalMetadataCoverage),
      dominantFirstAuthor: authorTop.key,
      dominantFirstAuthorEdges: authorTop.edges,
      dominantFirstAuthorStudyCount: authorTop.studies,
      dominantFirstAuthorEdgeShare: round(dominantFirstAuthorEdgeShare),
      dominantJournal: journalTop.key,
      dominantJournalEdges: journalTop.edges,
      dominantJournalStudyCount: journalTop.studies,
      dominantJournalEdgeShare: round(dominantJournalEdgeShare),
      firstAuthorConcentrated,
      journalConcentrated,
      provenanceConcentrated: firstAuthorConcentrated || journalConcentrated,
    })
  }

  profiles.sort((a, b) =>
    Number(b.provenanceConcentrated) - Number(a.provenanceConcentrated)
    || Math.max(b.dominantFirstAuthorEdgeShare, b.dominantJournalEdgeShare) - Math.max(a.dominantFirstAuthorEdgeShare, a.dominantJournalEdgeShare)
    || b.claimStudyEdges - a.claimStudyEdges
    || a.url.localeCompare(b.url),
  )

  return {
    profiles,
    summary: {
      profilesAnalyzed: profiles.length,
      profilesWithSufficientAuthorMetadata: profiles.filter((profile) => profile.authorMetadataCoverage >= 0.6).length,
      profilesWithSufficientJournalMetadata: profiles.filter((profile) => profile.journalMetadataCoverage >= 0.6).length,
      firstAuthorConcentratedProfiles: profiles.filter((profile) => profile.firstAuthorConcentrated).length,
      journalConcentratedProfiles: profiles.filter((profile) => profile.journalConcentrated).length,
      provenanceConcentratedProfiles: profiles.filter((profile) => profile.provenanceConcentrated).length,
    },
  }
}

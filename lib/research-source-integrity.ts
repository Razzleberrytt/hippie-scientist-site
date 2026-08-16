import { normalizeDoi, normalizePmidList } from './citation-identifiers.mjs'
import {
  canonicalStudyClass,
  canonicalStudyGroups,
  crossProfileStudyIdentity,
  crossProfileStudyIdentityMap,
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
  type ResearchSource,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { StudyClass } from './study-class'

const WITHDRAWN = /retract|expression of concern|withdrawn/i

export type SourceIntegrityStudy = {
  studyId: string
  pmid: string
  doi: string
  pageCount: number
  pages: string[]
  title: string
  journal: string
  year: number | null
  design: StudyClass
  publicationTypes: string[]
  hasMetadata: boolean
}

export type ResearchSourceIntegrity = {
  currentYear: number
  summary: {
    citedStudies: number
    withMetadata: number
    withStableIdentifier: number
    pmidIdentified: number
    doiOnly: number
    fallbackOnly: number
    citedOnMultipleProfiles: number
    loadBearing: number
    oldAndLoadBearing: number
    withdrawn: number
    age: Record<'within5' | 'within10' | 'within20' | 'over20', number>
    designMix: Record<string, number>
    humanPrimary: number
    synthesis: number
    medianYear: number | null
  }
  withdrawn: SourceIntegrityStudy[]
  mostReferenced: SourceIntegrityStudy[]
  oldAndLoadBearing: SourceIntegrityStudy[]
  studies: SourceIntegrityStudy[]
}

type StudyAggregate = { pages: Set<string>; sources: ResearchSource[] }

function firstText(values: unknown[]): string {
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (text) return text
  }
  return ''
}

function canonicalStudyGraph(analysis: ResearchQualityAnalysis): Map<string, StudyAggregate> {
  const globalIdentities = crossProfileStudyIdentityMap(analysis.profiles)
  const studies = new Map<string, StudyAggregate>()

  for (const { url, record } of analysis.profiles) {
    for (const [localStudyId, group] of canonicalStudyGroups(record)) {
      const studyId = crossProfileStudyIdentity(url, localStudyId, globalIdentities)
      const item = studies.get(studyId) ?? { pages: new Set<string>(), sources: [] }
      item.pages.add(url)
      item.sources.push(...group)
      studies.set(studyId, item)
    }
  }
  return studies
}

function summarizeStudy(
  studyId: string,
  aggregate: StudyAggregate,
  analysis: ResearchQualityAnalysis,
): SourceIntegrityStudy {
  const pmids = [...new Set(aggregate.sources.flatMap((source) => normalizePmidList(source.pmid ?? source.pubmedId)))]
  const dois = [...new Set(aggregate.sources.map((source) => normalizeDoi(source.doi)).filter(Boolean))]
  const metadata = pmids
    .map((pmid) => analysis.cache[pmid] ?? {})
    .filter((record) => Object.keys(record).length > 0) as Array<Record<string, unknown>>

  const publicationTypes = [...new Set([
    ...metadata.flatMap((record) => Array.isArray(record.publicationTypes) ? record.publicationTypes.map(String) : []),
    ...aggregate.sources.flatMap((source) => Array.isArray(source.publicationTypes) ? source.publicationTypes.map(String) : []),
  ])]
  const title = firstText([
    ...metadata.map((record) => record.title),
    ...aggregate.sources.map((source) => source.title),
  ]).slice(0, 120)
  const journal = firstText([
    ...metadata.map((record) => record.journal),
    ...aggregate.sources.map((source) => source.journal),
  ])
  const rawYear = firstText([
    ...metadata.map((record) => record.year),
    ...aggregate.sources.map((source) => source.year),
  ])
  const year = Number.isFinite(Number(rawYear)) ? Number(rawYear) : null

  return {
    studyId,
    pmid: pmids[0] ?? '',
    doi: dois[0] ?? '',
    pageCount: aggregate.pages.size,
    pages: [...aggregate.pages].sort(),
    title,
    journal,
    year,
    design: canonicalStudyClass(aggregate.sources, analysis.cache),
    publicationTypes,
    hasMetadata: Boolean(title),
  }
}

/**
 * Source-level integrity facts derived from the same site-wide canonical study
 * identities used by cross-profile topology. DOI-only and identifier-less local
 * studies remain visible instead of disappearing from PMID-only accounting.
 */
export function analyzeResearchSourceIntegrity(
  analysis: ResearchQualityAnalysis,
  currentYear = Number(process.env.SOURCE_AUDIT_YEAR) || new Date().getFullYear(),
): ResearchSourceIntegrity {
  const studies = [...canonicalStudyGraph(analysis).entries()]
    .map(([studyId, aggregate]) => summarizeStudy(studyId, aggregate, analysis))
    .sort((a, b) => b.pageCount - a.pageCount || (a.year ?? 0) - (b.year ?? 0) || a.studyId.localeCompare(b.studyId))

  const withdrawn = studies.filter((study) => study.publicationTypes.some((type) => WITHDRAWN.test(type)))
  const dated = studies.filter((study): study is SourceIntegrityStudy & { year: number } => typeof study.year === 'number')
  const age: Record<'within5' | 'within10' | 'within20' | 'over20', number> = {
    within5: 0,
    within10: 0,
    within20: 0,
    over20: 0,
  }

  for (const study of dated) {
    const years = currentYear - study.year
    if (years <= 5) age.within5 += 1
    else if (years <= 10) age.within10 += 1
    else if (years <= 20) age.within20 += 1
    else age.over20 += 1
  }

  const designMix: Record<string, number> = {}
  for (const study of studies) designMix[study.design] = (designMix[study.design] ?? 0) + 1
  const loadBearing = studies.filter((study) => study.pageCount >= 3)
  const oldAndLoadBearing = loadBearing.filter((study) => study.year !== null && currentYear - study.year > 15)
  const humanPrimary = studies.filter((study) => PRIMARY_HUMAN_STUDY_CLASSES.has(study.design)).length
  const synthesis = studies.filter((study) => SYNTHESIS_STUDY_CLASSES.has(study.design)).length
  const sortedYears = dated.map((study) => study.year).sort((a, b) => a - b)

  return {
    currentYear,
    summary: {
      citedStudies: studies.length,
      withMetadata: studies.filter((study) => study.hasMetadata).length,
      withStableIdentifier: studies.filter((study) => Boolean(study.pmid || study.doi)).length,
      pmidIdentified: studies.filter((study) => Boolean(study.pmid)).length,
      doiOnly: studies.filter((study) => Boolean(study.doi) && !study.pmid).length,
      fallbackOnly: studies.filter((study) => !study.pmid && !study.doi).length,
      citedOnMultipleProfiles: studies.filter((study) => study.pageCount > 1).length,
      loadBearing: loadBearing.length,
      oldAndLoadBearing: oldAndLoadBearing.length,
      withdrawn: withdrawn.length,
      age,
      designMix,
      humanPrimary,
      synthesis,
      medianYear: sortedYears.length ? sortedYears[Math.floor(sortedYears.length / 2)] : null,
    },
    withdrawn,
    mostReferenced: studies.slice(0, 40),
    oldAndLoadBearing,
    studies,
  }
}

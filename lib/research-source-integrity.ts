import {
  designFromPublicationTypes,
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { StudyClass } from './study-class'

const WITHDRAWN = /retract|expression of concern|withdrawn/i

export type SourceIntegrityStudy = {
  pmid: string
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

function citationGraph(analysis: ResearchQualityAnalysis): Map<string, Set<string>> {
  const referencedBy = new Map<string, Set<string>>()
  for (const { url, record } of analysis.profiles) {
    for (const source of Array.isArray(record.sources) ? record.sources : []) {
      const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
      if (!pmid) continue
      const pages = referencedBy.get(pmid) ?? new Set<string>()
      pages.add(url)
      referencedBy.set(pmid, pages)
    }
  }
  return referencedBy
}

/**
 * Source-level integrity facts derived from an already-built canonical research
 * analysis. This deliberately excludes claim/profile topology; that belongs to
 * research-quality-analysis and research-quality-policy rather than a second
 * competing source-integrity report.
 */
export function analyzeResearchSourceIntegrity(
  analysis: ResearchQualityAnalysis,
  currentYear = Number(process.env.SOURCE_AUDIT_YEAR) || new Date().getFullYear(),
): ResearchSourceIntegrity {
  const referencedBy = citationGraph(analysis)
  const studies: SourceIntegrityStudy[] = [...referencedBy.entries()].map(([pmid, pages]) => {
    const meta = (analysis.cache[pmid] ?? {}) as {
      title?: string
      journal?: string
      year?: number
      publicationTypes?: string[]
    }
    return {
      pmid,
      pageCount: pages.size,
      pages: [...pages].sort(),
      title: String(meta.title ?? '').slice(0, 120),
      journal: String(meta.journal ?? ''),
      year: Number.isFinite(Number(meta.year)) ? Number(meta.year) : null,
      design: designFromPublicationTypes(meta.publicationTypes ?? []),
      publicationTypes: meta.publicationTypes ?? [],
      hasMetadata: Boolean(meta.title),
    }
  })

  studies.sort((a, b) => b.pageCount - a.pageCount || (a.year ?? 0) - (b.year ?? 0) || a.pmid.localeCompare(b.pmid))
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

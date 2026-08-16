/** Canonical research/source integrity and coverage-topology audit. */

import fs from 'node:fs'
import path from 'node:path'

import { analyzeResearchQuality } from '../../lib/research-quality-analysis'
import {
  designFromPublicationTypes,
  PRIMARY_HUMAN_STUDY_CLASSES,
  SYNTHESIS_STUDY_CLASSES,
} from '../../lib/research-coverage'
import { STUDY_CLASS_INFO, type StudyClass } from '../../lib/study-class'

const ROOT = process.cwd()
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'source-integrity.json')
const WITHDRAWN = /retract|expression of concern|withdrawn/i
const CURRENT_YEAR = Number(process.env.SOURCE_AUDIT_YEAR) || new Date().getFullYear()

function buildCitationGraph(profiles: ReturnType<typeof analyzeResearchQuality>['profiles']): Map<string, Set<string>> {
  const referencedBy = new Map<string, Set<string>>()
  for (const { url, record } of profiles) {
    for (const source of Array.isArray(record.sources) ? record.sources : []) {
      const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
      if (!pmid) continue
      if (!referencedBy.has(pmid)) referencedBy.set(pmid, new Set())
      referencedBy.get(pmid)!.add(url)
    }
  }
  return referencedBy
}

function main() {
  const { cache, profiles, profileAnalyses: profileTopology } = analyzeResearchQuality(ROOT)
  const referencedBy = buildCitationGraph(profiles)

  const studies = [...referencedBy.entries()].map(([pmid, pages]) => {
    const meta = (cache[pmid] ?? {}) as { title?: string; journal?: string; year?: number; publicationTypes?: string[] }
    return {
      pmid,
      pageCount: pages.size,
      pages: [...pages].sort(),
      title: String(meta.title ?? '').slice(0, 120),
      journal: meta.journal ?? '',
      year: meta.year ?? null,
      design: designFromPublicationTypes(meta.publicationTypes ?? []),
      publicationTypes: meta.publicationTypes ?? [],
      hasMetadata: Boolean(meta.title),
    }
  })

  studies.sort((a, b) => b.pageCount - a.pageCount || (a.year ?? 0) - (b.year ?? 0))
  const withdrawn = studies.filter((study) => study.publicationTypes.some((type) => WITHDRAWN.test(type)))
  const dated = studies.filter((study) => study.year)
  const age: Record<string, number> = { within5: 0, within10: 0, within20: 0, over20: 0 }
  for (const study of dated) {
    const years = CURRENT_YEAR - study.year!
    if (years <= 5) age.within5 += 1
    else if (years <= 10) age.within10 += 1
    else if (years <= 20) age.within20 += 1
    else age.over20 += 1
  }

  const designMix: Record<string, number> = {}
  for (const study of studies) designMix[study.design] = (designMix[study.design] ?? 0) + 1
  const central = studies.filter((study) => study.pageCount >= 3)
  const oldAndCentral = central.filter((study) => study.year && CURRENT_YEAR - study.year > 15)
  const humanPrimary = studies.filter((study) => PRIMARY_HUMAN_STUDY_CLASSES.has(study.design)).length
  const synthesis = studies.filter((study) => SYNTHESIS_STUDY_CLASSES.has(study.design)).length

  const unsupportedClaims = profileTopology.flatMap((p) => p.unsupportedApprovedClaims.map((claimId) => ({ url: p.url, claimId })))
  const danglingRefs = profileTopology.flatMap((p) => p.danglingSourceRefs.map((item) => ({ url: p.url, ...item })))
  const singleStudyClaims = profileTopology.flatMap((p) => p.singleStudyApprovedClaims.map((claimId) => ({ url: p.url, claimId })))
  const aliasCollapsedClaims = profileTopology.flatMap((p) => p.aliasCollapsedClaims.map((claimId) => ({ url: p.url, claimId })))
  const concentratedProfiles = profileTopology
    .filter((p) => p.approvedClaimCount >= 3 && p.studyDependencyShare >= 0.5)
    .sort((a, b) => b.studyDependencyShare - a.studyDependencyShare || b.approvedClaimCount - a.approvedClaimCount)
  const reviewDominatedProfiles = profileTopology.filter((p) => p.reviewDominated)
  const noPrimaryHumanProfiles = profileTopology.filter((p) => p.noPrimaryHuman)

  const summary = {
    citedStudies: studies.length,
    withMetadata: studies.filter((study) => study.hasMetadata).length,
    citedOnMultipleProfiles: studies.filter((study) => study.pageCount > 1).length,
    loadBearing: central.length,
    oldAndLoadBearing: oldAndCentral.length,
    withdrawn: withdrawn.length,
    age,
    designMix,
    humanPrimary,
    synthesis,
    medianYear: dated.length ? dated.map((study) => study.year!).sort((a, b) => a - b)[Math.floor(dated.length / 2)] : null,
    profiles: profileTopology.length,
    approvedClaims: profileTopology.reduce((sum, profile) => sum + profile.approvedClaimCount, 0),
    unsupportedApprovedClaims: unsupportedClaims.length,
    singleStudyApprovedClaims: singleStudyClaims.length,
    aliasCollapsedClaims: aliasCollapsedClaims.length,
    danglingClaimSourceRefs: danglingRefs.length,
    concentratedProfiles: concentratedProfiles.length,
    reviewDominatedProfiles: reviewDominatedProfiles.length,
    profilesWithClaimsButNoPrimaryHumanStudy: noPrimaryHumanProfiles.length,
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    currentYear: CURRENT_YEAR,
    summary,
    claimTopology: {
      unsupportedClaims,
      singleStudyClaims,
      aliasCollapsedClaims,
      danglingRefs,
      concentratedProfiles,
      reviewDominatedProfiles,
      noPrimaryHumanProfiles,
      profiles: profileTopology,
    },
    withdrawn,
    mostReferenced: studies.slice(0, 40),
    oldAndLoadBearing: oldAndCentral,
  }, null, 2)}\n`)

  console.log('\nResearch coverage topology')
  console.log('='.repeat(72))
  console.log(`Profiles analyzed           ${summary.profiles}`)
  console.log(`Approved structured claims  ${summary.approvedClaims}`)
  console.log(`Unsupported approved claims ${summary.unsupportedApprovedClaims}`)
  console.log(`Single-study claims         ${summary.singleStudyApprovedClaims}`)
  console.log(`Alias-collapsed claims      ${summary.aliasCollapsedClaims}`)
  console.log(`Dangling claim source refs  ${summary.danglingClaimSourceRefs}`)
  console.log(`Concentrated profiles       ${summary.concentratedProfiles}`)
  console.log(`Review-dominated profiles   ${summary.reviewDominatedProfiles}`)
  console.log(`Claims, no primary human    ${summary.profilesWithClaimsButNoPrimaryHumanStudy}`)
  console.log(`\nCited studies               ${summary.citedStudies} (${summary.withMetadata} with PubMed metadata)`)
  console.log(`Load-bearing (>=3 pages)    ${summary.loadBearing}`)
  console.log(`Retracted / concern         ${summary.withdrawn}`)
  console.log(`Primary human ${humanPrimary} · synthesis ${synthesis} · other ${summary.citedStudies - humanPrimary - synthesis}`)
  console.log('\nDesign mix:')
  for (const [design, count] of Object.entries(designMix).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(count).padStart(4)}  ${STUDY_CLASS_INFO[design as StudyClass]?.label ?? design}`)
  }
  if (concentratedProfiles.length) {
    console.log('\nHighest claim-study concentration:')
    for (const profile of concentratedProfiles.slice(0, 10)) {
      console.log(`  ${(profile.studyDependencyShare * 100).toFixed(0).padStart(3)}% · ${profile.approvedClaimCount} claims · ${profile.url}`)
    }
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (withdrawn.length) {
    console.error(`\n[source-integrity] FAILED — ${withdrawn.length} retracted or withdrawn study still cited.\n`)
    for (const study of withdrawn) {
      console.error(`  PMID ${study.pmid} [${study.publicationTypes.join(', ')}] cited by ${study.pages.join(', ')}`)
    }
    process.exit(1)
  }
}

main()

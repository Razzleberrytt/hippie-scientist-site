/**
 * Canonical research/source integrity audit.
 *
 * Measures both the global study graph and the profile-local claim graph:
 *  1. Which studies are load-bearing across the site.
 *  2. Retractions / expressions of concern.
 *  3. Citation age and study-design mix.
 *  4. Per-profile evidence mix (primary human, synthesis, narrative review, other).
 *  5. Claim dependency concentration: unsupported claims, single-source claims,
 *     dangling source references, and profiles whose approved claims repeatedly
 *     depend on the same study.
 *
 * Retractions remain blocking here. Claim-coverage defects are reported for
 * editorial triage; the dedicated research-quality gate can decide which of
 * those should block release.
 */

import fs from 'node:fs'
import path from 'node:path'

import { normalizeStudyClass, strongestStudyClass, STUDY_CLASS_INFO, type StudyClass } from '../../lib/study-class'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const REPORT_PATH = path.join(REPORTS_DIR, 'source-integrity.json')
const WITHDRAWN = /retract|expression of concern|withdrawn/i
const CURRENT_YEAR = Number(process.env.SOURCE_AUDIT_YEAR) || new Date().getFullYear()

const PRIMARY_HUMAN = new Set<StudyClass>(['rct', 'controlled-trial', 'uncontrolled-trial'])
const SYNTHESIS = new Set<StudyClass>(['meta-analysis', 'systematic-review'])
const NARRATIVE = new Set<StudyClass>(['narrative-review'])

type SourceRecord = {
  id?: string
  pmid?: string
  pubmedId?: string
  studyClass?: string
  studyType?: string
}

type ClaimRecord = {
  id?: string
  claim?: string
  reviewStatus?: string
  sourceRefIds?: string[]
}

type ProfileRecord = {
  slug?: string
  sources?: SourceRecord[]
  claimMap?: ClaimRecord[]
}

type ProfileAnalysis = {
  url: string
  sourceCount: number
  claimCount: number
  approvedClaimCount: number
  designMix: Record<string, number>
  primaryHuman: number
  synthesis: number
  narrativeReview: number
  unsupportedApprovedClaims: string[]
  singleSourceApprovedClaims: string[]
  danglingSourceRefs: Array<{ claimId: string; sourceRefId: string }>
  mostUsedSourceRef: string | null
  mostUsedSourceClaimCount: number
  sourceDependencyShare: number
  reviewDominated: boolean
  noPrimaryHuman: boolean
}

function loadCache(): Record<string, Record<string, unknown>> {
  if (!fs.existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')).records ?? {}
  } catch {
    return {}
  }
}

function designOf(meta: { publicationTypes?: string[] }): StudyClass {
  const classes = (meta.publicationTypes ?? [])
    .filter((type) => !/^journal article$/i.test(type))
    .map((type) => normalizeStudyClass(type))
    .filter((studyClass) => studyClass !== 'unclassified')
  return strongestStudyClass(classes)
}

function sourceDesign(source: SourceRecord, cache: Record<string, Record<string, unknown>>): StudyClass {
  const explicit = normalizeStudyClass(source.studyClass ?? source.studyType ?? '')
  if (explicit !== 'unclassified') return explicit
  const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
  const meta = (cache[pmid] ?? {}) as { publicationTypes?: string[] }
  return meta.publicationTypes ? designOf(meta) : 'unclassified'
}

function profileRecords(): Array<{ url: string; record: ProfileRecord }> {
  const profiles: Array<{ url: string; record: ProfileRecord }> = []
  for (const [dir, kind] of [
    ['herbs-detail', 'herbs'],
    ['compounds-detail', 'compounds'],
  ]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      try {
        const record = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8')) as ProfileRecord
        profiles.push({ url: `/${kind}/${record.slug ?? file.replace(/\.json$/, '')}/`, record })
      } catch {
        // Parsing defects are owned by the data validators.
      }
    }
  }
  return profiles
}

function buildCitationGraph(profiles: Array<{ url: string; record: ProfileRecord }>): Map<string, Set<string>> {
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

function analyzeProfile(url: string, record: ProfileRecord, cache: Record<string, Record<string, unknown>>): ProfileAnalysis {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const claims = Array.isArray(record.claimMap) ? record.claimMap : []
  const sourceById = new Map(sources.filter((s) => s.id).map((s) => [String(s.id), s]))
  const designMix: Record<string, number> = {}
  let primaryHuman = 0
  let synthesis = 0
  let narrativeReview = 0

  for (const source of sources) {
    const design = sourceDesign(source, cache)
    designMix[design] = (designMix[design] ?? 0) + 1
    if (PRIMARY_HUMAN.has(design)) primaryHuman += 1
    if (SYNTHESIS.has(design)) synthesis += 1
    if (NARRATIVE.has(design)) narrativeReview += 1
  }

  const approved = claims.filter((claim) => String(claim.reviewStatus ?? '').toLowerCase() === 'approved')
  const unsupportedApprovedClaims: string[] = []
  const singleSourceApprovedClaims: string[] = []
  const danglingSourceRefs: Array<{ claimId: string; sourceRefId: string }> = []
  const sourceUse = new Map<string, number>()

  for (const claim of approved) {
    const claimId = String(claim.id ?? 'unknown-claim')
    const refs = [...new Set(Array.isArray(claim.sourceRefIds) ? claim.sourceRefIds.map(String).filter(Boolean) : [])]
    if (refs.length === 0) unsupportedApprovedClaims.push(claimId)
    if (refs.length === 1) singleSourceApprovedClaims.push(claimId)
    for (const ref of refs) {
      if (!sourceById.has(ref)) danglingSourceRefs.push({ claimId, sourceRefId: ref })
      else sourceUse.set(ref, (sourceUse.get(ref) ?? 0) + 1)
    }
  }

  const mostUsed = [...sourceUse.entries()].sort((a, b) => b[1] - a[1])[0] ?? null
  const mostUsedSourceClaimCount = mostUsed?.[1] ?? 0
  const sourceDependencyShare = approved.length ? mostUsedSourceClaimCount / approved.length : 0
  const classified = primaryHuman + synthesis + narrativeReview

  return {
    url,
    sourceCount: sources.length,
    claimCount: claims.length,
    approvedClaimCount: approved.length,
    designMix,
    primaryHuman,
    synthesis,
    narrativeReview,
    unsupportedApprovedClaims,
    singleSourceApprovedClaims,
    danglingSourceRefs,
    mostUsedSourceRef: mostUsed?.[0] ?? null,
    mostUsedSourceClaimCount,
    sourceDependencyShare: Number(sourceDependencyShare.toFixed(3)),
    reviewDominated: classified >= 3 && narrativeReview / classified >= 0.6,
    noPrimaryHuman: approved.length > 0 && primaryHuman === 0,
  }
}

function main() {
  const cache = loadCache()
  const profiles = profileRecords()
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
      design: (meta.publicationTypes ? designOf(meta) : 'unclassified') as StudyClass,
      publicationTypes: meta.publicationTypes ?? [],
      hasMetadata: Boolean(meta.title),
    }
  })

  studies.sort((a, b) => b.pageCount - a.pageCount || (a.year ?? 0) - (b.year ?? 0))
  const withdrawn = studies.filter((s) => s.publicationTypes.some((t) => WITHDRAWN.test(t)))
  const dated = studies.filter((s) => s.year)
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
  const central = studies.filter((s) => s.pageCount >= 3)
  const oldAndCentral = central.filter((s) => s.year && CURRENT_YEAR - s.year > 15)
  const humanPrimary = studies.filter((s) => PRIMARY_HUMAN.has(s.design)).length
  const synthesis = studies.filter((s) => SYNTHESIS.has(s.design)).length

  const profileTopology = profiles.map(({ url, record }) => analyzeProfile(url, record, cache))
  const unsupportedClaims = profileTopology.flatMap((p) => p.unsupportedApprovedClaims.map((claimId) => ({ url: p.url, claimId })))
  const danglingRefs = profileTopology.flatMap((p) => p.danglingSourceRefs.map((item) => ({ url: p.url, ...item })))
  const singleSourceClaims = profileTopology.flatMap((p) => p.singleSourceApprovedClaims.map((claimId) => ({ url: p.url, claimId })))
  const concentratedProfiles = profileTopology
    .filter((p) => p.approvedClaimCount >= 3 && p.sourceDependencyShare >= 0.5)
    .sort((a, b) => b.sourceDependencyShare - a.sourceDependencyShare || b.approvedClaimCount - a.approvedClaimCount)
  const reviewDominatedProfiles = profileTopology.filter((p) => p.reviewDominated)
  const noPrimaryHumanProfiles = profileTopology.filter((p) => p.noPrimaryHuman)

  const summary = {
    citedStudies: studies.length,
    withMetadata: studies.filter((s) => s.hasMetadata).length,
    citedOnMultipleProfiles: studies.filter((s) => s.pageCount > 1).length,
    loadBearing: central.length,
    oldAndLoadBearing: oldAndCentral.length,
    withdrawn: withdrawn.length,
    age,
    designMix,
    humanPrimary,
    synthesis,
    medianYear: dated.length ? dated.map((s) => s.year!).sort((a, b) => a - b)[Math.floor(dated.length / 2)] : null,
    profiles: profileTopology.length,
    approvedClaims: profileTopology.reduce((sum, p) => sum + p.approvedClaimCount, 0),
    unsupportedApprovedClaims: unsupportedClaims.length,
    singleSourceApprovedClaims: singleSourceClaims.length,
    danglingClaimSourceRefs: danglingRefs.length,
    concentratedProfiles: concentratedProfiles.length,
    reviewDominatedProfiles: reviewDominatedProfiles.length,
    profilesWithClaimsButNoPrimaryHumanStudy: noPrimaryHumanProfiles.length,
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      currentYear: CURRENT_YEAR,
      summary,
      claimTopology: {
        unsupportedClaims,
        singleSourceClaims,
        danglingRefs,
        concentratedProfiles,
        reviewDominatedProfiles,
        noPrimaryHumanProfiles,
        profiles: profileTopology,
      },
      withdrawn,
      mostReferenced: studies.slice(0, 40),
      oldAndLoadBearing: oldAndCentral,
    }, null, 2)}\n`,
  )

  console.log('\nResearch coverage topology')
  console.log('='.repeat(72))
  console.log(`Profiles analyzed           ${summary.profiles}`)
  console.log(`Approved structured claims  ${summary.approvedClaims}`)
  console.log(`Unsupported approved claims ${summary.unsupportedApprovedClaims}`)
  console.log(`Single-source claims        ${summary.singleSourceApprovedClaims}`)
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
    console.log('\nHighest claim-source concentration:')
    for (const profile of concentratedProfiles.slice(0, 10)) {
      console.log(`  ${(profile.sourceDependencyShare * 100).toFixed(0).padStart(3)}% · ${profile.approvedClaimCount} claims · ${profile.url}`)
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

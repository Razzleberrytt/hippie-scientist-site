import fs from 'node:fs'
import path from 'node:path'

import { citationIdentifiers } from './citation-identifiers.mjs'
import { normalizeStudyClass, strongestStudyClass, type StudyClass } from './study-class'

export type ResearchSource = Record<string, unknown> & {
  id?: string
  pmid?: string
  pubmedId?: string
  doi?: string
  studyClass?: string
  studyType?: string
}

export type ResearchClaim = Record<string, unknown> & {
  id?: string
  predicate?: string
  confidence?: number
  reviewStatus?: string
  sourceRefIds?: string[]
}

export type ResearchProfile = Record<string, unknown> & {
  slug?: string
  sources?: ResearchSource[]
  claimMap?: ResearchClaim[]
}

export type ResearchProfileEntry = {
  kind: 'herbs' | 'compounds'
  url: string
  file: string
  record: ResearchProfile
}

export type PubmedCache = Record<string, Record<string, unknown>>
export type ClaimSupportTier =
  | 'unsupported'
  | 'unclassified'
  | 'narrative-only'
  | 'indirect-only'
  | 'human-supported'
  | 'non-outcome'

export type ClaimEvidenceAnalysis = {
  claimId: string
  predicate: string
  confidence: number
  sourceRefCount: number
  validSourceRefCount: number
  danglingSourceRefs: string[]
  studyIds: string[]
  studyCount: number
  classifiedStudyCount: number
  primaryHuman: number
  synthesis: number
  narrative: number
  designs: StudyClass[]
  outcomeClaim: boolean
  supportTier: ClaimSupportTier
  highConfidenceWeakOutcome: boolean
  aliasCollapsed: boolean
}

export type ResearchProfileAnalysis = {
  sourceCount: number
  canonicalStudyCount: number
  claimCount: number
  approvedClaimCount: number
  designMix: Record<string, number>
  primaryHuman: number
  synthesis: number
  narrativeReview: number
  claims: ClaimEvidenceAnalysis[]
  unsupportedApprovedClaims: string[]
  singleStudyApprovedClaims: string[]
  aliasCollapsedClaims: string[]
  danglingSourceRefs: Array<{ claimId: string; sourceRefId: string }>
  mostUsedStudyIdentity: string | null
  mostUsedStudyClaimCount: number
  studyDependencyShare: number
  reviewDominated: boolean
  noPrimaryHuman: boolean
}

export const PRIMARY_HUMAN_STUDY_CLASSES = new Set<StudyClass>(['rct', 'controlled-trial', 'uncontrolled-trial'])
export const SYNTHESIS_STUDY_CLASSES = new Set<StudyClass>(['meta-analysis', 'systematic-review'])
export const NARRATIVE_STUDY_CLASSES = new Set<StudyClass>(['narrative-review'])

export function loadPubmedCache(root = process.cwd()): PubmedCache {
  const cachePath = path.join(root, 'ops', 'cache', 'pubmed-metadata.json')
  if (!fs.existsSync(cachePath)) return {}
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8')).records ?? {}
  } catch {
    return {}
  }
}

export function designFromPublicationTypes(publicationTypes: string[] = []): StudyClass {
  const classes = publicationTypes
    .filter((type) => !/^journal article$/i.test(type))
    .map((type) => normalizeStudyClass(type))
    .filter((studyClass) => studyClass !== 'unclassified')
  return strongestStudyClass(classes)
}

export function sourceStudyClass(source: ResearchSource, cache: PubmedCache): StudyClass {
  const explicit = normalizeStudyClass(source.studyClass ?? source.studyType ?? '')
  if (explicit !== 'unclassified') return explicit
  const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
  const meta = (cache[pmid] ?? {}) as { publicationTypes?: string[] }
  return designFromPublicationTypes(meta.publicationTypes ?? [])
}

export function listResearchProfiles(root = process.cwd()): ResearchProfileEntry[] {
  const dataDir = path.join(root, 'public', 'data')
  const profiles: ResearchProfileEntry[] = []

  for (const [dir, kind] of [
    ['herbs-detail', 'herbs'],
    ['compounds-detail', 'compounds'],
  ] as const) {
    const full = path.join(dataDir, dir)
    if (!fs.existsSync(full)) continue

    for (const name of fs.readdirSync(full)) {
      if (!name.endsWith('.json')) continue
      const file = path.join(full, name)
      try {
        const record = JSON.parse(fs.readFileSync(file, 'utf8')) as ResearchProfile
        const slug = String(record.slug ?? name.replace(/\.json$/, ''))
        profiles.push({ kind, url: `/${kind}/${slug}/`, file, record })
      } catch {
        // Malformed JSON belongs to the data-format validators, not topology.
      }
    }
  }

  return profiles
}

export function approvedClaims(record: ResearchProfile): ResearchClaim[] {
  const claims = Array.isArray(record.claimMap) ? record.claimMap : []
  return claims.filter((claim) => String(claim.reviewStatus ?? '').toLowerCase() === 'approved')
}

export function sourceMap(record: ResearchProfile): Map<string, ResearchSource> {
  const sources = Array.isArray(record.sources) ? record.sources : []
  return new Map(sources.filter((source) => source.id).map((source) => [String(source.id), source]))
}

export function uniqueSourceRefs(claim: ResearchClaim): string[] {
  return [...new Set(Array.isArray(claim.sourceRefIds) ? claim.sourceRefIds.map(String).filter(Boolean) : [])]
}

export function canonicalStudyIdentityMap(record: ResearchProfile): Map<string, string> {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const parent = new Map<string, string>()

  const find = (value: string): string => {
    const current = parent.get(value) ?? value
    if (current === value) {
      parent.set(value, value)
      return value
    }
    const root = find(current)
    parent.set(value, root)
    return root
  }

  const union = (a: string, b: string) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA === rootB) return
    const [keep, merge] = [rootA, rootB].sort()
    parent.set(merge, keep)
  }

  for (const source of sources) {
    const aliases = citationIdentifiers(source)
    for (const alias of aliases) find(alias)
    for (let i = 1; i < aliases.length; i += 1) union(aliases[0], aliases[i])
  }

  const identities = new Map<string, string>()
  for (const source of sources) {
    const sourceId = String(source.id ?? '').trim()
    if (!sourceId) continue
    const aliases = citationIdentifiers(source)
    identities.set(sourceId, aliases.length ? find(aliases[0]) : `source-ref:${sourceId}`)
  }
  return identities
}

export function canonicalStudyGroups(record: ResearchProfile): Map<string, ResearchSource[]> {
  const identities = canonicalStudyIdentityMap(record)
  const groups = new Map<string, ResearchSource[]>()
  for (const source of Array.isArray(record.sources) ? record.sources : []) {
    const sourceId = String(source.id ?? '').trim()
    if (!sourceId) continue
    const identity = identities.get(sourceId)
    if (!identity) continue
    const group = groups.get(identity) ?? []
    group.push(source)
    groups.set(identity, group)
  }
  return groups
}

export function canonicalStudyClass(group: ResearchSource[], cache: PubmedCache): StudyClass {
  return strongestStudyClass(group.map((source) => sourceStudyClass(source, cache)))
}

export function uniqueClaimStudyIdentities(claim: ResearchClaim, identities: Map<string, string>): string[] {
  return [...new Set(uniqueSourceRefs(claim).map((ref) => identities.get(ref)).filter((value): value is string => Boolean(value)))]
}

export function analyzeClaimEvidence(
  claim: ResearchClaim,
  sourcesById: Map<string, ResearchSource>,
  identities: Map<string, string>,
  groups: Map<string, ResearchSource[]>,
  cache: PubmedCache,
): ClaimEvidenceAnalysis {
  const claimId = String(claim.id ?? 'unknown-claim')
  const predicate = String(claim.predicate ?? '')
  const confidence = Number(claim.confidence ?? 0)
  const refs = uniqueSourceRefs(claim)
  const validRefs = refs.filter((ref) => sourcesById.has(ref))
  const danglingSourceRefs = refs.filter((ref) => !sourcesById.has(ref))
  const studyIds = uniqueClaimStudyIdentities(claim, identities)
  const designs = studyIds
    .map((studyId) => groups.get(studyId))
    .filter((group): group is ResearchSource[] => Boolean(group))
    .map((group) => canonicalStudyClass(group, cache))
  const classified = designs.filter((design) => design !== 'unclassified')
  const primaryHuman = classified.filter((design) => PRIMARY_HUMAN_STUDY_CLASSES.has(design)).length
  const synthesis = classified.filter((design) => SYNTHESIS_STUDY_CLASSES.has(design)).length
  const narrative = classified.filter((design) => NARRATIVE_STUDY_CLASSES.has(design)).length
  const outcomeClaim = predicate === 'supports_outcome'
  const strongHumanSupport = primaryHuman + synthesis > 0

  let supportTier: ClaimSupportTier = 'non-outcome'
  if (studyIds.length === 0) supportTier = 'unsupported'
  else if (classified.length === 0) supportTier = 'unclassified'
  else if (outcomeClaim && narrative === classified.length) supportTier = 'narrative-only'
  else if (outcomeClaim && !strongHumanSupport) supportTier = 'indirect-only'
  else if (outcomeClaim) supportTier = 'human-supported'

  const weakOutcome = supportTier === 'narrative-only' || supportTier === 'indirect-only'

  return {
    claimId,
    predicate,
    confidence,
    sourceRefCount: refs.length,
    validSourceRefCount: validRefs.length,
    danglingSourceRefs,
    studyIds,
    studyCount: studyIds.length,
    classifiedStudyCount: classified.length,
    primaryHuman,
    synthesis,
    narrative,
    designs,
    outcomeClaim,
    supportTier,
    highConfidenceWeakOutcome:
      outcomeClaim && confidence >= 0.75 && (weakOutcome || supportTier === 'unclassified' || supportTier === 'unsupported'),
    aliasCollapsed: validRefs.length > studyIds.length && studyIds.length > 0,
  }
}

export function analyzeResearchProfile(record: ResearchProfile, cache: PubmedCache): ResearchProfileAnalysis {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const allClaims = Array.isArray(record.claimMap) ? record.claimMap : []
  const approved = approvedClaims(record)
  const sourcesById = sourceMap(record)
  const identities = canonicalStudyIdentityMap(record)
  const groups = canonicalStudyGroups(record)
  const designMix: Record<string, number> = {}
  let primaryHuman = 0
  let synthesis = 0
  let narrativeReview = 0

  for (const group of groups.values()) {
    const design = canonicalStudyClass(group, cache)
    designMix[design] = (designMix[design] ?? 0) + 1
    if (PRIMARY_HUMAN_STUDY_CLASSES.has(design)) primaryHuman += 1
    if (SYNTHESIS_STUDY_CLASSES.has(design)) synthesis += 1
    if (NARRATIVE_STUDY_CLASSES.has(design)) narrativeReview += 1
  }

  const claims = approved.map((claim) => analyzeClaimEvidence(claim, sourcesById, identities, groups, cache))
  const unsupportedApprovedClaims = claims.filter((claim) => claim.studyCount === 0).map((claim) => claim.claimId)
  const singleStudyApprovedClaims = claims.filter((claim) => claim.studyCount === 1).map((claim) => claim.claimId)
  const aliasCollapsedClaims = claims.filter((claim) => claim.aliasCollapsed).map((claim) => claim.claimId)
  const danglingSourceRefs = claims.flatMap((claim) =>
    claim.danglingSourceRefs.map((sourceRefId) => ({ claimId: claim.claimId, sourceRefId })),
  )
  const studyUse = new Map<string, number>()
  for (const claim of claims) {
    for (const studyId of claim.studyIds) studyUse.set(studyId, (studyUse.get(studyId) ?? 0) + 1)
  }
  const mostUsed = [...studyUse.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? null
  const mostUsedStudyClaimCount = mostUsed?.[1] ?? 0
  const studyDependencyShare = approved.length ? mostUsedStudyClaimCount / approved.length : 0
  const classifiedProfileStudies = primaryHuman + synthesis + narrativeReview

  return {
    sourceCount: sources.length,
    canonicalStudyCount: groups.size,
    claimCount: allClaims.length,
    approvedClaimCount: approved.length,
    designMix,
    primaryHuman,
    synthesis,
    narrativeReview,
    claims,
    unsupportedApprovedClaims,
    singleStudyApprovedClaims,
    aliasCollapsedClaims,
    danglingSourceRefs,
    mostUsedStudyIdentity: mostUsed?.[0] ?? null,
    mostUsedStudyClaimCount,
    studyDependencyShare: Number(studyDependencyShare.toFixed(3)),
    reviewDominated: classifiedProfileStudies >= 3 && narrativeReview / classifiedProfileStudies >= 0.6,
    noPrimaryHuman: approved.length > 0 && primaryHuman === 0,
  }
}

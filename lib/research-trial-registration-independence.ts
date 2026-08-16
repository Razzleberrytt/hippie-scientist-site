import { detectStudyIndependence, type StudyIdentity } from './evidence/study-quality'
import { canonicalStudyGroups, type PubmedCache, type ResearchSource } from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type TrialRegistryResolution = {
  registryIds: string[]
  stableRegistryId: string | null
  ambiguous: boolean
}

export type SameRegisteredTrialPair = {
  leftStudyId: string
  rightStudyId: string
  trialRegistrationId: string
}

export type ClaimTrialRegistrationIndependence = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  apparentStudyCount: number
  registryKnownStudyCount: number
  registryAmbiguousStudyCount: number
  registryCoverage: number
  registryAdjustedStudyCount: number
  duplicatePublicationCount: number
  sameRegisteredTrialPairs: SameRegisteredTrialPair[]
  sameRegisteredTrialPublicationReuse: boolean
  highConfidenceSameTrialReuse: boolean
}

export type TrialRegistrationIndependenceAnalysis = {
  claims: ClaimTrialRegistrationIndependence[]
  sameTrialReuseClaims: ClaimTrialRegistrationIndependence[]
  highConfidenceSameTrialReuseClaims: ClaimTrialRegistrationIndependence[]
  summary: {
    multiStudyApprovedClaims: number
    claimsWithRegistryCoverage: number
    claimsWithAmbiguousRegistryEvidence: number
    sameTrialReuseClaims: number
    highConfidenceSameTrialReuseClaims: number
    duplicatePublicationCount: number
  }
}

const EXPLICIT_REGISTRY_FIELDS = [
  'trialRegistrationId',
  'trialRegistrationIds',
  'trialRegistration',
  'registrationId',
  'registrationIds',
  'registryId',
  'registryIds',
  'clinicalTrialsGovId',
  'clinicalTrialId',
] as const

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function stringValues(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(stringValues)
  return []
}

/** Extract well-formed clinical-trial registry identifiers from free text. */
export function extractTrialRegistryIds(value: unknown): string[] {
  const text = stringValues(value).join(' ')
  if (!text) return []
  const ids = new Set<string>()
  const patterns: Array<[RegExp, (match: RegExpExecArray) => string]> = [
    [/\bNCT[-\s]?(\d{8})\b/gi, (match) => `NCT${match[1]}`],
    [/\bISRCTN[-\s]?(\d{8})\b/gi, (match) => `ISRCTN${match[1]}`],
    [/\bACTRN[-\s]?(\d{14})\b/gi, (match) => `ACTRN${match[1]}`],
    [/\bUMIN[-\s]?(?:CTR[-\s]?)?(\d{9})\b/gi, (match) => `UMIN${match[1]}`],
    [/\bDRKS[-\s]?(\d{8})\b/gi, (match) => `DRKS${match[1]}`],
    [/\bEUDRACT[-\s]?(\d{4}-\d{6}-\d{2})\b/gi, (match) => `EUDRACT${match[1]}`],
  ]

  for (const [pattern, normalize] of patterns) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text))) ids.add(normalize(match).toUpperCase())
  }
  return [...ids].sort()
}

function sourceRegistryIds(source: ResearchSource, cache: PubmedCache): string[] {
  const values: unknown[] = []
  for (const field of EXPLICIT_REGISTRY_FIELDS) values.push(source[field])
  values.push(source.title, source.abstract)

  const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
  if (pmid) {
    const cached = cache[pmid] ?? {}
    for (const field of EXPLICIT_REGISTRY_FIELDS) values.push(cached[field])
    values.push(cached.title, cached.abstract)
  }
  return extractTrialRegistryIds(values.flatMap(stringValues))
}

export function resolveCanonicalStudyTrialRegistry(
  group: ResearchSource[],
  cache: PubmedCache,
): TrialRegistryResolution {
  const registryIds = [...new Set(group.flatMap((source) => sourceRegistryIds(source, cache)))].sort()
  return {
    registryIds,
    stableRegistryId: registryIds.length === 1 ? registryIds[0] : null,
    ambiguous: registryIds.length > 1,
  }
}

function adjustedStudyCount(
  studyIds: string[],
  relations: ReturnType<typeof detectStudyIndependence>,
): number {
  const parent = new Map(studyIds.map((studyId) => [studyId, studyId]))
  const find = (value: string): string => {
    const current = parent.get(value) ?? value
    if (current === value) return value
    const root = find(current)
    parent.set(value, root)
    return root
  }
  const union = (left: string, right: string) => {
    const rootLeft = find(left)
    const rootRight = find(right)
    if (rootLeft !== rootRight) parent.set(rootRight, rootLeft)
  }

  for (const relation of relations) {
    if (relation.reason === 'same-trial-registration') union(relation.leftStudyId, relation.rightStudyId)
  }
  return new Set(studyIds.map(find)).size
}

/**
 * Detect when multiple canonical publications supporting one approved claim are
 * actually outputs from the same registered clinical trial. The existing study
 * independence engine owns the relation rule; this adapter resolves canonical
 * research studies onto registry IDs from structured fields and PubMed text.
 *
 * Publications mentioning multiple registry IDs are deliberately ambiguous and
 * never collapsed automatically.
 */
export function analyzeTrialRegistrationIndependence(
  analysis: ResearchQualityAnalysis,
): TrialRegistrationIndependenceAnalysis {
  const registryByUrl = new Map<string, Map<string, TrialRegistryResolution>>()
  for (const { url, record } of analysis.profiles) {
    const registry = new Map<string, TrialRegistryResolution>()
    for (const [studyId, group] of canonicalStudyGroups(record)) {
      registry.set(studyId, resolveCanonicalStudyTrialRegistry(group, analysis.cache))
    }
    registryByUrl.set(url, registry)
  }

  const claims: ClaimTrialRegistrationIndependence[] = []
  for (const claim of analysis.claimAnalyses) {
    if (claim.studyCount < 2) continue
    const registry = registryByUrl.get(claim.url) ?? new Map()
    const identities: StudyIdentity[] = claim.studyIds.map((studyId) => ({
      studyId,
      publicationId: studyId,
      trialRegistrationId: registry.get(studyId)?.stableRegistryId ?? undefined,
    }))
    const relations = detectStudyIndependence(identities)
    const sameTrialRelations = relations.filter((relation) => relation.reason === 'same-trial-registration')
    const sameRegisteredTrialPairs = sameTrialRelations.map((relation): SameRegisteredTrialPair => ({
      leftStudyId: relation.leftStudyId,
      rightStudyId: relation.rightStudyId,
      trialRegistrationId: registry.get(relation.leftStudyId)?.stableRegistryId
        ?? registry.get(relation.rightStudyId)?.stableRegistryId
        ?? 'unknown',
    }))
    const registryKnownStudyCount = claim.studyIds.filter((studyId) => Boolean(registry.get(studyId)?.stableRegistryId)).length
    const registryAmbiguousStudyCount = claim.studyIds.filter((studyId) => registry.get(studyId)?.ambiguous).length
    const registryAdjustedStudyCount = adjustedStudyCount(claim.studyIds, relations)
    const duplicatePublicationCount = Math.max(0, claim.studyCount - registryAdjustedStudyCount)
    const sameRegisteredTrialPublicationReuse = sameRegisteredTrialPairs.length > 0

    claims.push({
      url: claim.url,
      claimId: claim.claimId,
      predicate: claim.predicate,
      confidence: claim.confidence,
      apparentStudyCount: claim.studyCount,
      registryKnownStudyCount,
      registryAmbiguousStudyCount,
      registryCoverage: round(claim.studyCount ? registryKnownStudyCount / claim.studyCount : 0),
      registryAdjustedStudyCount,
      duplicatePublicationCount,
      sameRegisteredTrialPairs,
      sameRegisteredTrialPublicationReuse,
      highConfidenceSameTrialReuse: sameRegisteredTrialPublicationReuse && claim.confidence >= 0.75,
    })
  }

  claims.sort((a, b) =>
    Number(b.highConfidenceSameTrialReuse) - Number(a.highConfidenceSameTrialReuse)
    || Number(b.sameRegisteredTrialPublicationReuse) - Number(a.sameRegisteredTrialPublicationReuse)
    || b.duplicatePublicationCount - a.duplicatePublicationCount
    || b.registryCoverage - a.registryCoverage
    || b.confidence - a.confidence
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )
  const sameTrialReuseClaims = claims.filter((claim) => claim.sameRegisteredTrialPublicationReuse)
  const highConfidenceSameTrialReuseClaims = claims.filter((claim) => claim.highConfidenceSameTrialReuse)

  return {
    claims,
    sameTrialReuseClaims,
    highConfidenceSameTrialReuseClaims,
    summary: {
      multiStudyApprovedClaims: claims.length,
      claimsWithRegistryCoverage: claims.filter((claim) => claim.registryKnownStudyCount > 0).length,
      claimsWithAmbiguousRegistryEvidence: claims.filter((claim) => claim.registryAmbiguousStudyCount > 0).length,
      sameTrialReuseClaims: sameTrialReuseClaims.length,
      highConfidenceSameTrialReuseClaims: highConfidenceSameTrialReuseClaims.length,
      duplicatePublicationCount: sameTrialReuseClaims.reduce((sum, claim) => sum + claim.duplicatePublicationCount, 0),
    },
  }
}

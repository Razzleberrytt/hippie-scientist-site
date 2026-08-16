import fs from 'node:fs'
import path from 'node:path'

export type LocalizedProfileKind = 'herb' | 'compound'

export type CanonicalProfileClaim = {
  id: string
  claim: string
  predicate: string
  evidenceLevel?: string
  confidence?: number
  reviewStatus?: string
  sourceRefIds?: string[]
}

export type CanonicalProfileSource = {
  id?: string
  title?: string
  url?: string
  year?: string | number
  journal?: string
  doi?: string
  pmid?: string
}

export type CanonicalLocalizedProfile = {
  name: string
  slug: string
  summary?: string
  dosage?: string
  typical_dosage?: string
  safetyNotes?: string
  contraindications?: string[]
  claimMap?: CanonicalProfileClaim[]
  sources?: CanonicalProfileSource[]
}

export type LocalizedProfileTranslation = {
  kind: LocalizedProfileKind
  slug: string
  path: string
  title: string
  summary: string
  dosage?: string
  safetyNotes?: string
  contraindications?: readonly string[]
  claims: Readonly<Record<string, string>>
  originalPath: string
}

export type LocalizedProfileUiCopy = {
  evidenceEyebrow: string
  evidenceHeading: string
  evidenceIntro: string
  safetyHeading: string
  dosageHeading: string
  sourcesHeading: string
  sourcesIntro: string
  evidenceLevelLabel: string
  confidenceLabel: string
  sourceLabel: string
  originalLabel: string
  backToLibraryLabel: string
  educationalDisclaimer: string
}

export function getApprovedCanonicalClaims(profile: CanonicalLocalizedProfile): CanonicalProfileClaim[] {
  return (profile.claimMap ?? []).filter((claim) => claim.reviewStatus === 'approved')
}

export function profileTranslationCoverage(
  profile: CanonicalLocalizedProfile,
  translation: LocalizedProfileTranslation,
) {
  const approved = getApprovedCanonicalClaims(profile)
  const approvedIds = new Set(approved.map((claim) => claim.id))
  const translatedIds = Object.keys(translation.claims)
  const missing = approved.filter((claim) => !translation.claims[claim.id]).map((claim) => claim.id)
  const stale = translatedIds.filter((id) => !approvedIds.has(id))

  return {
    approvedClaims: approved.length,
    translatedClaims: approved.length - missing.length,
    missing,
    stale,
    complete: approved.length > 0 && missing.length === 0 && stale.length === 0,
  }
}

export function assertCompleteProfileTranslation(
  profile: CanonicalLocalizedProfile,
  translation: LocalizedProfileTranslation,
) {
  if (profile.slug !== translation.slug) {
    throw new Error(`Localized profile slug mismatch: canonical=${profile.slug} translation=${translation.slug}`)
  }

  const coverage = profileTranslationCoverage(profile, translation)
  if (!coverage.complete) {
    throw new Error(
      `Incomplete localized profile ${translation.path}: approved=${coverage.approvedClaims} translated=${coverage.translatedClaims} missing=${coverage.missing.join(',') || 'none'} stale=${coverage.stale.join(',') || 'none'}`,
    )
  }
  return coverage
}

export function sourceIdsForApprovedClaims(profile: CanonicalLocalizedProfile): Set<string> {
  return new Set(getApprovedCanonicalClaims(profile).flatMap((claim) => claim.sourceRefIds ?? []))
}

export function sourcesForApprovedClaims(profile: CanonicalLocalizedProfile): CanonicalProfileSource[] {
  const ids = sourceIdsForApprovedClaims(profile)
  return (profile.sources ?? []).filter((source) => source.id && ids.has(source.id))
}

export function loadCanonicalLocalizedProfile(
  kind: LocalizedProfileKind,
  slug: string,
  root = process.cwd(),
): CanonicalLocalizedProfile {
  if (!/^[a-z0-9-]+$/i.test(slug)) throw new Error(`Unsafe localized profile slug: ${slug}`)
  const directory = kind === 'herb' ? 'herbs-detail' : 'compounds-detail'
  const filePath = path.join(root, 'public', 'data', directory, `${slug}.json`)
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as CanonicalLocalizedProfile
  if (!parsed?.slug || parsed.slug !== slug) {
    throw new Error(`Canonical localized profile mismatch for ${kind}:${slug}`)
  }
  return parsed
}

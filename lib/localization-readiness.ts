import fs from 'node:fs'
import path from 'node:path'

import { COMPOUND_PROFILE_TRANSLATIONS } from '@/src/lib/compound-profile-translations'
import {
  getApprovedCanonicalClaims,
  profileTranslationCoverage,
  type CanonicalLocalizedProfile,
  type LocalizedProfileKind,
  type LocalizedProfileTranslation,
} from '@/src/lib/localized-profile'
import {
  PROFILE_TRANSLATIONS,
  type ProfileTranslationLocale,
} from '@/src/lib/profile-translations'

export type LocalizationTranslationState = 'missing' | 'current' | 'incomplete' | 'stale'
export type LocalizationReadinessState =
  | 'translated-current'
  | 'ready-to-translate'
  | 'blocked-no-approved-claims'
  | 'blocked-not-indexable'
  | 'translation-needs-review'

export type LocalizationProfileReadiness = {
  kind: LocalizedProfileKind
  slug: string
  name: string
  originalPath: string
  approvedClaims: number
  canonicalClaims: number
  indexable: boolean
  readiness: LocalizationReadinessState
  translations: Record<ProfileTranslationLocale, LocalizationTranslationState>
  currentLocales: ProfileTranslationLocale[]
  missingLocales: ProfileTranslationLocale[]
  problematicLocales: ProfileTranslationLocale[]
}

export type LocalizationReadinessReport = {
  generatedAt: string
  profiles: LocalizationProfileReadiness[]
  summary: {
    profiles: number
    translatedCurrent: number
    readyToTranslate: number
    blockedNoApprovedClaims: number
    blockedNotIndexable: number
    translationNeedsReview: number
    fullyTranslatedProfiles: number
    currentTranslations: number
    missingTranslationsOnReadyProfiles: number
  }
}

const LOCALES: readonly ProfileTranslationLocale[] = ['es', 'pt-BR', 'fr', 'de']

function canonicalIndexable(profile: CanonicalLocalizedProfile): boolean {
  const raw = profile as CanonicalLocalizedProfile & {
    indexability_status?: string
    robots?: string
    sitemap_included?: boolean
    governance?: { indexingAllowed?: boolean }
  }
  if (raw.indexability_status && raw.indexability_status !== 'PUBLISH') return false
  if (String(raw.robots ?? '').toLowerCase().includes('noindex')) return false
  if (raw.sitemap_included === false) return false
  if (raw.governance?.indexingAllowed === false) return false
  return true
}

function translationsFor(kind: LocalizedProfileKind, locale: ProfileTranslationLocale): readonly LocalizedProfileTranslation[] {
  return kind === 'compound' ? COMPOUND_PROFILE_TRANSLATIONS[locale] : PROFILE_TRANSLATIONS[locale]
}

function translationState(
  profile: CanonicalLocalizedProfile,
  kind: LocalizedProfileKind,
  slug: string,
  locale: ProfileTranslationLocale,
): LocalizationTranslationState {
  const translation = translationsFor(kind, locale).find((item) => item.kind === kind && item.slug === slug)
  if (!translation) return 'missing'
  const coverage = profileTranslationCoverage(profile, translation)
  if (coverage.missing.length || coverage.stale.length || coverage.extra.length) return 'incomplete'
  return coverage.revisionCurrent ? 'current' : 'stale'
}

export function classifyLocalizationProfile(
  profile: CanonicalLocalizedProfile,
  kind: LocalizedProfileKind,
): LocalizationProfileReadiness {
  const slug = String(profile.slug ?? profile.id ?? '').trim()
  const name = String(profile.name ?? slug).trim()
  const approvedClaims = getApprovedCanonicalClaims(profile).length
  const canonicalClaims = profile.claimMap?.length ?? 0
  const indexable = canonicalIndexable(profile)
  const translations = Object.fromEntries(
    LOCALES.map((locale) => [locale, translationState(profile, kind, slug, locale)]),
  ) as Record<ProfileTranslationLocale, LocalizationTranslationState>
  const currentLocales = LOCALES.filter((locale) => translations[locale] === 'current')
  const missingLocales = LOCALES.filter((locale) => translations[locale] === 'missing')
  const problematicLocales = LOCALES.filter((locale) => translations[locale] === 'incomplete' || translations[locale] === 'stale')

  let readiness: LocalizationReadinessState
  if (!indexable) readiness = 'blocked-not-indexable'
  else if (approvedClaims === 0) readiness = 'blocked-no-approved-claims'
  else if (problematicLocales.length > 0) readiness = 'translation-needs-review'
  else if (currentLocales.length === LOCALES.length) readiness = 'translated-current'
  else readiness = 'ready-to-translate'

  return {
    kind,
    slug,
    name,
    originalPath: kind === 'herb' ? `/herbs/${slug}/` : `/compounds/${slug}/`,
    approvedClaims,
    canonicalClaims,
    indexable,
    readiness,
    translations,
    currentLocales,
    missingLocales,
    problematicLocales,
  }
}

function readProfiles(root: string, kind: LocalizedProfileKind): CanonicalLocalizedProfile[] {
  const folder = path.join(root, 'public', 'data', kind === 'herb' ? 'herbs-detail' : 'compounds-detail')
  if (!fs.existsSync(folder)) return []
  return fs.readdirSync(folder)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8')) as CanonicalLocalizedProfile)
}

export function buildLocalizationReadinessReport(root = process.cwd()): LocalizationReadinessReport {
  const profiles = [
    ...readProfiles(root, 'herb').map((profile) => classifyLocalizationProfile(profile, 'herb')),
    ...readProfiles(root, 'compound').map((profile) => classifyLocalizationProfile(profile, 'compound')),
  ].sort((a, b) => {
    const readinessOrder: Record<LocalizationReadinessState, number> = {
      'translation-needs-review': 0,
      'ready-to-translate': 1,
      'translated-current': 2,
      'blocked-no-approved-claims': 3,
      'blocked-not-indexable': 4,
    }
    return readinessOrder[a.readiness] - readinessOrder[b.readiness]
      || b.approvedClaims - a.approvedClaims
      || a.kind.localeCompare(b.kind)
      || a.slug.localeCompare(b.slug)
  })

  return {
    generatedAt: new Date().toISOString(),
    profiles,
    summary: {
      profiles: profiles.length,
      translatedCurrent: profiles.filter((item) => item.readiness === 'translated-current').length,
      readyToTranslate: profiles.filter((item) => item.readiness === 'ready-to-translate').length,
      blockedNoApprovedClaims: profiles.filter((item) => item.readiness === 'blocked-no-approved-claims').length,
      blockedNotIndexable: profiles.filter((item) => item.readiness === 'blocked-not-indexable').length,
      translationNeedsReview: profiles.filter((item) => item.readiness === 'translation-needs-review').length,
      fullyTranslatedProfiles: profiles.filter((item) => item.currentLocales.length === LOCALES.length).length,
      currentTranslations: profiles.reduce((sum, item) => sum + item.currentLocales.length, 0),
      missingTranslationsOnReadyProfiles: profiles
        .filter((item) => item.readiness === 'ready-to-translate')
        .reduce((sum, item) => sum + item.missingLocales.length, 0),
    },
  }
}

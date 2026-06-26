import type { Metadata } from 'next'
import { formatDisplayLabel, list } from '@/lib/display-utils'
import { getEvidenceLabel } from '@/lib/evidence'
import { SITE_URL, SITE_NAME } from './site'
import {
  CORE_INDEXABLE_ROUTES,
  CURATED_INDEXABLE_COMPOUND_SLUGS,
  CURATED_INDEXABLE_HERB_SLUGS,
  MONEY_ENTRY_ROUTES,
} from './index-allowlist'

import { TOTAL_PROFILE_COUNT } from '@/lib/profile-counts'
import { getProfileFreshness } from '@/lib/freshness'

export { SITE_URL, SITE_NAME }
export const SEO_YEAR = '2026'
export const DEFAULT_OG_IMAGE = '/og-default.jpg'
export const LOGO_PATH = '/logo.svg'
export const TWITTER_HANDLE = '@HippieScientist'
export const DEFAULT_TITLE = 'The Hippie Scientist – Evidence-Based Herb & Supplement Research'
export const DEFAULT_DESCRIPTION = `The Hippie Scientist — evidence-first reference for herbs, supplements, and compounds. Mechanism, safety, and practical context for ${TOTAL_PROFILE_COUNT}+ profiles.`
export const DEFAULT_TITLE_TEMPLATE = `%s | ${SITE_NAME}`
export const SITEMAP_URL_CAP = 450
const META_TITLE_MAX_LENGTH = 60

export type PageType = 'website' | 'article'

export type IndexDecision = {
  index: boolean
  follow: boolean
  reason: string
  priority: number
}

export type BuildMetaArgs = {
  title: string
  description: string
  path?: string
  image?: string
  keepQueryParams?: string[]
}

export type GovernedSummarySignals = {
  evidenceLabel?: string
  evidenceLabelTitle?: string
  hasHumanEvidence?: boolean
  safetyCautionsPresent?: boolean
  supportedUseCoveragePresent?: boolean
  mechanismOrConstituentCoveragePresent?: boolean
  conflictingEvidence?: boolean
  enrichedAndReviewed?: boolean
  lastReviewedAt?: string
}

type NormalizedMeta = {
  title: string
  description: string
  url: string
  image: string
}

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)
const withLeadingSlash = (value: string) => {
  if (!value) return '/'
  return value.startsWith('/') || isAbsoluteUrl(value) ? value : `/${value}`
}

export function toAbsoluteUrl(path: string): string {
  if (!path) return SITE_URL
  return isAbsoluteUrl(path) ? path : new URL(withLeadingSlash(path), SITE_URL).toString()
}

export function canonicalUrl(path = '/', keepQueryParams: string[] = []): string {
  return toAbsoluteUrl(normalizeCanonicalPath(path, keepQueryParams))
}

const NON_CANONICAL_PARAM_PATTERNS: RegExp[] = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^msclkid$/i,
  /^ref$/i,
  /^source$/i,
]

function withTrailingSlash(pathname: string): string {
  if (!pathname || pathname === '/') return '/'
  if (pathname.endsWith('/')) return pathname
  if (/\.[a-z0-9]+$/i.test(pathname)) return pathname
  return `${pathname}/`
}

export function normalizeCanonicalPath(path: string, keepQueryParams: string[] = []): string {
  const url = new URL(withLeadingSlash(path), SITE_URL)
  const allowed = new Set(keepQueryParams.map(value => value.toLowerCase()))
  const nextSearch = new URLSearchParams()

  for (const [key, value] of url.searchParams.entries()) {
    const keyLc = key.toLowerCase()
    const isBlocked = NON_CANONICAL_PARAM_PATTERNS.some(pattern => pattern.test(keyLc))
    if (isBlocked) continue
    if (allowed.has(keyLc)) {
      nextSearch.append(key, value)
    }
  }

  const sorted = [...nextSearch.entries()].sort(([a], [b]) => a.localeCompare(b))
  const finalSearch = new URLSearchParams(sorted)
  const search = finalSearch.toString()
  const pathname = withTrailingSlash(url.pathname)
  return `${pathname}${search ? `?${search}` : ''}`
}

function compactAtWord(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  const cutoff = value.slice(0, maxLength - 1)
  const lastBreak = Math.max(
    cutoff.lastIndexOf(' '),
    cutoff.lastIndexOf(':'),
    cutoff.lastIndexOf('|'),
    cutoff.lastIndexOf('–'),
    cutoff.lastIndexOf('-'),
  )
  const compact = (lastBreak > 36 ? cutoff.slice(0, lastBreak) : cutoff).trim()
  return `${compact}…`
}

export function formatMetaTitle(value: string, fallback = DEFAULT_TITLE, maxLength = META_TITLE_MAX_LENGTH): string {
  const cleaned = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return compactAtWord(fallback, maxLength)
  if (cleaned.length <= maxLength) return cleaned

  const withoutSiteName = cleaned
    .replace(new RegExp(`\\s*[|–-]\\s*${SITE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), '')
    .trim()
  if (withoutSiteName && withoutSiteName.length <= maxLength) return withoutSiteName

  const compactProfileTitle = withoutSiteName
    .replace(/\s+Herb Profile$/i, ' Herb Guide')
    .replace(/\s+Compound Profile$/i, ' Compound Guide')
    .trim()
  if (compactProfileTitle && compactProfileTitle.length <= maxLength) return compactProfileTitle

  return compactAtWord(compactProfileTitle || withoutSiteName || cleaned, maxLength)
}

export type BuildPageMetadataArgs = BuildMetaArgs & {
  openGraphType?: 'website' | 'article'
  robots?: Metadata['robots']
  keywords?: string[] | string
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  keepQueryParams = [],
  openGraphType = 'website',
  robots,
  keywords,
}: BuildPageMetadataArgs): Metadata {
  const meta = buildMeta({ title, description, path, image, keepQueryParams })
  const fullTitle = formatMetaTitle(meta.title || DEFAULT_TITLE)
  const fullDesc = description || DEFAULT_DESCRIPTION
  return {
    title: fullTitle,
    description: fullDesc,
    keywords,
    alternates: { canonical: meta.url },
    openGraph: {
      title: fullTitle,
      description: fullDesc,
      url: meta.url,
      siteName: SITE_NAME,
      type: openGraphType,
      images: [{ url: meta.image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDesc,
      images: [meta.image],
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
    robots: robots || { index: true, follow: true },
  }
}

function normalizeIndexRoutePath(path: string): string {
  if (!path) return '/'
  const url = isAbsoluteUrl(path) ? new URL(path) : null
  const rawPath = (url ? url.pathname : path).split(/[?#]/)[0] || '/'
  const withSlash = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

function hasNoindexSignal(record: Record<string, unknown> | null | undefined): string | null {
  if (!record) return null
  const sitemapIncluded = record.sitemap_included
  if (sitemapIncluded === false || String(sitemapIncluded).toLowerCase() === 'false') return 'sitemap_included=false'

  const robots = String(record.robots || '').toLowerCase()
  if (robots.includes('noindex')) return 'robots=noindex'

  const indexabilityStatus = String(record.indexability_status || '').toUpperCase()
  if (['NOINDEX', 'NEEDS_REVIEW', 'BLOCKED'].includes(indexabilityStatus)) return `indexability_status=${indexabilityStatus}`

  const decision = String(record.runtime_export_decision || '').toLowerCase()
  if (['hide', 'hidden', 'blocked', 'block', 'alias_redirect_only', 'hidden_until_grounded', 'research_archive_runtime'].includes(decision)) {
    return `runtime_export_decision=${decision}`
  }

  const profileStatus = String(record.profile_status || '').toLowerCase()
  if (['draft', 'archived', 'minimal', 'research_only'].includes(profileStatus)) return `profile_status=${profileStatus}`

  const summaryQuality = String(record.summary_quality || '').toLowerCase()
  if (['weak', 'minimal', 'thin', 'stub', 'research_needed', 'none'].includes(summaryQuality)) return `summary_quality=${summaryQuality}`

  return null
}

function hasExplicitPublishSignal(record: Record<string, unknown> | null | undefined): boolean {
  if (!record) return false

  const indexabilityStatus = String(record.indexability_status || '').toUpperCase()
  const robots = String(record.robots || '').toLowerCase()
  return indexabilityStatus === 'PUBLISH' &&
    record.sitemap_included === true &&
    /^index\b/.test(robots)
}

function recordText(record: Record<string, unknown>, fields: string[]): string {
  return fields
    .map((field) => record[field])
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ')
    .trim()
}

export const QUALITY_GATE_THRESHOLDS = {
  MIN_SUMMARY_LENGTH: 500,
  MIN_BODY_LENGTH: 800,
  REQUIRE_SAFETY: true,
  REQUIRE_EVIDENCE_GRADE_OR_RATIONALE: true,
  REQUIRE_CITATIONS: true,
}

export function passesGeneratedProfileQualityGate(record: Record<string, unknown> | null | undefined): boolean {
  if (!record) return false
  if (hasNoindexSignal(record)) return false

  const profileStatus = String(record.profile_status || '').toLowerCase()
  const evidenceTier = String(record.evidence_tier || record.evidenceTier || record.evidence_grade || '').toLowerCase()
  const hasTopTierSignal =
    /^(complete|near_complete|top50_authority_patched|commercial_ready)$/.test(profileStatus) ||
    /\b(strong|moderate)\s+human\s+evidence\b/.test(evidenceTier) ||
    /\b(strong|moderate)\b/.test(evidenceTier)
  if (!hasTopTierSignal) return false

  const name = recordText(record, ['title', 'name', 'displayName', 'compoundName', 'canonicalCompoundName'])
  if (!name) return false

  const summary = recordText(record, [
    'summary',
    'overview',
    'description',
    'generated_description',
    'short_earthy_summary',
    'meta_description',
  ])

  const supportingContext = recordText(record, [
    'safety',
    'safetyNotes',
    'safety_notes',
    'evidence',
    'evidence_summary',
    'evidence_tier',
    'evidenceTier',
    'evidence_grade',
    'mechanisms',
    'primary_mechanisms',
    'pathways',
    'dosage',
    'dosing',
    'dose',
    'clinicalUse',
    'clinical_use',
    'primary_effects',
    'effects',
    'useContexts',
    'evidence_rationale',
    'trial_design_insight',
  ])

  if (summary.length < QUALITY_GATE_THRESHOLDS.MIN_SUMMARY_LENGTH && supportingContext.length < QUALITY_GATE_THRESHOLDS.MIN_BODY_LENGTH) {
    return false
  }

  if (QUALITY_GATE_THRESHOLDS.REQUIRE_SAFETY) {
    const safety = recordText(record, [
      'safety',
      'safetyNotes',
      'safety_notes',
      'interactions',
      'drug_interactions',
      'contraindications'
    ])
    if (!safety.trim()) return false
  }

  if (QUALITY_GATE_THRESHOLDS.REQUIRE_EVIDENCE_GRADE_OR_RATIONALE) {
    const evidenceGrade = String(record.evidence_grade || record.evidence_tier || record.evidenceTier || '').trim()
    const evidenceRationale = String(record.evidence_rationale || record.rationale || record.evidence_summary || '').trim()
    if (!evidenceGrade && !evidenceRationale) return false
  }

  if (QUALITY_GATE_THRESHOLDS.REQUIRE_CITATIONS) {
    const slug = String(record.slug || '')
    const freshness = slug ? getProfileFreshness(slug) : null
    const citationCount = freshness ? freshness.citationCount : 0
    if (citationCount <= 0) return false
  }

  const internalLinkSignals = recordText(record, [
    'related',
    'relatedHerbs',
    'relatedCompounds',
    'sourceHerbs',
    'compounds',
    'active_compounds',
    'mechanisms',
    'primary_effects',
    'effects',
  ])
  return Boolean(internalLinkSignals)
}

export function shouldIndexRoute(path: string, pageData?: Record<string, unknown> | null): IndexDecision {
  const normalizedPath = normalizeIndexRoutePath(path)
  const noindexSignal = hasNoindexSignal(pageData)
  const hardNoindexSignal =
    noindexSignal && /^(sitemap_included|robots|indexability_status|runtime_export_decision|profile_status)=/.test(noindexSignal)
      ? noindexSignal
      : null

  if (
    normalizedPath === '/compare/dynamic' ||
    normalizedPath.startsWith('/admin') ||
    normalizedPath.startsWith('/api') ||
    normalizedPath.startsWith('/data') ||
    normalizedPath.startsWith('/drafts') ||
    normalizedPath.startsWith('/preview')
  ) {
    return { index: false, follow: true, reason: 'internal-or-utility-route', priority: 0 }
  }

  let isCurated = false
  if (/^\/herbs\/[^/]+$/.test(normalizedPath)) {
    const slug = normalizedPath.split('/').pop() || ''
    isCurated = (CURATED_INDEXABLE_HERB_SLUGS as readonly string[]).includes(slug)
  } else if (/^\/compounds\/[^/]+$/.test(normalizedPath)) {
    const slug = normalizedPath.split('/').pop() || ''
    isCurated = (CURATED_INDEXABLE_COMPOUND_SLUGS as readonly string[]).includes(slug)
  }

  if (hardNoindexSignal) {
    const isBypassable =
      hardNoindexSignal.includes('sitemap_included=false') ||
      hardNoindexSignal.includes('indexability_status=NEEDS_REVIEW')

    if (!(isCurated && isBypassable)) {
      return { index: false, follow: true, reason: hardNoindexSignal, priority: 0 }
    }
  }

  const coreRoutes = new Set<string>(CORE_INDEXABLE_ROUTES)
  if (coreRoutes.has(normalizedPath)) {
    return { index: true, follow: true, reason: 'core-route', priority: normalizedPath === '/' ? 1 : 0.8 }
  }

  const moneyRoutes = new Set<string>(MONEY_ENTRY_ROUTES)
  if (moneyRoutes.has(normalizedPath)) {
    return { index: true, follow: true, reason: 'money-entry-route', priority: 0.7 }
  }

  if (/^\/articles\/[^/]+$/.test(normalizedPath)) {
    return { index: true, follow: true, reason: 'article-detail', priority: 0.7 }
  }

  if (/^\/guides\/[^/]+$/.test(normalizedPath)) {
    return { index: true, follow: true, reason: 'guide-detail', priority: 0.7 }
  }

  if (/^\/goals\/[^/]+$/.test(normalizedPath)) {
    return { index: true, follow: true, reason: 'goal-detail', priority: 0.7 }
  }

  if (/^\/herbs\/[^/]+$/.test(normalizedPath)) {
    const slug = normalizedPath.split('/').pop() || ''
    // 1. Curated list is a priority index route and always overrides quality gate
    const isCurated = (CURATED_INDEXABLE_HERB_SLUGS as readonly string[]).includes(slug)
    if (isCurated) {
      return { index: true, follow: true, reason: 'curated-herb-allowlist', priority: 0.7 }
    }

    // 2. Explicit publish policy should override the generated quality gate.
    if (hasExplicitPublishSignal(pageData)) {
      return { index: true, follow: true, reason: 'indexability-policy-publish', priority: 0.6 }
    }

    // 3. Quality gate applies to all non-curated profiles
    if (!passesGeneratedProfileQualityGate(pageData)) {
      return { index: false, follow: true, reason: 'generated-herb-quality-gate-failed', priority: 0 }
    }

    return { index: true, follow: true, reason: 'generated-profile-quality-gate', priority: 0.6 }
  }

  if (/^\/compounds\/[^/]+$/.test(normalizedPath)) {
    const slug = normalizedPath.split('/').pop() || ''
    // 1. Curated list is a priority index route and always overrides quality gate
    const isCurated = (CURATED_INDEXABLE_COMPOUND_SLUGS as readonly string[]).includes(slug)
    if (isCurated) {
      return { index: true, follow: true, reason: 'curated-compound-allowlist', priority: 0.7 }
    }

    // 2. Explicit publish policy should override the generated quality gate.
    if (hasExplicitPublishSignal(pageData)) {
      return { index: true, follow: true, reason: 'indexability-policy-publish', priority: 0.6 }
    }

    // 3. Quality gate applies to all non-curated profiles
    if (!passesGeneratedProfileQualityGate(pageData)) {
      return { index: false, follow: true, reason: 'generated-compound-quality-gate-failed', priority: 0 }
    }

    return { index: true, follow: true, reason: 'generated-profile-quality-gate', priority: 0.6 }
  }

  if (/^\/(learn|education|compare|stacks|psychoactive|novel-psychoactive-substances)\/[^/]+$/.test(normalizedPath)) {
    return { index: true, follow: true, reason: 'supporting-detail-route', priority: 0.6 }
  }

  return { index: false, follow: true, reason: 'not-priority-index-route', priority: 0 }
}

export function routePriority(path: string, pageData?: Record<string, unknown> | null): number {
  return shouldIndexRoute(path, pageData).priority
}

export function buildMeta({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  keepQueryParams = [],
}: BuildMetaArgs): NormalizedMeta {
  const canonicalPath = normalizeCanonicalPath(path, keepQueryParams)
  const url = toAbsoluteUrl(canonicalPath)

  const fallbackImage = image || DEFAULT_OG_IMAGE
  const imageUrl = toAbsoluteUrl(fallbackImage)

  return {
    title,
    description,
    url,
    image: imageUrl,
  }
}

export function formatMetaDescription(value: string, fallback: string, maxLength = 155): string {
  const cleaned = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return fallback
  if (cleaned.length <= maxLength) return cleaned
  const cutoff = cleaned.slice(0, maxLength - 1)
  const lastBreak = Math.max(
    cutoff.lastIndexOf(' '),
    cutoff.lastIndexOf(','),
    cutoff.lastIndexOf(';'),
  )
  const compact = (lastBreak > 90 ? cutoff.slice(0, lastBreak) : cutoff).trim()
  return `${compact}…`
}

const WEAK_OR_UNCERTAIN_LABELS = new Set([
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
  'mixed_or_uncertain',
  'conflicting_evidence',
])

export function buildGovernedMetaDescription(
  fallbackDescription: string,
  summary?: GovernedSummarySignals,
): string {
  if (!summary?.enrichedAndReviewed) return fallbackDescription
  const evidenceLabel = String(summary.evidenceLabel || 'insufficient_evidence')
  const weakOrUncertain = WEAK_OR_UNCERTAIN_LABELS.has(evidenceLabel)
  const labelText = String(summary.evidenceLabelTitle || evidenceLabel.replace(/_/g, ' ')).toLowerCase()

  const parts = [`Governed review: ${labelText}.`]
  if (summary.supportedUseCoveragePresent && !weakOrUncertain) {
    parts.push('Includes scoped supported-use context from approved sources.')
  }
  if (summary.safetyCautionsPresent) {
    parts.push('Safety and interaction cautions are included.')
  }
  if (summary.mechanismOrConstituentCoveragePresent) {
    parts.push('Mechanism and constituent coverage is available.')
  }
  if (summary.conflictingEvidence) {
    parts.push('Evidence includes unresolved conflicts; avoid overconfident conclusions.')
  } else if (weakOrUncertain) {
    parts.push('Evidence remains limited and should not be interpreted as strong human proof.')
  }
  if (summary.lastReviewedAt) {
    const reviewedDate = new Date(summary.lastReviewedAt)
    if (!Number.isNaN(reviewedDate.getTime())) {
      parts.push(`Last reviewed ${reviewedDate.toISOString().slice(0, 10)}.`)
    }
  }
  parts.push('Educational reference only.')
  return formatMetaDescription(parts.join(' '), fallbackDescription)
}

export function buildGovernedMetaTitle(
  fallbackTitle: string,
  name: string,
  kind: 'Herb' | 'Compound',
  summary?: GovernedSummarySignals,
): string {
  if (!summary?.enrichedAndReviewed) return fallbackTitle
  const evidenceLabel = String(summary.evidenceLabel || 'insufficient_evidence')
  const weakOrUncertain = WEAK_OR_UNCERTAIN_LABELS.has(evidenceLabel)
  if (weakOrUncertain || !summary.hasHumanEvidence) return fallbackTitle
  const labelTitle = String(summary.evidenceLabelTitle || '').trim()
  if (!labelTitle) return fallbackTitle
  return `${name} ${kind} Guide | ${labelTitle}`
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    image: `${SITE_URL}/og-default.jpg`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    logo: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl(LOGO_PATH),
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://twitter.com/HippieScientist',
      'https://www.instagram.com/thehippiescientist',
      'https://www.youtube.com/@HippieScientist',
    ],
  }
}

export type BlogJsonLdPost = {
  title: string
  slug: string
  date: string
  updated?: string
  description?: string
  excerpt?: string
  image?: string
}

export function blogJsonLd(post: BlogJsonLdPost, path: string) {
  const canonicalPath = withLeadingSlash(path)
  const url = new URL(canonicalPath, SITE_URL).toString()

  const description = post.description || post.excerpt || ''
  const published = new Date(post.date).toISOString()
  const modified = post.updated ? new Date(post.updated).toISOString() : published

  const imageUrl = post.image
    ? isAbsoluteUrl(post.image)
      ? post.image
      : new URL(withLeadingSlash(post.image), SITE_URL).toString()
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': ['BlogPosting', 'Article'],
    headline: post.title,
    description,
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: url,
    url,
    image: imageUrl,
    author: {
      '@type': 'Person',
      name: 'Will Thomas',
      url: `${SITE_URL}/about/`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(LOGO_PATH),
      },
    },
  }
}

export type HerbJsonLdArgs = {
  name: string
  slug: string
  description?: string
  latinName?: string
  image?: string
  breadcrumbId?: string
  governedSummary?: GovernedSummarySignals
  evidenceGrade?: string
  safetyNotes?: string
  primaryEffects?: string[]
}

export function herbJsonLd(herb: HerbJsonLdArgs) {
  const name = formatDisplayLabel(herb.name)
  const description = herb.description || `${name} evidence profile, benefits, safety, and traditional context.`
  const canonical = `${SITE_URL}/herbs/${herb.slug}/`

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Article', 'MedicalWebPage'],
        '@id': `${canonical}#article`,
        headline: `${name} Herb Profile`,
        description,
      },
      {
        '@type': 'BreadcrumbList',
      },
    ],
  }

  graph['@graph'].push({

import type { Metadata } from 'next'
import { getRuntimeVisibility } from './runtime-visibility'
import { formatDisplayLabel, list } from '@/lib/display-utils'
import { getEvidenceLabel } from '@/lib/evidence'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import {
  CORE_INDEXABLE_ROUTES,
  CURATED_INDEXABLE_COMPOUND_SLUGS,
  CURATED_INDEXABLE_HERB_SLUGS,
  MONEY_ENTRY_ROUTES,
} from '@/lib/index-allowlist'

import { TOTAL_PROFILE_COUNT } from '@/lib/profile-counts'

export { SITE_URL, SITE_NAME }
export const SEO_YEAR = '2026'
export const DEFAULT_OG_IMAGE = '/og-default.jpg'
export const TWITTER_HANDLE = '@HippieScientist'
export const DEFAULT_TITLE = 'The Hippie Scientist – Evidence-Based Herb & Supplement Research'
export const DEFAULT_DESCRIPTION = `The Hippie Scientist — evidence-first reference for herbs, supplements, and compounds. Mechanism, safety, and practical context for ${TOTAL_PROFILE_COUNT}+ profiles.`
export const DEFAULT_TITLE_TEMPLATE = `%s | ${SITE_NAME}`
export const SITEMAP_URL_CAP = 450

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

export type BuildPageMetadataArgs = BuildMetaArgs & {
  openGraphType?: 'website' | 'article'
  robots?: Metadata['robots']
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  keepQueryParams = [],
  openGraphType = 'website',
  robots,
}: BuildPageMetadataArgs): Metadata {
  const meta = buildMeta({ title, description, path, image, keepQueryParams })
  const fullTitle = title || DEFAULT_TITLE
  const fullDesc = description || DEFAULT_DESCRIPTION
  return {
    title: fullTitle,
    description: fullDesc,
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
  if (summary.length < 250) return false

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
  ])
  if (!supportingContext) return false

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
    noindexSignal && /^(sitemap_included|robots|indexability_status|runtime_export_decision)=/.test(noindexSignal)
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

  if (hardNoindexSignal) {
    return { index: false, follow: true, reason: hardNoindexSignal, priority: 0 }
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
    if (hasExplicitPublishSignal(pageData)) {
      return { index: true, follow: true, reason: 'indexability-policy-publish', priority: 0.6 }
    }
    if ((CURATED_INDEXABLE_HERB_SLUGS as readonly string[]).includes(slug)) {
      return { index: true, follow: true, reason: 'curated-herb-allowlist', priority: 0.7 }
    }
    if (passesGeneratedProfileQualityGate(pageData)) {
      return { index: true, follow: true, reason: 'generated-profile-quality-gate', priority: 0.6 }
    }
    return { index: false, follow: true, reason: 'generated-herb-quality-gate-failed', priority: 0 }
  }

  if (/^\/compounds\/[^/]+$/.test(normalizedPath)) {
    const slug = normalizedPath.split('/').pop() || ''
    if (hasExplicitPublishSignal(pageData)) {
      return { index: true, follow: true, reason: 'indexability-policy-publish', priority: 0.6 }
    }
    if ((CURATED_INDEXABLE_COMPOUND_SLUGS as readonly string[]).includes(slug)) {
      return { index: true, follow: true, reason: 'curated-compound-allowlist', priority: 0.7 }
    }
    if (passesGeneratedProfileQualityGate(pageData)) {
      return { index: true, follow: true, reason: 'generated-profile-quality-gate', priority: 0.6 }
    }
    return { index: false, follow: true, reason: 'generated-compound-quality-gate-failed', priority: 0 }
  }

  if (/^\/(learn|education|compare|stacks|psychoactive)\/[^/]+$/.test(normalizedPath)) {
    return { index: true, follow: true, reason: 'supporting-detail-route', priority: 0.6 }
  }

  return { index: false, follow: true, reason: 'not-priority-index-route', priority: 0 }
}

export function routePriority(path: string, pageData?: Record<string, unknown> | null): number {
  return shouldIndexRoute(path, pageData).priority
}

export function productJsonLd(args: {
  name: string
  description: string
  url: string
  price?: number | string
  priceCurrency?: string
}) {
  const priceNum = typeof args.price === 'string' ? parseFloat(args.price) : args.price

  if (typeof priceNum !== 'number' || isNaN(priceNum) || priceNum <= 0 || !args.priceCurrency) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: args.name,
    description: args.description,
    url: args.url,
    offers: {
      '@type': 'Offer',
      price: priceNum,
      priceCurrency: args.priceCurrency,
      url: args.url,
      availability: 'https://schema.org/OnlineOnly',
    },
  }
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
      url: `${SITE_URL}/logo.png`,
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

type BlogJsonLdPost = {
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
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: new URL('/logo.svg', SITE_URL).toString(),
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
  const url = `${SITE_URL}/herbs/${herb.slug}/`
  const governed = herb.governedSummary
  const hasGoverned = Boolean(governed?.enrichedAndReviewed)
  const hasPart = hasGoverned
    ? [
        { name: 'Evidence summary' },
        governed?.supportedUseCoveragePresent ? { name: 'Supported and unclear uses' } : null,
        governed?.safetyCautionsPresent ? { name: 'Safety, interactions, and contraindications' } : null,
        governed?.mechanismOrConstituentCoveragePresent
          ? { name: 'Constituents and mechanisms' }
          : null,
        governed?.conflictingEvidence ? { name: 'Uncertainty and conflict notes' } : null,
      ].filter(Boolean)
    : []
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalWebPage', 'WebPage'],
    name: `${herb.name} Herb Guide`,
    headline: `${herb.name} Herb Guide`,
    description:
      herb.description || `${herb.name} herb profile — effects, safety, and pharmacology.`,
    url,
    mainEntityOfPage: url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    medicalAudience: 'Consumer',
    aspect: ['treatment', 'safety', 'pharmacology', 'efficacy'],
    ...(herb.breadcrumbId ? { breadcrumb: { '@id': herb.breadcrumbId } } : {}),
    ...(hasGoverned
      ? {
          about: {
            '@type': 'MedicalTherapy',
            name: herb.latinName || herb.name,
            description: `Governed review: ${String(
              governed?.evidenceLabelTitle || governed?.evidenceLabel || 'insufficient evidence',
            ).toLowerCase()}. Educational reference only.`,
            ...(herb.evidenceGrade ? { evidenceLevel: herb.evidenceGrade } : {}),
            ...(herb.safetyNotes ? { safetyWarnings: herb.safetyNotes } : {}),
          },
          ...(hasPart.length ? { hasPart } : {}),
        }
      : {
          about: {
            '@type': 'MedicalTherapy',
            name: herb.latinName || herb.name,
            ...(herb.evidenceGrade ? { evidenceLevel: herb.evidenceGrade } : {}),
            ...(herb.safetyNotes ? { safetyWarnings: herb.safetyNotes } : {}),
          },
        }),
    ...(herb.image ? { image: herb.image } : {}),
  }
}

export type CompoundJsonLdArgs = {
  name: string
  slug: string
  description?: string
  category?: string
  breadcrumbId?: string
  governedSummary?: GovernedSummarySignals
  evidenceGrade?: string
  safetyNotes?: string
  // Phase-1-ready molecular identifiers. When any are present the `about` node
  // upgrades from a generic ChemicalSubstance to a MolecularEntity with formula,
  // CAS/PubChem identifiers, and a PubChem sameAs link. Until the workbook
  // populates these columns they are undefined and the schema is unchanged.
  pubchemCid?: string | number
  casNumber?: string
  molecularFormula?: string
}

export function compoundJsonLd(compound: CompoundJsonLdArgs) {
  const url = `${SITE_URL}/compounds/${compound.slug}/`
  const governed = compound.governedSummary
  const hasGoverned = Boolean(governed?.enrichedAndReviewed)

  // Upgrade to MolecularEntity only when concrete molecular identifiers exist.
  const hasMolecularData = Boolean(
    compound.molecularFormula || compound.pubchemCid || compound.casNumber,
  )
  const compoundAboutType = hasMolecularData
    ? ['MolecularEntity', 'ChemicalSubstance']
    : 'ChemicalSubstance'
  const molecularIdentifiers: Array<Record<string, string>> = []
  if (compound.casNumber) {
    molecularIdentifiers.push({ '@type': 'PropertyValue', propertyID: 'CAS', value: String(compound.casNumber) })
  }
  if (compound.pubchemCid) {
    molecularIdentifiers.push({ '@type': 'PropertyValue', propertyID: 'PubChem CID', value: String(compound.pubchemCid) })
  }
  const molecularSameAs = compound.pubchemCid
    ? [`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.pubchemCid}`]
    : []
  const hasPart = hasGoverned
    ? [
        { name: 'Evidence summary' },
        governed?.supportedUseCoveragePresent ? { name: 'Supported and unclear uses' } : null,
        governed?.safetyCautionsPresent ? { name: 'Safety, interactions, and contraindications' } : null,
        governed?.mechanismOrConstituentCoveragePresent
          ? { name: 'Constituents and mechanisms' }
          : null,
        governed?.conflictingEvidence ? { name: 'Uncertainty and conflict notes' } : null,
      ].filter(Boolean)
    : []
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalWebPage', 'WebPage'],
    name: `${compound.name} Compound Guide`,
    headline: `${compound.name} Compound Guide`,
    description:
      compound.description || `${compound.name} pharmacology, effects, and safety profile.`,
    url,
    mainEntityOfPage: url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    medicalAudience: 'Consumer',
    aspect: ['treatment', 'safety', 'pharmacology', 'efficacy'],
    ...(compound.breadcrumbId ? { breadcrumb: { '@id': compound.breadcrumbId } } : {}),
    about: {
      '@type': compoundAboutType,
      name: compound.name,
      ...(compound.category ? { description: compound.category } : {}),
      ...(hasGoverned
        ? {
            disambiguatingDescription: `Governed review: ${String(
              governed?.evidenceLabelTitle || governed?.evidenceLabel || 'insufficient evidence',
            ).toLowerCase()}. Educational reference only.`,
          }
        : {}),
      ...(compound.evidenceGrade ? { evidenceLevel: compound.evidenceGrade } : {}),
      ...(compound.safetyNotes ? { safetyWarnings: compound.safetyNotes } : {}),
      ...(compound.molecularFormula ? { molecularFormula: compound.molecularFormula } : {}),
      ...(molecularIdentifiers.length
        ? { identifier: molecularIdentifiers.length === 1 ? molecularIdentifiers[0] : molecularIdentifiers }
        : {}),
      ...(molecularSameAs.length ? { sameAs: molecularSameAs } : {}),
    },
    ...(hasPart.length ? { hasPart } : {}),
  }
}

export function breadcrumbJsonLd(
  crumbs: Array<{ name: string; url: string }>,
  options?: { id?: string },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...(options?.id ? { '@id': options.id } : {}),
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

export function collectionPageJsonLd(args: {
  title: string
  description: string
  path: string
  itemListId?: string
  breadcrumbId?: string
  governedSummary?: {
    governedReviewedCount: number
    safetySignalsPresentCount: number
  } | null
}) {
  const url = toAbsoluteUrl(args.path)
  return {
    '@context': 'https://schema.org',
    '@type': ['CollectionPage', 'WebPage'],
    name: args.title,
    description: args.description,
    url,
    mainEntityOfPage: url,
    ...(args.breadcrumbId ? { breadcrumb: { '@id': args.breadcrumbId } } : {}),
    ...(args.governedSummary
      ? {
          abstract: `Governed coverage across ${
            args.governedSummary.governedReviewedCount
          } reviewed profiles with ${
            args.governedSummary.safetySignalsPresentCount
          } safety-signal profiles.`,
        }
      : {}),
    ...(args.itemListId
      ? {
          mainEntity: {
            '@id': args.itemListId,
          },
        }
      : {}),
  }
}

export function itemListJsonLd(args: {
  id?: string
  name: string
  path: string
  items: Array<{ name: string; url: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(args.id ? { '@id': args.id } : {}),
    name: args.name,
    url: toAbsoluteUrl(args.path),
    numberOfItems: args.items.length,
    itemListElement: args.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: toAbsoluteUrl(item.url),
    })),
  }
}

export function faqPageJsonLd(args: {
  pagePath: string
  questions: Array<{ question: string; answer: string }>
}) {
  if (!args.questions.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: args.questions.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    url: toAbsoluteUrl(args.pagePath),
  }
}

export function commonSupplementFaqJsonLd(pagePath: string) {
  return faqPageJsonLd({
    pagePath,
    questions: [
      {
        question: 'Does it work?',
        answer:
          'Effects vary by person and evidence quality. Review the page evidence section and discuss options with a qualified clinician.',
      },
      {
        question: 'How much to take?',
        answer:
          'There is no one-size-fits-all dose. Use product labeling as a baseline and confirm a personalized plan with a clinician.',
      },
      {
        question: 'Is it safe?',
        answer:
          'Safety depends on your health status, medications, and dose. Check interactions and contraindications before use and seek professional advice.',
      },
    ],
  })
}

/**
 * Boilerplate answers that should NOT be emitted as FAQ JSON-LD. Gating on these
 * prevents Google from seeing placeholder Q&A (which can't earn rich results and
 * dilutes the page's real content signals). Compared case-insensitively by prefix.
 */
export const FAQ_FALLBACK_ANSWERS: string[] = [
  'See dosing guidelines and product labeling.',
  'Review personal medications, pregnancy status, chronic conditions, and clinician guidance before use.',
  'Review medications, pregnancy status, chronic conditions, and clinician guidance before use.',
  'See the page evidence section',
]

/** True when an FAQ answer is substantive enough to publish as structured data. */
export function isMeaningfulFaqAnswer(answer: unknown): boolean {
  const normalized = String(answer ?? '').trim()
  if (normalized.length <= 50) return false
  const lower = normalized.toLowerCase()
  return !FAQ_FALLBACK_ANSWERS.some((fallback) =>
    lower.startsWith(fallback.toLowerCase().slice(0, 40)),
  )
}

/** Common-name-first display name: strips a trailing Latin parenthetical. */
function getProfileDisplayName(record: any): string {
  const raw = String(record?.name || record?.slug || '')
  const commonName = raw.replace(/\s*\([^)]*\)\s*$/, '').trim()
  return (
    formatDisplayLabel(record?.displayName) ||
    formatDisplayLabel(commonName || raw) ||
    formatDisplayLabel(record?.slug) ||
    (record ? 'Profile' : '')
  )
}

function getProfileEvidenceLabel(record: any): string {
  return formatDisplayLabel(
    record?.evidenceLevel ||
      record?.evidence_tier ||
      record?.evidenceTier ||
      record?.evidence_grade ||
      getEvidenceLabel(record),
  )
}

/** Keyword-first title formula (manual `meta_title` overrides via precedence). */
export function formatProfileTitle(displayName: string, type: 'herb' | 'compound'): string {
  return type === 'herb'
    ? `${displayName} Benefits, Dosage & Safety`
    : `${displayName} Dosage, Effects & Safety: What the Evidence Says`
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeProfileNameInText(value: string, displayName: string): string {
  if (!value || !displayName) return value

  const pattern = escapeRegExp(displayName)
    .replace(/\\-/g, '[-\\s]+')
    .replace(/ /g, '[\\s-]+')

  return value.replace(new RegExp(`\\b${pattern}\\b`, 'gi'), displayName)
}

function getSafeProfileTitleOverride(record: any, displayName: string, type: 'herb' | 'compound'): string {
  const rawTitle = String(record?.meta_title || record?.metaTitle || record?.seoTitle || record?.seo_title || '').trim()
  const lowerTitle = rawTitle.toLowerCase()
  const slug = String(record?.slug || '').toLowerCase()

  if (type === 'herb' && slug === 'ashwagandha' && /sleep support/.test(lowerTitle)) {
    return `${displayName} for Stress: Evidence and Safety`
  }

  if (!rawTitle || /for uses:|unknown|placeholder|research pending/i.test(rawTitle)) {
    return ''
  }

  return normalizeProfileNameInText(rawTitle, displayName)
}

/** Intent-driven meta description formula (manual `meta_description` overrides). */
export function formatProfileDescription(
  record: any,
  displayName: string,
  type: 'herb' | 'compound',
): string {
  const evidence = getProfileEvidenceLabel(record)
  const primaryUse = list(
    record?.primary_effects || record?.primaryEffects || record?.effects || record?.useContexts || [],
  )
    .map((effect: string) => formatDisplayLabel(effect).toLowerCase())
    .filter(Boolean)[0]

  const evidenceClause = evidence ? ` ${evidence} research evidence.` : ''
  const raw =
    type === 'herb'
      ? `${displayName} dosage ranges, effects, drug interactions, and harm-reduction safety guide${
          primaryUse ? ` for ${primaryUse}` : ''
        }.${evidenceClause}`
      : `${displayName} dosage by use case, onset and duration, safety limits, and interactions${
          primaryUse ? ` for ${primaryUse}` : ''
        }, graded against research.${evidenceClause}`

  const fallback =
    type === 'herb'
      ? `${displayName} effects, dosage, drug interactions, and harm-reduction safety guide.`
      : `${displayName} dosage, effects, onset, and safety graded against research evidence.`

  return formatMetaDescription(raw, fallback, 160)
}

export function generateDetailMetadata(record: any, type: 'herb' | 'compound'): Metadata {
  const displayName = getProfileDisplayName(record)

  // Title Priority:
  // 1. meta_title
  // 2. seoTitle
  // 3. keyword-first generated title
  // 4. fallback entity/page title
  const title = getSafeProfileTitleOverride(record, displayName, type) ||
                formatProfileTitle(displayName, type) ||
                displayName

  // Description Priority:
  // 1. meta_description
  // 2. existing description/metaDescription
  // 3. keyword-first generated description
  // 4. safe fallback description
  const keywordFirstDescription = formatProfileDescription(record, displayName, type)
  const safeFallbackDescription = type === 'herb'
    ? `${displayName} effects, dosage, drug interactions, and harm-reduction safety guide.`
    : `${displayName} dosage, effects, onset, and safety graded against research evidence.`

  const rawDescription = (record.meta_description || record.metaDescription || '').trim() ||
                         (record.description || record.metaDescription || '').trim()
  const description = normalizeProfileNameInText(rawDescription, displayName) ||
                      keywordFirstDescription ||
                      safeFallbackDescription

  const path = `/${type === 'herb' ? 'herbs' : 'compounds'}/${record.slug}`
  const meta = buildMeta({ title, description, path })

  const visibility = getRuntimeVisibility(record)
  const indexDecision = shouldIndexRoute(path, record)

  return buildPageMetadata({
    title: meta.title,
    description: meta.description,
    path,
    image: `/og/${type === 'herb' ? 'herbs' : 'compounds'}/${record.slug}.png`,
    openGraphType: 'article',
    robots: visibility.canIndex && indexDecision.index
      ? undefined
      : {
          index: false,
          follow: true,
        },
  })
}


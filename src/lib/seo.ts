import type { Metadata } from 'next'
import { getRuntimeVisibility } from './runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { getEvidenceLabel } from '@/lib/evidence'

export const SITE_URL = 'https://thehippiescientist.net'
export const SITE_NAME = 'The Hippie Scientist'
export const TWITTER_HANDLE = '@thehippiescientist'

export type PageType = 'website' | 'article'

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

const NON_CANONICAL_PARAM_PATTERNS: RegExp[] = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^msclkid$/i,
  /^ref$/i,
  /^source$/i,
]

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
  return `${url.pathname}${search ? `?${search}` : ''}`
}

export function buildMeta({
  title,
  description,
  path = '/',
  image = '/icon-512x512.png',
  keepQueryParams = [],
}: BuildMetaArgs): NormalizedMeta {
  const canonicalPath = normalizeCanonicalPath(path, keepQueryParams)
  const url = toAbsoluteUrl(canonicalPath)

  const fallbackImage = image || '/icon-512x512.png'
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
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/herbs?query={search_term_string}`,
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
    logo: `${SITE_URL}/logo.svg`,
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
    '@type': 'BlogPosting',
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
  const url = `${SITE_URL}/herbs/${herb.slug}`
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
            ...(herb.primaryEffects ? { duplicateTherapy: herb.primaryEffects } : {}),
          },
          ...(hasPart.length ? { hasPart } : {}),
        }
      : {
          about: {
            '@type': 'MedicalTherapy',
            name: herb.latinName || herb.name,
            ...(herb.evidenceGrade ? { evidenceLevel: herb.evidenceGrade } : {}),
            ...(herb.safetyNotes ? { safetyWarnings: herb.safetyNotes } : {}),
            ...(herb.primaryEffects ? { duplicateTherapy: herb.primaryEffects } : {}),
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
}

export function compoundJsonLd(compound: CompoundJsonLdArgs) {
  const url = `${SITE_URL}/compounds/${compound.slug}`
  const governed = compound.governedSummary
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
    name: `${compound.name} Compound Guide`,
    description:
      compound.description || `${compound.name} pharmacology, effects, and safety profile.`,
    url,
    mainEntityOfPage: url,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    medicalAudience: 'Consumer',
    aspect: ['treatment', 'safety', 'pharmacology', 'efficacy'],
    ...(compound.breadcrumbId ? { breadcrumb: { '@id': compound.breadcrumbId } } : {}),
    about: {
      '@type': 'ChemicalSubstance',
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

export function generateDetailMetadata(record: any, type: 'herb' | 'compound'): Metadata {
  const displayName = formatDisplayLabel(record.name || record.slug)
  const evidence = formatDisplayLabel(record.evidenceLevel || record.evidence_tier || record.evidenceTier || record.evidence_grade || getEvidenceLabel(record))

  // Construct premium, intent-aware titles
  let titleSuffix = type === 'herb' ? 'Herb Profile: Benefits, Effects & Safety' : 'Benefits, Effects & Safety'
  if (evidence.toLowerCase().includes('strong') || evidence.toLowerCase().includes('moderate') || evidence.toLowerCase().includes('human')) {
    titleSuffix += ' | Evidence-Based Guide'
  } else if (evidence.toLowerCase().includes('traditional')) {
    titleSuffix += ' | Traditional Use Guide'
  } else {
    titleSuffix += ' | The Hippie Scientist'
  }
  const title = `${displayName} ${titleSuffix}`

  // Construct dynamic description
  const cleanDesc = cleanSummary(record.summary || record.description || '', type)
  const firstSentence = cleanDesc.match(/[^.!?]+[.!?]+/)?.[0] || cleanDesc

  const safetyNotes = text(record.safetyNotes || record.safety_notes || record.safety).toLowerCase()
  let safetySnippet = ''
  if (safetyNotes.includes('avoid') || safetyNotes.includes('caution') || safetyNotes.includes('interaction')) {
    safetySnippet = ' Review safety and drug interactions before use.'
  }

  const rawDescription = `${firstSentence} Rated with ${evidence.toLowerCase()}.` + safetySnippet + ' Educational reference only.'
  const description = formatMetaDescription(rawDescription, `${displayName} effects, mechanisms, dosage, and safety.`, 155)

  const path = `/${type === 'herb' ? 'herbs' : 'compounds'}/${record.slug}`
  const meta = buildMeta({
    title,
    description,
    path,
  })

  const visibility = getRuntimeVisibility(record)

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      url: meta.url,
      images: [meta.image],
    },
    robots: visibility.canIndex
      ? undefined
      : {
          index: false,
          follow: true,
        },
  }
}


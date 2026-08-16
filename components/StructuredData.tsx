import JsonLd from './seo/JsonLd'
import { SITE_URL } from '@/src/lib/site'
import {
  AUTHOR_NAME,
  AUTHOR_SCHEMA_ID,
  AUTHOR_URL,
  ORGANIZATION_SCHEMA_ID,
  WEBSITE_SCHEMA_ID,
  organizationSchemaIdentity,
} from '@/src/lib/schema-identities'

const MIN_FAQ_SCHEMA_ITEMS = 2

const FAQ_FALLBACK_ANSWER_PREFIXES = [
  'See dosing guidelines and product labeling.',
  'Review personal medications, pregnancy status, chronic conditions, and clinician guidance before use.',
  'Review medications, pregnancy status, chronic conditions, and clinician guidance before use.',
  'See the page evidence section',
]

function hasFileExtension(pathname: string): boolean {
  const finalSegment = pathname.split('/').pop() ?? ''
  return /\.[a-z0-9]+$/i.test(finalSegment)
}

function normalizeCanonicalUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed

  try {
    const url = new URL(trimmed, SITE_URL)

    // Preserve third-party URLs exactly as supplied. Internal page routes use
    // the site's trailing-slash canonical convention, while root and assets do not.
    if (url.origin !== SITE_URL) return trimmed
    if (url.pathname !== '/' && !url.pathname.endsWith('/') && !hasFileExtension(url.pathname)) {
      url.pathname = `${url.pathname}/`
    }

    return url.toString()
  } catch {
    return trimmed
  }
}

export interface FAQItem {
  question: string
  answer: string
}

export interface BreadcrumbItem {
  label: string
  href: string
}

export interface StructuredDataProps {
  pageUrl: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  /** Reserved for backward compatibility. The canonical author identity is site-governed. */
  authorName?: string
  image?: string
  faqs?: FAQItem[]
  breadcrumbs?: BreadcrumbItem[]
  zone?: 'monetized' | 'harm-reduction'
}

function isMeaningfulFaq(faq: FAQItem): boolean {
  const question = String(faq.question || '').trim()
  const answer = String(faq.answer || '').trim()
  if (question.length < 12 || answer.length <= 50) return false

  const lowerAnswer = answer.toLowerCase()
  return !FAQ_FALLBACK_ANSWER_PREFIXES.some((fallback) =>
    lowerAnswer.startsWith(fallback.toLowerCase().slice(0, 40)),
  )
}

export default function StructuredData({
  pageUrl,
  headline,
  description,
  datePublished,
  dateModified,
  authorName = AUTHOR_NAME,
  image = `${SITE_URL}/og-default.jpg`,
  faqs,
  breadcrumbs,
  zone = 'harm-reduction',
}: StructuredDataProps) {
  const schemas: Record<string, unknown>[] = []
  const canonicalPageUrl = normalizeCanonicalUrl(pageUrl)

  const isMonetized = zone === 'monetized'
  const meaningfulFaqs = faqs?.filter(isMeaningfulFaq) ?? []
  const hasFaqSchema = meaningfulFaqs.length >= MIN_FAQ_SCHEMA_ITEMS
  const hasBreadcrumbs = Boolean(breadcrumbs?.length)
  const webpageId = isMonetized ? `${canonicalPageUrl}#supplement` : `${canonicalPageUrl}#webpage`
  const breadcrumbId = `${canonicalPageUrl}#breadcrumb`
  const faqId = `${canonicalPageUrl}#faq`
  const author = {
    '@type': 'Person',
    '@id': AUTHOR_SCHEMA_ID,
    name: authorName,
    url: AUTHOR_URL,
  }
  const publisher = organizationSchemaIdentity()

  if (isMonetized) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': ['DietarySupplement', 'WebPage'],
      '@id': webpageId,
      name: headline,
      headline,
      description,
      image,
      url: canonicalPageUrl,
      datePublished,
      dateModified: dateModified ?? datePublished,
      author,
      publisher,
      isPartOf: { '@id': WEBSITE_SCHEMA_ID },
      ...(hasBreadcrumbs ? { breadcrumb: { '@id': breadcrumbId } } : {}),
      ...(hasFaqSchema ? { hasPart: { '@id': faqId } } : {}),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalPageUrl,
      },
    })
  } else {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': ['MedicalWebPage', 'Article'],
      '@id': webpageId,
      name: headline,
      headline,
      description,
      image,
      url: canonicalPageUrl,
      datePublished,
      dateModified: dateModified ?? datePublished,
      ...(dateModified ? { lastReviewed: dateModified } : {}),
      author,
      publisher,
      isPartOf: { '@id': WEBSITE_SCHEMA_ID },
      ...(hasBreadcrumbs ? { breadcrumb: { '@id': breadcrumbId } } : {}),
      ...(hasFaqSchema ? { hasPart: { '@id': faqId } } : {}),
      // Educational research content is not a clinical service. Avoid Patient
      // audience markup that could imply a clinician-patient relationship.
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalPageUrl,
      },
    })
  }

  if (hasFaqSchema) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': faqId,
      url: canonicalPageUrl,
      isPartOf: { '@id': webpageId },
      mainEntity: meaningfulFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    })
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.label,
        item: normalizeCanonicalUrl(crumb.href),
      })),
    })
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <JsonLd key={i} schema={schema} />
      ))}
    </>
  )
}

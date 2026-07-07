import JsonLd from './seo/JsonLd'

const SITE_URL = 'https://thehippiescientist.net'
const SITE_NAME = 'The Hippie Scientist'
const DEFAULT_AUTHOR = 'Will Thomas'
const MIN_FAQ_SCHEMA_ITEMS = 2

const FAQ_FALLBACK_ANSWER_PREFIXES = [
  'See dosing guidelines and product labeling.',
  'Review personal medications, pregnancy status, chronic conditions, and clinician guidance before use.',
  'Review medications, pregnancy status, chronic conditions, and clinician guidance before use.',
  'See the page evidence section',
]

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
  authorName = DEFAULT_AUTHOR,
  image = `${SITE_URL}/og-default.jpg`,
  faqs,
  breadcrumbs,
  zone = 'harm-reduction',
}: StructuredDataProps) {
  const schemas: Record<string, unknown>[] = []

  const isMonetized = zone === 'monetized'
  const meaningfulFaqs = faqs?.filter(isMeaningfulFaq) ?? []

  if (isMonetized) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': ['DietarySupplement', 'WebPage'],
      '@id': `${pageUrl}#supplement`,
      name: headline,
      headline,
      description,
      image,
      url: pageUrl,
      datePublished,
      dateModified: dateModified ?? datePublished,
      author: {
        '@type': 'Person',
        name: authorName,
        url: `${SITE_URL}/info/about/`,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.svg`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
    })
  } else {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': ['MedicalWebPage', 'Article'],
      '@id': `${pageUrl}#webpage`,
      name: headline,
      headline,
      description,
      image,
      url: pageUrl,
      datePublished,
      dateModified: dateModified ?? datePublished,
      lastReviewed: dateModified ?? datePublished,
      author: {
        '@type': 'Person',
        name: authorName,
        url: `${SITE_URL}/info/about/`,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.svg`,
        },
      },
      medicalAudience: {
        '@type': 'MedicalAudience',
        audienceType: 'Patient',
      },
      reviewedBy: {
        '@type': 'Person',
        name: authorName,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
    })
  }

  // FAQPage should only be emitted when there are enough meaningful Q&A pairs
  // for rich-result eligibility. A one-item FAQ block creates avoidable schema
  // noise across thin/partial pages without adding search value.
  if (meaningfulFaqs.length >= MIN_FAQ_SCHEMA_ITEMS) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
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
      itemListElement: breadcrumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: crumb.label,
        item: crumb.href.startsWith('http') ? crumb.href : `${SITE_URL}${crumb.href}`,
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

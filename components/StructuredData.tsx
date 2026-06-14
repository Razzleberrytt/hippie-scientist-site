const SITE_URL = 'https://thehippiescientist.net'
const SITE_NAME = 'The Hippie Scientist'
const DEFAULT_AUTHOR = 'Will Thomas'

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
  faqs?: FAQItem[]
  breadcrumbs?: BreadcrumbItem[]
}

export default function StructuredData({
  pageUrl,
  headline,
  description,
  datePublished,
  dateModified,
  authorName = DEFAULT_AUTHOR,
  faqs,
  breadcrumbs,
}: StructuredDataProps) {
  const schemas: Record<string, unknown>[] = []

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${pageUrl}#webpage`,
    headline,
    description,
    url: pageUrl,
    datePublished,
    dateModified: dateModified ?? datePublished,
    lastReviewed: dateModified ?? datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
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

  if (faqs && faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
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
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

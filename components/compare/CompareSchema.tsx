import type { CompareItem } from '@/lib/compare'
import JsonLd from '@/components/seo/JsonLd'

const SITE_URL = 'https://thehippiescientist.net'

interface FAQItem {
  question: string
  answer: string
}

interface CompareSchemaProps {
  item1: CompareItem
  item2: CompareItem
  slug: string
  faqs: FAQItem[]
  dateModified?: string
  citationUrls?: string[]
}

export default function CompareSchema({ item1, item2, slug, faqs, dateModified, citationUrls = [] }: CompareSchemaProps) {
  const pageUrl = `${SITE_URL}/guides/compare/${slug}/`
  const headline = `${item1.name} vs ${item2.name}: Complete Comparison`
  const description = `Compare ${item1.name} and ${item2.name} by evidence, mechanisms, dosing, safety, and best-fit use cases.`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline,
        description,
        author: {
          '@type': 'Organization',
          name: 'The Hippie Scientist',
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Organization',
          name: 'The Hippie Scientist',
          url: SITE_URL,
        },
        ...(dateModified ? { dateModified } : {}),
        ...(citationUrls.length ? { citation: [...new Set(citationUrls)].filter(Boolean) } : {}),
        url: pageUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
        },
        about: [
          {
            '@type': item1.type === 'herb' ? 'MedicalTherapy' : 'ChemicalSubstance',
            name: item1.name,
            url: `${SITE_URL}/${item1.type === 'herb' ? 'herbs' : 'compounds'}/${item1.slug}/`,
          },
          {
            '@type': item2.type === 'herb' ? 'MedicalTherapy' : 'ChemicalSubstance',
            name: item2.name,
            url: `${SITE_URL}/${item2.type === 'herb' ? 'herbs' : 'compounds'}/${item2.slug}/`,
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/guides/compare/` },
          { '@type': 'ListItem', position: 3, name: `${item1.name} vs ${item2.name}`, item: pageUrl },
        ],
      },
      ...(faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  }

  return <JsonLd schema={schema} />
}

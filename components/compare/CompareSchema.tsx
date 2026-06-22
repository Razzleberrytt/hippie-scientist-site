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
}

export default function CompareSchema({ item1, item2, slug, faqs }: CompareSchemaProps) {
  const pageUrl = `${SITE_URL}/compare/${slug}`
  const headline = `${item1.name} vs ${item2.name}: Complete Comparison`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline,
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
        dateModified: '2026-06-22',
        url: pageUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/compare` },
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

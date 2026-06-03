import { text } from '@/lib/display-utils'

export function buildProfileSchema(record: any) {
  const name = text(record?.displayName || record?.name || record?.slug)
  const description = text(record?.summary || record?.description)

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name,
    description,
    about: {
      '@type': 'Substance',
      name,
    },
  }
}

export function buildFAQSchema(questions: { question: string; answer: string }[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

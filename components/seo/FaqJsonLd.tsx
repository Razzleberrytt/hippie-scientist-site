type FaqItem = {
  question: string
  answer: string
}

type FaqJsonLdProps = {
  items: FaqItem[]
}

export default function FaqJsonLd({ items }: FaqJsonLdProps) {
  if (!items?.length) {
    return null
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}

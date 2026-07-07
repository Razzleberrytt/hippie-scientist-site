import JsonLd from './JsonLd'

const MIN_FAQ_SCHEMA_ITEMS = 2

type FaqItem = {
  question: string
  answer: string
}

type FaqJsonLdProps = {
  items: FaqItem[]
}

function normalizeFaqItem(item: FaqItem): FaqItem | null {
  const question = String(item.question || '').trim()
  const answer = String(item.answer || '').trim()

  if (question.length < 12 || answer.length <= 50) {
    return null
  }

  return { question, answer }
}

function getMeaningfulFaqItems(items: FaqItem[]): FaqItem[] {
  const seenQuestions = new Set<string>()
  const meaningfulItems: FaqItem[] = []

  for (const item of items) {
    const normalized = normalizeFaqItem(item)
    if (!normalized) continue

    const questionKey = normalized.question.toLowerCase()
    if (seenQuestions.has(questionKey)) continue

    seenQuestions.add(questionKey)
    meaningfulItems.push(normalized)
  }

  return meaningfulItems
}

export default function FaqJsonLd({ items }: FaqJsonLdProps) {
  const meaningfulItems = getMeaningfulFaqItems(items ?? [])

  if (meaningfulItems.length < MIN_FAQ_SCHEMA_ITEMS) {
    return null
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: meaningfulItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return <JsonLd schema={schema} />
}

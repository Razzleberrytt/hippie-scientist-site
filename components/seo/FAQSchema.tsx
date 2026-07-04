/**
 * FAQ Structured Data Component
 *
 * Renders FAQPage JSON-LD for FAQ sections.
 * Use when a page has real FAQ content that should earn rich results.
 * Only emits when questions array is non-empty.
 */
import JsonLd from './JsonLd'

type FAQItem = { question: string; answer: string }

export default function FAQSchema({ questions, pagePath }: { questions: FAQItem[]; pagePath: string }) {
  if (!questions.length) return null

  const faqJsonLd = {
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
    url: `https://thehippiescientist.net${pagePath}`,
  }

  return <JsonLd schema={faqJsonLd} />
}
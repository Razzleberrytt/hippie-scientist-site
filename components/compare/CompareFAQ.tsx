import type { CompareItem } from '@/lib/compare'

interface CompareFAQProps {
  item1: CompareItem
  item2: CompareItem
}

export type FAQItem = {
  question: string
  answer: string
}

export function getCompareFaqs(item1: CompareItem, item2: CompareItem): FAQItem[] {
  const ashwagandha = item1.slug === 'ashwagandha' ? item1 : item2
  const rhodiola = item1.slug === 'rhodiola' ? item1 : item2

  return [
    {
      question: 'Which is better, ashwagandha or rhodiola?',
      answer: `${ashwagandha.name} is usually the calmer fit for stress and relaxation based on the current profile framing, while ${rhodiola.name} is usually the more energizing fit for stress resilience, fatigue, and focus. Neither is universally better.`,
    },
    {
      question: 'Can you take ashwagandha and rhodiola together?',
      answer: 'The current source data does not provide a combination protocol. Because both have active safety and interaction fields, it is more cautious to evaluate each one separately and ask a qualified clinician if you are pregnant, on medication, sensitive to supplements, or managing a medical condition.',
    },
    {
      question: 'Which works faster?',
      answer: 'The current herb records do not include onset-time fields, so this comparison does not claim which works faster.',
    },
    {
      question: 'Which is better for stress?',
      answer: `${ashwagandha.name} and ${rhodiola.name} both include stress in the source data. ${ashwagandha.name} also includes sleep support, while ${rhodiola.name} is framed around stress-related fatigue and mental stamina. The better fit depends on whether your stress feels more tense and calming-oriented or more fatigue-oriented.`,
    },
    {
      question: 'Which is better for energy and focus?',
      answer: `${rhodiola.name} is the more energy-oriented fit because its source record includes fatigue reduction and mental stamina language. The current data does not support a firm focus effect or a head-to-head performance claim.`,
    },
  ]
}

export default function CompareFAQ({ item1, item2 }: CompareFAQProps) {
  const faqs = getCompareFaqs(item1, item2)

  return (
    <section className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">FAQ</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Common questions</h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details key={faq.question} className="accordion-readable group">
            <summary className="cursor-pointer select-none">
              <span>{faq.question}</span>
              <span className="text-brand-700 transition-transform duration-200 group-open:rotate-180" aria-hidden="true">
                v
              </span>
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
